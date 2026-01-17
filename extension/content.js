let busy = false;
let pending = null;

document.addEventListener(
  "click",
  (e) => {
    if (busy) return;
    if (e.button !== 0) return; // left click only
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // don't break new tab etc

    const el = e.target.closest(
      "a,button,[role='button'],input[type='submit']"
    );
    if (!el) return;

    // ignore our own overlay
    if (el.closest("#fate-overlay")) return;

    // STOP the click
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    pending = describe(el);
    busy = true;

    showDice(async (fate) => {
      if (fate === window.Fate.Category.GOOD) {
        perform(pending);
      } else {
        await applyPunishment(fate);
      }
      cleanup();
    });
  },
  true
); // capture phase

async function applyPunishment(fate) {
  if (fate === window.Fate.Category.VERY_BAD) {
    await window.Fate.punishments.runVeryBad();
    return;
  }

  if (fate === window.Fate.Category.BAD) {
    await window.Fate.punishments.runBad();
    return;
  }
}

// UI
function showDice(onDone) {
  const overlay = document.createElement("div");
  overlay.id = "fate-overlay";

  const initialSrc = chrome.runtime.getURL(
    "assets/diceroll-1/0001.png"
  );

  overlay.innerHTML = `
    <div class="fate-fullscreen">
      <img id="dice-img" src="${initialSrc}" />

      <div class="fate-result" id="result" aria-live="polite"></div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  const diceImg = overlay.querySelector("#dice-img");
  const result = overlay.querySelector("#result");

  // Immediately roll (no button)
  (async () => {
    const roll =
      1 + Math.floor(Math.random() * window.Fate.DIE_SIZE);; // replace later with RNG

    await playDiceOutcomeAnimation({
      imgEl: diceImg,
      outcome: roll,
      frameCount: 72,
      fps: 60,
    });

    const fate = window.Fate.evaluateFate(roll);
    const { text, className } = window.Fate.FATE_UI[fate];

    result.textContent = `${text} (Rolled ${roll})`;
    result.className = `fate-result show ${className}`;

    await window.Fate.sleep(800);
    overlay.remove();
    await onDone(fate);
  })();
}




async function playDiceOutcomeAnimation({
  imgEl,
  outcome,
  frameCount = 72,
  fps = 60,
}) {
  const frameDelay = 1000 / fps;

  for (let i = 1; i <= frameCount; i++) {
    const frame = String(i).padStart(4, "0");
    const src = chrome.runtime.getURL(
      `assets/diceroll-${outcome}/${frame}.png`
    );

    imgEl.src = src;

    // DEBUG (temporary)
    // console.log("Loading frame:", src);

    await window.Fate.sleep(frameDelay);
  }
}


// =============
// Boilerplate
// =============

function cleanup() {
  pending = null;
  busy = false;
}

function describe(el) {
  if (el.tagName.toLowerCase() === "a") {
    return { type: "NAV", href: el.getAttribute("href"), el };
  }
  if (el.matches("input[type='submit']") && el.form) {
    return { type: "FORM", form: el.form };
  }
  return { type: "CLICK", el };
}

function perform(a) {
  if (!a) return;

  if (a.type === "NAV") {
    if (a.href && !a.href.startsWith("javascript:")) {
      window.location.href = a.href;
    } else {
      a.el.click();
    }
    return;
  }

  if (a.type === "FORM") {
    a.form.submit();
    return;
  }

  a.el.click();
}
