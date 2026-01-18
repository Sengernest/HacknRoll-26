window.Fate = window.Fate || {};

window.Fate.punishTimer = window.Fate.punishTimer || {
  _root: null,
  _fill: null,
  _raf: null,

  show(ms) {
    this.hide();

    const root = document.createElement("div");
    root.id = "fate-punishtimer";
    const fill = document.createElement("div");
    root.appendChild(fill);

    document.documentElement.appendChild(root);

    this._root = root;
    this._fill = fill;

    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      this._fill.style.transform = `scaleX(${1 - t})`;
      if (t < 1) this._raf = requestAnimationFrame(tick);
    };

    this._raf = requestAnimationFrame(tick);
  },

  hide() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    if (this._root) this._root.remove();
    this._root = null;
    this._fill = null;
  },
};

window.Fate.withPunishTimer = async function (ms, fn) {
  window.Fate.punishTimer.show(ms);
  try {
    await fn(); 
  } finally {
    window.Fate.punishTimer.hide();
  }
};
