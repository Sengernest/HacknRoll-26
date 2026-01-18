//global function for delay
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initDefaults() {
  const data = await chrome.storage.local.get(["value", "max"]);
  const updates = {};
  if (data.value === undefined) updates.value = 0;
  if (data.max === undefined) updates.max = 100;
  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}

chrome.runtime.onStartup.addListener(() => {
  initDefaults();
})
chrome.runtime.onInstalled.addListener(() => {
  initDefaults();
})

