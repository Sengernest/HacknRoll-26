window.Fate = window.Fate || {};
window.Fate.rewards = window.Fate.rewards || {};

window.Fate.rewards._list = [
  async function nothing() {

  },
  async function skipRolls() {
    chrome.storage.local({"isSkipping": "1"})
  },
  async function dancingMan() {
    let random = Math.floor(Math.random() * 3) + 1;
    let filename = "dancing-" + random;
    const el = document.getElementById("reward");
    if (el) {
      el.style.display="block";
      el.innerHTML = `<img src=${filename} alt="Victory"\>`;
    }
  },
  async function showConfetti() {
    confetti();
  }
]
