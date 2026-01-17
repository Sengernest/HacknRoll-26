window.Fate.punishments = window.Fate.punishments || {};

window.Fate.punishments.list = [
    //3 second delay
    async function punishDelay() {
        alert("💀 Bad luck! Wait 3 seconds...");
         await window.Fate.sleep(3000);
    },

    //blur screen
    async function punishBlur() {
    document.body.style.filter = "blur(5px)";
     await window.Fate.sleep(1500);
    document.body.style.filter = "";
    },

    //invert colors
    async function punishInvert() {
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    await window.Fate.sleep(1500);
    document.body.style.filter = "";
    },

    //freeze clicks briefly
    async function punishFreeze() {
    const blocker = document.createElement("div");
    blocker.style.position = "fixed";
    blocker.style.inset = "0";
    blocker.style.zIndex = "999999";
    document.body.appendChild(blocker);
    await window.Fate.sleep(1200);
    blocker.remove();
    },
];

window.Fate.punishments.runRandom = async function runRandomPunishment() {
  const arr = window.Fate.punishments.list;
  const p = arr[Math.floor(Math.random() * arr.length)];
  await p();
};