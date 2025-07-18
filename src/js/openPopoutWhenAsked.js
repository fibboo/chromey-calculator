// open popout when asked
// Note: This functionality is now handled in the background.js service worker
// This file is kept for reference but is no longer needed
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
	// Use chrome.storage.local instead of localStorage
	chrome.storage.local.get(['opt_quickKeyOn'], function(result) {
		var qkOn = result.opt_quickKeyOn ? JSON.parse(result.opt_quickKeyOn)[0] : false;
		
		if (request.helperIsInstalled === "yep") {
			// Store helper installation status in storage
			chrome.storage.local.set({ 'helperIsInstalled': true });
		} else if (request.helperIsInstalled === "nope") {
			// Store helper installation status in storage
			chrome.storage.local.set({ 'helperIsInstalled': false });
		} else if (request.openPopOut && qkOn) {
			// Use message passing to open popout
			chrome.runtime.sendMessage({ action: "openPopout" });
		}
		
		sendResponse({});
	});
	
	// Keep the message channel open for the async response
	return true;
});