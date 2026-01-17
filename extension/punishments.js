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
  {
    message: "Bad luck. Fake loading for 10 seconds.",
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
      overlay.textContent = "Loading...";
      document.body.appendChild(overlay);
      await window.Fate.sleep(10000);
      overlay.remove();
    },
  },
  {
    message: "Bad luck. Your screen will be flipped for 10 seconds.",
    run: async () => {
      document.body.style.transform = "rotate(180deg)";
      await window.Fate.sleep(10000);
      document.body.style.transform = "";
    },
  },
  {
    message: "Bad luck. Your mouse clicks will be disabled for 10 seconds.",
    run: async () => {
      const blocker = document.createElement("div");
      blocker.style.position = "fixed";
      blocker.style.inset = "0";
      blocker.style.zIndex = "999999";
      document.body.appendChild(blocker);
      await window.Fate.sleep(10000);
      blocker.remove();
    },
  },
];

window.Fate.punishments.badList = [
  {
    message: "Bad luck. Your screen will be blurred for 10 seconds.",
    run: async () => {
      document.body.style.filter = "blur(5px)";
      await window.Fate.sleep(10000);
      document.body.style.filter = "";
    },
  },
  {
    message: "Bad luck. Colors inverted for 10 seconds.",
    run: async () => {
      document.body.style.filter = "invert(1) hue-rotate(180deg)";
      await window.Fate.sleep(10000);
      document.body.style.filter = "";
    },
  },
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
    <iframe width="1024" height="576"
      src="https://www.youtube.com/embed/klfT41uZniI?autoplay=1&controls=0&rel=0"
      title="YouTube video player" frameBorder="0"
      allow="autoplay; encrypted-media;"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen></iframe>
  `;
      document.body.appendChild(overlay);
    },
  },
  {
    message: "Bad luck. All text becomes gibberish for 10 seconds.",
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
        }
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
];

//shuffling algo
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

window.Fate.punishments._badBag = [];
window.Fate.punishments._veryBadBag = [];

window.Fate.punishments.pickBad = function pickBad() {
  if (window.Fate.punishments._badBag.length === 0) {
    window.Fate.punishments._badBag = [...window.Fate.punishments.badList];
    shuffle(window.Fate.punishments._badBag);
  }
  return window.Fate.punishments._badBag.pop();
};

window.Fate.punishments.pickVeryBad = function pickVeryBad() {
  if (window.Fate.punishments._veryBadBag.length === 0) {
    window.Fate.punishments._veryBadBag = [
      ...window.Fate.punishments.veryBadList,
    ];
    shuffle(window.Fate.punishments._veryBadBag);
  }
  return window.Fate.punishments._veryBadBag.pop();
};
