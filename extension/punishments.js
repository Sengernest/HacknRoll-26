window.Fate = window.Fate || {};
window.Fate.punishments = window.Fate.punishments || {};

// --------------------------------------------------
// VERY BAD punishments
// --------------------------------------------------
window.Fate.punishments.veryBadList = [
  //loading wheel
  {
    message: "Bad luck. Did you lose connection?",
    run: async () => {
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
  },

  //screen glitch
  {
    message:
      "💀 Bad luck! Your website is gg to crash!",

    // flip screen
    run: async () => {
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
  },
  
  //page not found
  {
    message: "💀 Bad Luck! Are you sure you found the correct page?",
    run: async () => {
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
      overlay.style.backgroundImage = `url(${chrome.runtime.getURL(
        "assets/images/site-cant-be-reached.png",
      )})`;
      overlay.style.backgroundSize = "cover";
      overlay.style.backgroundPosition = "center";
      overlay.style.backgroundRepeat = "no-repeat";
      overlay.style.pointerEvents = "none";

      document.body.appendChild(overlay);

      await window.Fate.sleep(10000);

      overlay.remove();
      if (musicAudio) musicAudio.pause();
    },
  },
];

// --------------------------------------------------
// BAD punishments
// --------------------------------------------------
window.Fate.punishments.badList = [
  //dodge clicker
  {
    message: "Bad luck! Try to click.",
    run: async () => {
      let audio = null;
      try {
        const url = chrome.runtime.getURL("assets/sounds/bruh.mp3");
        audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {
        console.warn("Failed to play audio:", e);
        audio = null;
      }

      const clickables = Array.from(
        document.querySelectorAll(
          "button, a, input[type=button], input[type=submit]",
        ),
      );

      const positions = new Map();
      clickables.forEach((el) => {
        const rect = el.getBoundingClientRect();
        positions.set(el, {
          left: rect.left,
          top: rect.top,
          position: el.style.position || "",
        });

        if (window.getComputedStyle(el).position === "static") {
          el.style.position = "absolute";
          el.style.left = rect.left + "px";
          el.style.top = rect.top + "px";
        }
      });

      function dodgeListener(e) {
        clickables.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const distance = Math.hypot(
            e.clientX - (rect.left + rect.width / 2),
            e.clientY - (rect.top + rect.height / 2),
          );
          if (distance < 100) {
            const newLeft = Math.random() * (window.innerWidth - rect.width);
            const newTop = Math.random() * (window.innerHeight - rect.height);
            el.style.left = newLeft + "px";
            el.style.top = newTop + "px";
          }
        });
      }

      document.addEventListener("mousemove", dodgeListener);

      await window.Fate.sleep(10000);

      document.removeEventListener("mousemove", dodgeListener);
      clickables.forEach((el) => {
        const orig = positions.get(el);
        el.style.left = orig.left + "px";
        el.style.top = orig.top + "px";
        if (orig.position) el.style.position = orig.position;
        else el.style.position = "";
      });

      if (audio) audio.pause();
    },
  },
  
  //rickroll
  {
    message: "Bad luck. A mysterious video appears.",
    run: async () => {
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
  },
  
  //gibberish text
  {
    message: "Bad luck. Can u read?",
    run: async () => {
      const original = new Map();

      function isEligibleTextNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return false;
        const el = node.parentElement;
        if (!el) return false;

        const tag = el.tagName?.toLowerCase();
        if (
          tag === "script" ||
          tag === "style" ||
          tag === "code" ||
          tag === "pre"
        )
          return false;
        if (el.closest("#fate-overlay")) return false;

        return true;
      }

      function toGibberish(text) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const digits = "0123456789";
        let out = "";
        for (const ch of text) {
          if (ch >= "a" && ch <= "z")
            out += alphabet[Math.floor(Math.random() * alphabet.length)];
          else if (ch >= "A" && ch <= "Z")
            out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          else if (ch >= "0" && ch <= "9")
            out += digits[Math.floor(Math.random() * digits.length)];
          else out += ch;
        }
        return out;
      }

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return isEligibleTextNode(node)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        },
      );

      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      for (const node of nodes) {
        original.set(node, node.nodeValue);
        node.nodeValue = toGibberish(node.nodeValue);
      }

      await window.Fate.sleep(10000);

      for (const [node, text] of original.entries()) {
        if (node && node.parentNode) node.nodeValue = text;
      }
    },
  },
  
  //blur screen with ducks
  {
    message: "Bad luck. Wait, what's that sound?",
    run: async () => {
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
  },
  
  //disable mouseclicks
  {
    message: "Bad luck, your mouse clicks are disabled!",
    run: async () => {
      //for disable clicks punishment
      function playErrorSound() {
        try {
          const url = chrome.runtime.getURL("assets/sounds/errorclick.mp3");
          const audio = new Audio(url);
          audio.volume = 0.4;
          audio.play();
        } catch (e) {}
      }

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

window.Fate.punishments.pickBad = function () {
  if (this._badBag.length === 0) {
    this._badBag = [...this.badList];
    shuffle(this._badBag);
  }
  return this._badBag.pop();
};

window.Fate.punishments.pickVeryBad = function () {
  if (this._veryBadBag.length === 0) {
    this._veryBadBag = [...this.veryBadList];
    shuffle(this._veryBadBag);
  }
  return this._veryBadBag.pop();
};

// --------------------------------------------------
// testing
// --------------------------------------------------

window.Fate.punishments.runRandom = async function () {
  await this.badList[0]();
};
