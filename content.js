import FateProgress from "./fateProgress.js";

/*************************************************
 * STATE
 *************************************************/

const FateState = {
  busy: false,
  pendingAction: null,
};

/*************************************************
 * INIT
 *************************************************/

FateProgress.init({
  max: 100,
  initial: 0,
});

attachClickInterceptor();

/*************************************************
 * CLICK INTERCEPTOR
 *************************************************/

function attachClickInterceptor() {
  document.addEventListener(
    "click",
    (e) => {
      if (!shouldIntercept(e)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      FateState.pendingAction = describeAction(e.target);
      FateState.busy = true;

      showDiceOverlay(async (roll) => {
        await resolveRoll(roll);
        cleanup();
      });
    },
    true
  );
}

function shouldIntercept(e) {
  if (FateState.busy) return false;
  if (e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;

  const el = e.target.closest(
    "a,button,[role='button'],input[type='submit']"
  );
  if (!el) return false;
  if (el.closest("#fate-overlay")) return false;

  return true;
}

/*************************************************
 * DICE RESOLUTION
 *************************************************/

async function resolveRoll(roll) {
  if (roll <= 2) {
    await window.Fate?.punishments?.runRandom?.();
    FateProgress.add(-5);
    return;
  }

  FateProgress.add(10);
  performAction(FateState.pendingAction);
}

/*************************************************
 * ACTION HANDLING
 *************************************************/

function describeAction(target) {
  const el = target.closest(
    "a,button,[role='button'],input[type='submit']"
  );
  if (!el) return null;

  if (el.tagName === "A") {
    return { type: "NAV", el, href: el.getAttribute("href") };
  }

  if (el.matches("input[type='submit']") && el.form) {
    return { type: "FORM", form: el.form };
  }

  return { type: "CLICK", el };
}

function performAction(action) {
  if (!action) return;

  switch (action.type) {
    case "NAV":
      if (action.href && !action.href.startsWith("javascript:")) {
        window.location.href = action.href;
      } else {
        action.el.click();
      }
      break;

    case "FORM":
      action.form.submit();
      break;

    case "CLICK":
      action.el.click();
      break;
  }
}

/*************************************************
 * DICE UI
 *************************************************/

function showDiceOverlay(onDone) {
  const overlay = document.createElement("div");
  overlay.id = "fate-overlay";

  overlay.innerHTML = `
    <div class="fate-card">
      <div class="fate-title">🎲 Roll to Act</div>
      <div class="fate-roll" id="fate-roll">?</div>
      <button id="fate-roll-btn">Roll</button>
      <div class="fate-rule">1–2 fail • 3–6 succeed</div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  overlay.querySelector("#fate-roll-btn").onclick = async () => {
    const roll = rollDice();
    overlay.querySelector("#fate-roll").textContent = roll;

    await sleep(400);
    overlay.remove();
    await onDone(roll);
  };
}

function rollDice(sides = 6) {
  return 1 + Math.floor(Math.random() * sides);
}

/*************************************************
 * UTIL
 *************************************************/

function cleanup() {
  FateState.pendingAction = null;
  FateState.busy = false;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
