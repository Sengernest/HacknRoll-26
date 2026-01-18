window.Fate = window.Fate || {};

window.Fate.sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};
