let busy = false;
let pending = null;

window.Fate.progress.init({ max: 100 });

chrome.runtime.getURL("assets/sounds/spinup.mp3")
const AudioFiles = {
  spinup: new Audio(chrome.runtime.getURL("assets/sounds/spinup.mp3")),
  success: new Audio(chrome.runtime.getURL("assets/sounds/success.mp3")),
  failure: new Audio(chrome.runtime.getURL("assets/sounds/failure.mp3")),
};

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

        console.log(reply);

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
          outcome: narration,
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
    <div class="fate-rollnum" id="rollnum"></div>

    <div class="fate-card">
      <img id="dice-img" src="${initialSrc}" style="cursor:pointer" />
      <button class="fate-btn" id="roll-btn">Roll</button>
      <div class="fate-result" id="result" aria-live="polite"></div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  const diceImg = overlay.querySelector("#dice-img");
  const rollBtn = overlay.querySelector("#roll-btn");
  const rollNumEl = overlay.querySelector("#rollnum");
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

  const roll = async () => {
    rollBtn.disabled = true;
    rollBtn.style.display = "none";
    diceImg.style.pointerEvents = "none";

    await window.Fate.sleep(80);

    const rollVal =
      1 + Math.floor(Math.random() * window.Fate.DIE_SIZE);

    const fate = window.Fate.evaluateFate(rollVal);

    await playDiceOutcomeAnimation({
      imgEl: diceImg,
      outcome: rollVal,
      frameCount: 72,
      fps: 60,
      fate
    });
    
    rollNumEl.textContent = "You rolled: " + String(rollVal);
    rollNumEl.style.display = "block";


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
  }

  rollBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    roll();
  }, { once: true });
  
  diceImg.addEventListener("click", (e) => {
    e.stopPropagation();
    roll();
  }, { once: true });

};  

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
  fate
}) {
  const frameDelay = 1000 / fps;
  let diceAudio = null;
  try {
    diceAudio = AudioFiles.spinup;
    diceAudio.volume = 0.5; // Adjust volume (0.0 to 1.0)
    diceAudio.play().catch((e) => {
      console.warn("Failed to play dice sound:", e);
    });
  } catch (e) {
    console.warn("Failed to load dice sound:", e);
  }

  for (let i = 1; i <= frameCount; i++) {
    const frame = String(i).padStart(4, "0");
    imgEl.src = chrome.runtime.getURL(
      `assets/diceroll-${outcome}/${frame}.png`
    );
    await window.Fate.sleep(frameDelay);
  }
  if (diceAudio) {
    diceAudio.pause();
    diceAudio.currentTime = 0;
  }
  if (fate === window.Fate.Category.GOOD) {
    diceAudio = AudioFiles.success;
  } else if (fate === window.Fate.Category.VERY_GOOD) {
    diceAudio = AudioFiles.failure;
  } else if (fate === window.Fate.Category.BAD) {
    diceAudio = AudioFiles.failure
  } else {
    diceAudio = AudioFiles.success;
  }
  try {
    diceAudio.volume = 0.5; // Adjust volume (0.0 to 1.0)
    diceAudio.play().catch((e) => {
      console.warn("Failed to play dice sound:", e);
    });
    } catch (e) {
      console.warn("Failed to load dice sound:", e);
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
