window.Fate = window.Fate || {};
window.Fate.punishments = window.Fate.punishments || {};

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
    overlay.innerHTML = `<iframe width="1024" height="576" src="https://www.youtube.com/embed/klfT41uZniI?autoplay=1&controls=0&rel=0"
            title="YouTube video player" frameBorder="0"
            allow="autoplay; encrypted-media;" 
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen/>`
    document.body.appendChild(overlay);
  },
];

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
      "💀 Bad luck! The colors of your screen will be inverted for 10 seconds..."
    );
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    await window.Fate.sleep(10000);
    document.body.style.filter = "";
  },

  //freeze clicks briefly
  async function punishFreeze() {
    alert("💀 Bad luck! Your mouse clicks will be disabled for 10 seconds...");
    const blocker = document.createElement("div");
    blocker.style.position = "fixed";
    blocker.style.inset = "0";
    blocker.style.zIndex = "999999";
    document.body.appendChild(blocker);
    await window.Fate.sleep(10000);
    blocker.remove();
  },

  /*close tab (DOES NOT WORK)
  async function punishCloseTab() {
    alert("💀 Fate has decided.");
    window.close(); // may or may not work
  },*/
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

window.Fate.punishments._bag = [];

window.Fate.punishments.runBad = async function runBad() {
  // Refill bag if empty
  if (window.Fate.punishments._bag.length === 0) {
    window.Fate.punishments._bag = [...window.Fate.punishments.badList];
    shuffle(window.Fate.punishments._bag);
  }

  // Draw one punishment
  const p = window.Fate.punishments._bag.pop();
  await p();
};

window.Fate.punishments.runVeryBad = async function runVeryBad() {
  // Refill bag if empty
  if (window.Fate.punishments._bag.length === 0) {
    window.Fate.punishments._bag = [...window.Fate.punishments.veryBadList];
    shuffle(window.Fate.punishments._bag);
  }

  // Draw one punishment
  const p = window.Fate.punishments._bag.pop();
  await p();
};



/*window.Fate.punishments.runRandom = async function runRandomPunishment() {
  const arr = window.Fate.punishments.list;
  const p = arr[4];
  //const p = arr[Math.floor(Math.random() * arr.length)];
  await p();
};*/
