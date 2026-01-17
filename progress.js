/*************************************************
 * FATE PROGRESS MODULE
 *************************************************/

const FateProgress = (() => {
  let progress = 0;
  let max = 100;

  let container;
  let bar;
  let text;

  function init(options = {}) {
    max = options.max ?? 100;
    progress = options.initial ?? 0;

    if (document.getElementById("fate-progress-container")) {
      cacheElements();
      render();
      return;
    }

    container = document.createElement("div");
    container.id = "fate-progress-container";
    container.innerHTML = `
      <div id="fate-progress-bar"></div>
      <div id="fate-progress-text"></div>
    `;

    document.documentElement.appendChild(container);
    cacheElements();
    render();
  }

  function cacheElements() {
    bar = document.getElementById("fate-progress-bar");
    text = document.getElementById("fate-progress-text");
  }

  function add(amount) {
    set(progress + amount);
  }

  function set(value) {
    progress = clamp(value, 0, max);
    render();

    if (progress >= max) {
      onComplete();
    }
  }

  function get() {
    return progress;
  }

  function render() {
    if (!bar || !text) return;

    const percent = (progress / max) * 100;
    bar.style.width = percent + "%";
    text.textContent = `Fate: ${Math.round(percent)}%`;
  }

  function onComplete() {
    console.log("✨ Fate completed");
    // Hook point:
    // dispatchEvent(new CustomEvent("fate:complete"))
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  return {
    init,
    add,
    set,
    get,
  };
})();

export default FateProgress;
