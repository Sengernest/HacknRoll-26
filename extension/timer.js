window.Fate = window.Fate || {};

window.Fate.timer = window.Fate.timer || {
  _el: null,
  _interval: null,

  show(ms) {
    this.hide();

    const el = document.createElement("div");
    el.id = "fate-punish-timer";
    el.textContent = formatMs(ms);
    document.documentElement.appendChild(el);

    this._el = el;

    const start = Date.now();
    this._interval = setInterval(() => {
      const left = Math.max(0, ms - (Date.now() - start));
      if (this._el) this._el.textContent = formatMs(left);
      if (left <= 0) this.hide();
    }, 100);
  },

  hide() {
    if (this._interval) clearInterval(this._interval);
    this._interval = null;
    if (this._el) this._el.remove();
    this._el = null;
  },
};

function formatMs(ms) {
  const s = Math.ceil(ms / 1000);
  return `Punishment: ${s}s`;
}

window.Fate.withPunishTimer = async function withPunishTimer(ms, fn) {
  window.Fate.timer.show(ms);
  try {
    await fn();
  } finally {
    window.Fate.timer.hide();
  }
};
