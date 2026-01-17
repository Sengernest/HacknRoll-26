const DIE_SIZE = 12;

const FATE_VERY_BAD = 4; // 1-4
const FATE_BAD = 8; // 5-8
const FATE_GOOD = 12; // 9-12

window.Fate = Object.freeze({
  VERY_BAD: "VERY_BAD",
  BAD: "BAD",
  GOOD: "GOOD",
});

window.Fate.evaluateFate = (roll) => {
  if (roll <= FATE_VERY_BAD) return Fate.VERY_BAD;
  if (roll <= FATE_BAD) return Fate.BAD;
  if (roll <= FATE_GOOD) return Fate.GOOD;
  throw new Error("Invalid die value");
};

window.Fate.FATE_UI = {
  [Fate.GOOD]: { text: "SUCCESS", className: "good" },
  [Fate.BAD]: { text: "BAD LUCK", className: "bad" },
  [Fate.VERY_BAD]: { text: "DISASTER", className: "very-bad" },
};
