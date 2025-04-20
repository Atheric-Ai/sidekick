// Create context menu item
function createContextMenu() {
  chrome.contextMenus.create({
    id: "summarizeVideo",
    title: "Summarize Video",
    contexts: ["link", "video"],
    documentUrlPatterns: ["*://*.youtube.com/*"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error creating context menu:", chrome.runtime.lastError.message);
    }
  });
}

// Create context menu when extension is installed or reloaded
chrome.runtime.onInstalled.addListener(() => {
  // Remove existing menu items to prevent duplicates
  chrome.contextMenus.removeAll(() => {
    createContextMenu();
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizeVideo") {
    chrome.tabs.sendMessage(tab.id, {
      action: "summarizeVideo",
      target: info.targetElementId
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTranscript") {
    // Here we'll add the logic to get the transcript
    // For now, we'll just mock the response
    sendResponse({ success: true });
  } else if (request.action === "generateSummary") {
    // Here we'll add the logic to generate the summary using an LLM
    // For now, we'll just mock the response
    sendResponse({ success: true });
  }
}); 