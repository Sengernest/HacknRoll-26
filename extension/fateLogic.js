window.Fate = window.Fate || {};
window.Fate.progress = window.Fate.progress || {};

/*************************************************
 * INTERNAL STATE
 *************************************************/

window.Fate.progress._state = {
  value: 0,
  max: 100,
};

window.Fate.DIE_SIZE = 20;

const FATE_VERY_BAD = 4; // 1-4
const FATE_BAD = 16; // 5-8
const FATE_GOOD = 20; // 9-20

window.Fate.Category = Object.freeze({
  VERY_BAD: "VERY_BAD",
  BAD: "BAD",
  GOOD: "GOOD",
});

window.Fate.evaluateFate = function evaluateFate(roll) {
  if (roll <= FATE_VERY_BAD) return Fate.Category.VERY_BAD;
  if (roll <= FATE_BAD) return Fate.Category.BAD;
  if (roll <= FATE_GOOD) return Fate.Category.GOOD;
  throw new Error("Invalid die value");
};

window.Fate.FATE_UI = {
  [window.Fate.Category.GOOD]: { text: "SUCCESS", className: "good" },
  [window.Fate.Category.BAD]: { text: "BAD LUCK", className: "bad" },
  [window.Fate.Category.VERY_BAD]: { text: "DISASTER", className: "very-bad" },
};

window.Fate.progress._state = {
  value: 0,
  max: 100,
};

/*************************************************
 * INIT
 *************************************************/


window.Fate.progress.init = function initProgress(options = {}) {
  const state = window.Fate.progress._state;

  state.max = options.max ?? 100;
  state.value = options.initial ?? 0;

  if (document.getElementById("fate-progress-container")) {
    render();
    return;
  }

  const container = document.createElement("div");
  container.id = "fate-progress-container";
  container.innerHTML = `
    <div id="fate-progress-row">
      <div id="fate-progress-track">
        <div id="fate-progress-bar"></div>
      </div>
    </div>
    <div id="fate-progress-text"></div>
  `;


  document.documentElement.appendChild(container);
  render();
};

document.dispatchEvent(new Event("fate:progressReady"));
/*************************************************
 * API
 *************************************************/

window.Fate.progress.add = function addProgress(amount) {
    set(window.Fate.progress._state.value + amount);
};

window.Fate.progress.set = function setProgress(value) {
  set(value);
};

window.Fate.progress.get = function getProgress() {
  return window.Fate.progress._state.value;
};

/*************************************************
 * INTERNAL HELPERS
 *************************************************/

function set(value) {
  const state = window.Fate.progress._state;
  state.value = clamp(value, 0, state.max);
  render();

  if (state.value >= state.max) {
    onComplete();
  }
}

function render() {
  const state = window.Fate.progress._state;

  const bar = document.getElementById("fate-progress-bar");
  const text = document.getElementById("fate-progress-text");
  if (!bar || !text) return;

  const percent = (state.value / state.max) * 100;
  bar.style.width = percent + "%";
  text.textContent = `Fate: ${Math.round(percent)}%`;
}

function onComplete() {
  console.log("✨ Fate completed");
  document.dispatchEvent(new CustomEvent("fate:progressComplete"));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}