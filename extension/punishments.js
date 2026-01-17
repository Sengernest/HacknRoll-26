window.Fate = window.Fate || {};
window.Fate.punishments = window.Fate.punishments || {};

// --------------------------------------------------
// VERY BAD punishments
// --------------------------------------------------

window.Fate.punishments.veryBadList = [
  async function punishFullScreenImageWithMusic() {
    alert("💀 Full-screen image with music incoming!");

    let musicAudio = null;
    try {
      const url = chrome.runtime.getURL("assets/sounds/shutdown.mp3");
      musicAudio = new Audio(url);
      musicAudio.loop = true;
      musicAudio.volume = 0.4;
      musicAudio.play().catch(() => {});
    } catch (e) {
      console.warn("Failed to play music:", e);
    }

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.backgroundColor = "#000";
    overlay.style.backgroundImage = `url(${chrome.runtime.getURL("assets/images/site-cant-be-reached.png")})`;
    overlay.style.backgroundSize = "cover";
    overlay.style.backgroundPosition = "center";
    overlay.style.backgroundRepeat = "no-repeat";
    overlay.style.pointerEvents = "none";

    document.body.appendChild(overlay);

    await window.Fate.sleep(10000);

    overlay.remove();
    if (musicAudio) musicAudio.pause();
  },

  // fake loading
  async function punishFakeLoading() {
    let soundAudio = null;
    try {
      const url = chrome.runtime.getURL("assets/sounds/loading.mp3");
      soundAudio = new Audio(url);
      soundAudio.loop = true;
      soundAudio.volume = 0.4;
      soundAudio.play().catch(() => {});
    } catch (e) {
      soundAudio = null;
    }

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "999999";
    overlay.style.fontFamily = "monospace";
    overlay.style.fontSize = "18px";

    document.body.appendChild(overlay);
    const wheel = document.createElement("div");
    wheel.style.width = "50px";
    wheel.style.height = "50px";
    wheel.style.border = "6px solid rgba(255,255,255,0.2)";
    wheel.style.borderTop = "6px solid #4885ED";
    wheel.style.borderRadius = "50%";
    wheel.style.marginTop = "20px";
    wheel.style.animation = "spin 1s linear infinite";
    overlay.appendChild(wheel);

    if (!document.getElementById("fate-spin-style")) {
      const style = document.createElement("style");
      style.id = "fate-spin-style";
      style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
      document.head.appendChild(style);
    }

    await window.Fate.sleep(10000);

    overlay.remove();
    if (soundAudio) soundAudio.pause();
  },

  // flip screen
  async function punishFlipInvert() {
    alert(
      "💀 Bad luck! Your screen will flip, glitch colors, and play sound for 10 seconds...",
    );

    let soundAudio = null;
    try {
      const url = chrome.runtime.getURL("assets/sounds/windows-crash.mp3");
      soundAudio = new Audio(url);
      soundAudio.loop = true;
      soundAudio.volume = 0.4;
      soundAudio.play().catch(() => {});
    } catch (e) {
      soundAudio = null;
    }

    const totalMs = 10000;
    const intervalMs = 300;
    const start = Date.now();

    let flipOn = false;
    let invertOn = false;

    const degrees = [0, 90, 180, 270, -90, -180, 45, -45, 135, -135];

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= totalMs) {
        clearInterval(timer);
        document.body.style.transform = "";
        document.body.style.filter = "";
        if (soundAudio) soundAudio.pause();
        return;
      }

      flipOn = !flipOn;
      document.body.style.transform = flipOn
        ? `rotate(${degrees[Math.floor(Math.random() * degrees.length)]}deg)`
        : "";

      invertOn = !invertOn;
      document.body.style.filter = invertOn
        ? `invert(1) hue-rotate(${Math.random() * 360}deg)`
        : "";
    }, intervalMs);

    await window.Fate.sleep(totalMs);

    clearInterval(timer);
    document.body.style.transform = "";
    document.body.style.filter = "";
    if (soundAudio) soundAudio.pause();
  },

  // rickroll
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
      <div>
        <iframe width="1024" height="576"
          src="https://www.youtube.com/embed/klfT41uZniI?autoplay=1&controls=0&rel=0"
          title="YouTube video player" frameBorder="0"
          allow="autoplay; encrypted-media;"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen/>
        <p>click to exit after 5 seconds</p>
      </div>
    `;
    document.body.appendChild(overlay);
    await window.Fate.sleep(5000);
    const removeOverlay = () => {
      if (overlay.parentElement) overlay.remove();
    };
    overlay.addEventListener("click", removeOverlay);
  },
];

// --------------------------------------------------
// BAD punishments
// --------------------------------------------------

window.Fate.punishments.badList = [
  //BLUR WITH DUCKS
  async function punishBlur() {
    //for blur screen quackers
    function playLoopingDuckSound() {
      try {
        const url = chrome.runtime.getURL("assets/sounds/quackers.mp3");
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.4;
        audio.play().catch(() => {});
        return audio;
      } catch (e) {
        return null;
      }
    }
    alert("💀 Ducks incoming with sound!");

    const duckAudio = playLoopingDuckSound();

    const blurWrap = document.createElement("div");
    while (document.body.firstChild) {
      blurWrap.appendChild(document.body.firstChild);
    }
    document.body.appendChild(blurWrap);
    blurWrap.style.filter = "blur(6px)";
    blurWrap.style.pointerEvents = "none";

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);

    const imgURL = chrome.runtime.getURL("assets/images/quackers.png");
    const ducks = [];
    const COUNT = 20;

    for (let i = 0; i < COUNT; i++) {
      const duck = document.createElement("img");
      duck.src = imgURL;

      const size = 50 + Math.random() * 80;
      duck.style.position = "absolute";
      duck.style.width = size + "px";
      duck.style.height = "auto";
      duck.style.pointerEvents = "none";

      duck.style.left = Math.random() * 100 + "vw";
      duck.style.top = Math.random() * 100 + "vh";

      overlay.appendChild(duck);
      ducks.push({
        el: duck,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      });
    }

    let running = true;
    function animate() {
      if (!running) return;
      ducks.forEach((d) => {
        let left = parseFloat(d.el.style.left);
        let top = parseFloat(d.el.style.top);

        left += d.vx;
        top += d.vy;

        if (left < 0 || left > 100) d.vx *= -1;
        if (top < 0 || top > 100) d.vy *= -1;

        d.el.style.left = left + "vw";
        d.el.style.top = top + "vh";
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    await window.Fate.sleep(10000);

    running = false;
    ducks.forEach((d) => d.el.remove());
    overlay.remove();

    if (duckAudio) duckAudio.pause();
    while (blurWrap.firstChild) {
      document.body.appendChild(blurWrap.firstChild);
    }
    blurWrap.remove();
  },

  // freeze clicks
  async function punishFreeze() {
    //for disable clicks punishments
    function playErrorSound() {
      try {
        const url = chrome.runtime.getURL("assets/sounds/errorclick.mp3");
        const audio = new Audio(url);
        audio.volume = 0.4;
        audio.play();
      } catch (e) {}
    }

    alert("💀 Bad luck! Your mouse clicks are disabled...");

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
];

// --------------------------------------------------
// bag system
// ----------------------------------

window.Fate.punishments._badBag = [];
window.Fate.punishments._veryBadBag = [];

//for picking punishments
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

window.Fate.punishments.runBad = async function () {
  if (this._badBag.length === 0) {
    this._badBag = [...this.badList];
    shuffle(this._badBag);
  }
  await this._badBag.pop()();
};

window.Fate.punishments.runVeryBad = async function () {
  if (this._veryBadBag.length === 0) {
    this._veryBadBag = [...this.veryBadList];
    shuffle(this._veryBadBag);
  }
  await this._veryBadBag.pop()();
};

// --------------------------------------------------
// testing
// --------------------------------------------------

window.Fate.punishments.runRandom = async function () {
  await this.badList[0]();
};
