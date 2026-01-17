window.Fate = window.Fate || {};
window.Fate.punishments = window.Fate.punishments || {};

// --- AI text pool (AI-only + instant display) ---
window.Fate.punishments._aiPool = [];
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
window.Fate.punishments._refillAIPool();

window.Fate.punishments.veryBadList = [
  //fake loading
  async function punishFakeLoading(ui) {
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
  async function punishFlip(ui) {
    ui.showMessage("💀 Bad luck! Your screen will be flipped for 10 seconds...");
    document.body.style.transform = "rotate(180deg)";
    await window.Fate.sleep(10000);
    document.body.style.transform = "";
  },

  //freeze clicks briefly
  async function punishFreeze(ui) {
    ui.showMessage("💀 Bad luck! Your mouse clicks will be disabled for 10 seconds...");
    const blocker = document.createElement("div");
    blocker.style.position = "fixed";
    blocker.style.inset = "0";
    blocker.style.zIndex = "999999";
    document.body.appendChild(blocker);
    await window.Fate.sleep(10000);
    blocker.remove();
  },

  // ✅ AI cursed text BUT instant: overlay now, AI text later
  async function punishCursedTextAI(ui) {
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
  },
];

window.Fate.punishments.badList = [
  //blur screen
  async function punishBlur(ui) {
    ui.showMessage("💀 Bad luck! Your screen will be blurred for 10 seconds...");
    document.body.style.filter = "blur(5px)";
    await window.Fate.sleep(10000);
    document.body.style.filter = "";
  },

  //invert colors
  async function punishInvert(ui) {
    ui.showMessage(
      "💀 Bad luck! The colors of your screen will be inverted for 10 seconds..."
    );
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    await window.Fate.sleep(10000);
    document.body.style.filter = "";
  },

  //rick roll
  async function punishRickroll(ui) {
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
  },

  /*close tab (DOES NOT WORK)
  async function punishCloseTab(ui) {
    ui.showMessage("💀 Fate has decided.");
    window.close(); // may or may not work
  },*/

  async function punishGibberishText(ui) {
    ui.showMessage("💀 Bad luck! All text will become gibberish for 10 seconds...");

    const original = new Map();

    function isEligibleTextNode(node) {
      if (!node.nodeValue) return false;
      if (!node.nodeValue.trim()) return false;

      const el = node.parentElement;
      if (!el) return false;

      // avoid places where messing with text is dangerous/annoying
      const tag = el.tagName?.toLowerCase();
      if (
        tag === "script" ||
        tag === "style" ||
        tag === "code" ||
        tag === "pre"
      ) {
        return false;
      }

      // don't scramble your own UI
      if (el.closest("#fate-overlay")) return false;

      return true;
    }

    function toGibberish(text) {
      // preserve whitespace and punctuation, scramble letters/numbers
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const digits = "0123456789";

      let out = "";
      for (const ch of text) {
        if (ch >= "a" && ch <= "z") {
          out += alphabet[Math.floor(Math.random() * alphabet.length)];
        } else if (ch >= "A" && ch <= "Z") {
          out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        } else if (ch >= "0" && ch <= "9") {
          out += digits[Math.floor(Math.random() * digits.length)];
        } else {
          out += ch; // punctuation/space unchanged
        }
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

    // scramble
    for (const node of nodes) {
      original.set(node, node.nodeValue);
      node.nodeValue = toGibberish(node.nodeValue);
    }

    await window.Fate.sleep(10000);

    // restore
    for (const [node, text] of original.entries()) {
      // ensure node is still in DOM
      if (node && node.parentNode) node.nodeValue = text;
    }
  },
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

window.Fate.punishments._bag = [];

window.Fate.punishments.runBad = async function runBad(ui) {
  // Refill bag if empty
  if (window.Fate.punishments._bag.length === 0) {
    window.Fate.punishments._bag = [...window.Fate.punishments.badList];
    shuffle(window.Fate.punishments._bag);
  }

  // Draw one punishment
  const p = window.Fate.punishments._bag.pop();
  await p(ui);
};

window.Fate.punishments.runVeryBad = async function runVeryBad(ui) {
  // Refill bag if empty
  if (window.Fate.punishments._bag.length === 0) {
    window.Fate.punishments._bag = [...window.Fate.punishments.veryBadList];
    shuffle(window.Fate.punishments._bag);
  }

  // Draw one punishment
  const p = window.Fate.punishments._bag.pop();
  await p(ui);
};

//use this to test ai
/*window.Fate.punishments.runRandom = async function runRandom() {
  const arr = window.Fate.punishments.veryBadList;
  const p = arr[3];
  //const p = arr[Math.floor(Math.random() * arr.length)];
  await p();
};*/
