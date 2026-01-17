let busy = false;
let pending = null;

window.Fate.progress.init({ max: 100 });


/* =========================
   CLICK INTERCEPTOR
   ========================= */

document.addEventListener(
  "click",
  (e) => {
    if (busy) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const el = e.target.closest(
      "a,button,[role='button'],input[type='submit']"
    );
    if (!el) return;
    if (el.closest("#fate-overlay")) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    pending = describe(el);
    busy = true;

    showDice(async (fate, ui) => {
      /* =========================
         GOOD FATE (instant)
         ========================= */

      if (fate === window.Fate.Category.GOOD || fate === window.Fate.Category.VERY_GOOD) {
        const reply = await sendMessageAsync({
          type: "FATE_GET",
        });

        const narration =
          fate === window.Fate.Category.VERY_GOOD
            ? reply.narrations.very_good
            : reply.narrations.good;

        ui.setResult(fate, narration);

        await window.Fate.sleep(1500);
        ui.remove();
        perform(pending);
        cleanup();

        if (window.Fate.progress.get() >= window.Fate.progress._state.max) {
          chrome.runtime.sendMessage({ type: "FATE_INIT", progress: 0 });
          window.Fate.progress.set(0);
        }
        chrome.runtime.sendMessage({
          type: "FATE_CONSUMED",
          outcome: fate,
          progress: window.Fate.progress.get(),
        });

        return;
      }

      /* =========================
         BAD / VERY BAD
         ========================= */

      const punishment =
        fate === window.Fate.Category.VERY_BAD
          ? window.Fate.punishments.pickVeryBad()
          : window.Fate.punishments.pickBad();

      ui.setResult(fate, punishment?.message ?? "Bad luck.");
      
      await sendMessageAsync({
        type: "FATE_CONSUMED",
        outcome: punishment?.message ?? fate,
        progress: window.Fate.progress.get(),
      });

      await window.Fate.sleep(1500);
      ui.remove();

      if (punishment && typeof punishment.run === "function") {
        await punishment.run();
      }

      cleanup();
    });
  },
  true
);

/* =========================
   UI
   ========================= */

function showDice(onDone) {
  const initialSrc = chrome.runtime.getURL(
    "assets/diceroll-1/0001.png"
  );

  const overlay = document.createElement("div");
  overlay.id = "fate-overlay";
  overlay.innerHTML = `
    <div class="fate-card">
      <img id="dice-img" src="${initialSrc}" style="cursor:pointer" />
      <div class="fate-result" id="result" aria-live="polite"></div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  const diceImg = overlay.querySelector("#dice-img");
  const resultElem = overlay.querySelector("#result");

  const ui = {
    setResult(fate, text) {
      const u = window.Fate.FATE_UI[fate] ?? { className: "" };
      resultElem.textContent = text;
      resultElem.className = `fate-result show ${u.className}`;
    },
    remove() {
      overlay.remove();
    },
  };

  awaitUserClick(diceImg, async () => {
    await window.Fate.sleep(80);

    const roll =
      1 + Math.floor(Math.random() * window.Fate.DIE_SIZE);

    await playDiceOutcomeAnimation({
      imgEl: diceImg,
      outcome: roll,
      frameCount: 72,
      fps: 60,
    });

    const fate = window.Fate.evaluateFate(roll);

    // Progress update
    if (fate === window.Fate.Category.GOOD) {
      window.Fate.progress.add(10);
    } else if (fate === window.Fate.Category.VERY_GOOD) {
      window.Fate.progress.add(20);
    } else if (fate === window.Fate.Category.BAD) {
      window.Fate.progress.add(0);
    } else {
      window.Fate.progress.add(0);
    }

    

    await window.Fate.sleep(300);
    await onDone(fate, ui);
  });
}


/* =========================
   Helpers
   ========================= */

function awaitUserClick(el, fn) {
  const handler = async (e) => {
    e.stopPropagation();
    el.removeEventListener("click", handler);
    await fn();
  };
  el.addEventListener("click", handler, { once: true });
}

function sendMessageAsync(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
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
    imgEl.src = chrome.runtime.getURL(
      `assets/diceroll-${outcome}/${frame}.png`
    );
    await window.Fate.sleep(frameDelay);
  }
}

/* =========================
   Click replay
   ========================= */

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


chrome.runtime.sendMessage({
  type: "FATE_INIT",
  progress: window.Fate.progress.get(),
});
