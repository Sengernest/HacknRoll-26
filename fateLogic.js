window.Fate = window.Fate || {};

window.Fate.DIE_SIZE = 12;

const FATE_VERY_BAD = 2; // 1-2
const FATE_BAD = 6; // 3-6
const FATE_GOOD = 12; // 7-12

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
