let cachedNarrations = {good: "", very_good: ""};
let inFlight = false;

async function initFate(progress) {
  console.log("🧠 Initializing Fate...");
  if (inFlight) return;
  inFlight = true;

  const res = await fetch("http://localhost:3000/fate/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress }),
  });

  const json = await res.json();
  cachedNarrations = json.narrations;

  console.log("🧠 Fate initialized:", cachedNarrations);
  inFlight = false;
}

async function refillNarrations(outcome, progress) {
  console.log("🔄 Refilling Fate narrations...");
  if (inFlight) return;
  inFlight = true;

  const res = await fetch("http://localhost:3000/fate/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcome, progress }),
  });

  const json = await res.json();
  cachedNarrations = json.narrations;

  console.log("🔁 Fate narration refreshed:", cachedNarrations);
  inFlight = false;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case "FATE_INIT":
        await initFate(msg.progress);
        sendResponse({ ok: true });
        break;

      case "FATE_GET":
        sendResponse({
          ok: true,
          narrations: cachedNarrations,
        });
        break;

      case "FATE_CONSUMED":
        await refillNarrations(msg.outcome, msg.progress);
        sendResponse({ ok: true });
        break;
    }
  })();

  return true; // 🔑 keep channel open
});

