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

    showDice((roll) => {
      // MVP rule: 1-2 block, 3-6 allow
      if (roll <= 2) {
        // blocked
        cleanup();
      } else {
        // allow original action
        perform(pending);
        cleanup();
      }
    });
  },
  true
); // capture phase

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

function showDice(onDone) {
  const overlay = document.createElement("div");
  overlay.id = "fate-overlay";
  overlay.innerHTML = `
    <div class="fate-card">
      <div>🎲 Roll to Click</div>
      <div class="fate-roll" id="roll">?</div>
      <button class="fate-btn" id="btn">Roll</button>
      <div style="opacity:.7;margin-top:8px;font-size:12px">1-2 block • 3-6 allow</div>
      <div class="fate-result" id="result" aria-live="polite"></div>
    </div>`
  ;

  document.documentElement.appendChild(overlay);

  overlay.querySelector("#btn").onclick = () => {
    const roll = 1 + Math.floor(Math.random() * 6);
    overlay.querySelector("#roll").textContent = String(roll);

    const ok = roll > 2;
    const result = overlay.querySelector("#result");
    result.textContent = ok ? "SUCCESS" : "BLOCKED";
    result.className = `fate-result ${ok ? "success" : "fail"} show`;

    setTimeout(() => {
      overlay.remove();
      onDone(roll);
    }, 500);
  };
}
