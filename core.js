window.Fate = window.Fate || {};

//global function for delay
window.Fate.sleep = function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
