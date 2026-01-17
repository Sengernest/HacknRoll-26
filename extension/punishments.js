window.Fate = window.Fate || {};
window.Fate.punishments = window.Fate.punishments || {};

// --- AI text pool (AI-only + instant display) ---
/*window.Fate.punishments._aiPool = [];
window.Fate.punishments._aiFilling = false;

window.Fate.punishments._refillAIPool = async function refillAIPool() {
  if (window.Fate.punishments._aiFilling) return;
  window.Fate.punishments._aiFilling = true;

  try {
    const resp = await fetch("http://localhost:3000/cursed-text-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ n: 5 }),
    });

    const data = await resp.json();
    const arr = data?.results;

    if (Array.isArray(arr) && arr.length) {
      window.Fate.punishments._aiPool.push(...arr);
    }
  } catch (e) {
    // ignore (server down etc)
  } finally {
    window.Fate.punishments._aiFilling = false;
  }
};

// prefill once at startup
window.Fate.punishments._refillAIPool();*/

//for freeze punishment
function playErrorSound() {
  try {
    const url = chrome.runtime.getURL("assets/sounds/errorclick.mp3");
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play();
  } catch (e) {
    // ignore if blocked
  }
}

//very bad punishments
window.Fate.punishments.veryBadList = [
  //fake loading
  async function punishFakeLoading() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "999999";
    overlay.textContent = "Loading...";
    document.body.appendChild(overlay);
    await window.Fate.sleep(10000);
    overlay.remove();
  },

  //flip screen
  async function punishFlip() {
    alert("💀 Bad luck! Your screen will be flipped for 10 seconds...");
    document.body.style.transform = "rotate(180deg)";
    await window.Fate.sleep(10000);
    document.body.style.transform = "";
  },

  //rick roll
  async function punishRickroll() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "999999";
    overlay.innerHTML = `
    <iframe width="1024" height="576"
      src="https://www.youtube.com/embed/klfT41uZniI?autoplay=1&controls=0&rel=0"
      title="YouTube video player" frameBorder="0"
      allow="autoplay; encrypted-media;"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen></iframe>
  `;
    document.body.appendChild(overlay);
  },

  // ✅ AI cursed text BUT instant: overlay now, AI text later
  /*async function punishCursedTextAI() {
    // ensure pool refills in background if low
    if (window.Fate.punishments._aiPool.length < 2) {
      window.Fate.punishments._refillAIPool();
    }

    // AI-only: pull from pool
    let text = window.Fate.punishments._aiPool.shift();

    // If pool empty, we must wait for AI (no local fallback)
    if (!text) {
      // Show a simple waiting overlay (not gibberish)
      const waitOverlay = document.createElement("div");
      waitOverlay.style.position = "fixed";
      waitOverlay.style.inset = "0";
      waitOverlay.style.zIndex = "999999";
      waitOverlay.style.background = "rgba(0,0,0,0.95)";
      waitOverlay.style.color = "#00ff99";
      waitOverlay.style.fontFamily = "monospace";
      waitOverlay.style.fontSize = "18px";
      waitOverlay.style.padding = "24px";
      waitOverlay.style.whiteSpace = "pre-wrap";
      waitOverlay.textContent = "⌛ summoning cursed text…";
      document.body.appendChild(waitOverlay);

      try {
        const resp = await fetch("http://localhost:3000", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nonce: Date.now() }),
        });
        const j = await resp.json();
        text = j?.text || "▓░█ ⟟ ⌁ ⌖ ⧖";
      } catch (e) {
        text = "▓░█ ⟟ ⌁ ⌖ ⧖";
      }

      waitOverlay.textContent = text;
      await window.Fate.sleep(2000);
      waitOverlay.remove();
      return;
    }

    // Show instantly from AI pool
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.background = "rgba(0,0,0,0.95)";
    overlay.style.color = "#00ff99";
    overlay.style.fontFamily = "monospace";
    overlay.style.fontSize = "18px";
    overlay.style.padding = "24px";
    overlay.style.whiteSpace = "pre-wrap";
    overlay.textContent = text;

    document.body.appendChild(overlay);
    await window.Fate.sleep(2000);
    overlay.remove();
  },*/
];

//bad punishments
window.Fate.punishments.badList = [
  //blur screen
  async function punishBlur() {
    alert("💀 Bad luck! Your screen will be blurred for 10 seconds...");
    document.body.style.filter = "blur(5px)";
    await window.Fate.sleep(10000);
    document.body.style.filter = "";
  },

  //invert colors
  async function punishInvert() {
    alert(
      "💀 Bad luck! The colors of your screen will be inverted for 10 seconds...",
    );
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    await window.Fate.sleep(10000);
    document.body.style.filter = "";
  },

  // freeze clicks + MP3 sound on attempt
  async function punishFreeze() {
    alert("💀 Bad luck! Your mouse clicks will be disabled for 10 seconds...");

    const blocker = document.createElement("div");
    blocker.style.position = "fixed";
    blocker.style.inset = "0";
    blocker.style.zIndex = "999999";
    document.body.appendChild(blocker);

    const onAttempt = (e) => {
      playErrorSound();
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    document.addEventListener("click", onAttempt, true);

    await window.Fate.sleep(10000);

    document.removeEventListener("click", onAttempt, true);
    blocker.remove();
  },

  /*close tab (DOES NOT WORK)
  async function punishCloseTab() {
    alert("💀 Fate has decided.");
    window.close(); // may or may not work
  },*/
];

//shuffling algo
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

window.Fate.punishments._badBag = [];
window.Fate.punishments._veryBadBag = [];

window.Fate.punishments.runBad = async function () {
  if (window.Fate.punishments._badBag.length === 0) {
    window.Fate.punishments._badBag = [...window.Fate.punishments.badList];
    shuffle(window.Fate.punishments._badBag);
  }
  const p = window.Fate.punishments._badBag.pop();
  await p();
};

window.Fate.punishments.runVeryBad = async function () {
  if (window.Fate.punishments._veryBadBag.length === 0) {
    window.Fate.punishments._veryBadBag = [
      ...window.Fate.punishments.veryBadList,
    ];
    shuffle(window.Fate.punishments._veryBadBag);
  }
  const p = window.Fate.punishments._veryBadBag.pop();
  await p();
};

//testing
/*window.Fate.punishments.runRandom = async function runRandom() {
  const arr = window.Fate.punishments.badList;
  const p = arr[2];
  //const p = arr[Math.floor(Math.random() * arr.length)];
  await p();
};*/
