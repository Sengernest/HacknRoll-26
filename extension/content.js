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

    showDice(async (fate, ui) => {
      if (fate === window.Fate.Category.GOOD) {
        ui.showMessage("Success!");
        await window.Fate.sleep(500);
        ui.remove();
        perform(pending);
        cleanup();
        return;
      }

      const p =
        fate === window.Fate.Category.VERY_BAD
          ? window.Fate.punishments.pickVeryBad()
          : window.Fate.punishments.pickBad();

      ui.showMessage(p?.message ?? "Bad luck.");
      await window.Fate.sleep(1500);
      ui.remove();

      if (p && typeof p.run === "function") {
        await p.run();
      }

      cleanup();
    });
  },
  true
); // capture phase

async function applyPunishment(fate, ui) {
  if (fate === window.Fate.Category.VERY_BAD) {
    await window.Fate.punishments.runVeryBad(ui);
    return;
  }

  if (fate === window.Fate.Category.BAD) {
    await window.Fate.punishments.runBad(ui);
    return;
  }
}

// UI
function showDice(onDone) {
  const overlay = document.createElement("div");
  overlay.id = "fate-overlay";
  overlay.innerHTML = `
    <div class="fate-card">
      <div>🎲 Roll to Click</div>
      <div class="fate-roll" id="roll">?</div>

      <div class="fate-result" id="result" aria-live="polite"></div>
      <div class="fate-msg" id="msg" aria-live="polite"></div>

      <button class="fate-btn" id="btn">Roll</button>
    </div>`;

  document.documentElement.appendChild(overlay);

  const rollElem = overlay.querySelector("#roll");
  const resultElem = overlay.querySelector("#result");
  const messageElem = overlay.querySelector("#msg");
  const button = overlay.querySelector("#btn");

  const ui = {
    showMessage(text) {
      messageElem.textContent = text ?? "";
    },
    setResult(fate) {
      const u = window.Fate.FATE_UI[fate] ?? { text: "???", className: "" };
      resultElem.textContent = u.text;
      resultElem.className = `fate-result show ${u.className}`;
    },
    remove() {
      overlay.remove();
    },
  };

  button.onclick = async () => {
    button.style.display = "none";
    const roll = 1 + Math.floor(Math.random() * window.Fate.DIE_SIZE);
    rollElem.textContent = String(roll);

    const fate = window.Fate.evaluateFate(roll);
    ui.setResult(fate);

    await window.Fate.sleep(50);
    await onDone(fate, ui);
  };
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
