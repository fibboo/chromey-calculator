// Background service worker for Cloudy Calculator
// This replaces the background.html in Manifest V3

// Global variables to store state
let popoutWindowId = null;

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Cloudy Calculator extension installed');
});

// Service worker needs to be kept alive for this extension to function properly
chrome.runtime.onStartup.addListener(() => {
  console.log('Cloudy Calculator started');
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.action === 'initCalc') {
    // Initialize the calculator
    try {
      // In Manifest V3, we can't directly pass the window object
      // Instead, we'll initialize the calculator in the popup itself
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error initializing calculator:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for the async response
  }
  
  if (message.action === 'closePopout') {
    // Close any existing popout window
    try {
      if (popoutWindowId) {
        chrome.windows.remove(popoutWindowId);
        popoutWindowId = null;
      }
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error closing popout:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for the async response
  }
  
  if (message.action === 'openPopout') {
    // Open a new popout window using chrome.windows API instead of window.open
    try {
      // Close existing popout if any
      if (popoutWindowId) {
        chrome.windows.remove(popoutWindowId);
      }
      
      // Get stored window info from storage API instead of localStorage
      chrome.storage.local.get(['popOutWindowInfo'], (result) => {
        const defaultPopOutWindowInfo = {
          width: 300,
          height: 400,
          type: 'popup'
        };
        
        // Parse stored window info or use default
        let windowInfo = defaultPopOutWindowInfo;
        if (result.popOutWindowInfo) {
          try {
            // Try to parse the stored window info
            const storedInfo = JSON.parse(result.popOutWindowInfo);
            windowInfo = {
              width: storedInfo.width || 300,
              height: storedInfo.height || 400,
              top: storedInfo.top,
              left: storedInfo.left,
              type: 'popup'
            };
          } catch (e) {
            console.error('Error parsing stored window info:', e);
          }
        }
        
        // Open new popout window
        chrome.windows.create({
          url: chrome.runtime.getURL('calc.html'),
          type: 'popup',
          width: windowInfo.width,
          height: windowInfo.height,
          top: windowInfo.top,
          left: windowInfo.left
        }, (window) => {
          popoutWindowId = window.id;
          sendResponse({ success: true });
        });
      });
    } catch (error) {
      console.error('Error opening popout:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for the async response
  }
  
  if (message.action === 'savePopoutWindowInfo') {
    // Save popout window info to storage
    try {
      const windowInfo = message.windowInfo;
      chrome.storage.local.set({ 'popOutWindowInfo': JSON.stringify(windowInfo) }, () => {
        sendResponse({ success: true });
      });
    } catch (error) {
      console.error('Error saving popout window info:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for the async response
  }
  
  if (message.action === 'updateOption') {
    // Handle option updates from options.js
    try {
      const optionId = message.optionId;
      const optionValue = message.optionValue;
      
      // Save option to storage
      const optionKey = 'opt_' + optionId;
      const optionData = JSON.stringify([optionValue]);
      
      chrome.storage.local.set({ [optionKey]: optionData }, () => {
        console.log(`Option ${optionId} updated to ${optionValue}`);
        
        // Handle special options that need immediate action
        if (optionId === 'width' || optionId === 'height') {
          // Update popup dimensions if needed
          // This is a placeholder - actual implementation would depend on how the extension handles resizing
        } else if (optionId === 'zoom') {
          // Update zoom level if needed
        }
        
        sendResponse({ success: true });
      });
    } catch (error) {
      console.error('Error updating option:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for the async response
  }
  
  if (message.action === 'calculate') {
    // Perform calculation
    try {
      // The actual calculation will be done in the popup
      // This is just a placeholder for any background processing needed
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error calculating:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for the async response
  }
  
  // Handle external messages (from helper extension)
  if (message.queryUri) {
    // This would handle the query from the helper extension
    // Since we can't use jQuery in the service worker, we'll need to use fetch instead
    fetch(message.queryUri)
      .then(response => response.text())
      .then(text => {
        sendResponse({ doc: text });
      })
      .catch(error => {
        console.error('Error fetching query:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep the message channel open for the async response
  }
});

// Listen for external messages (from helper extension)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  // Check if helper extension is installed
  if (request.helperIsInstalled === "yep") {
    chrome.storage.local.set({ 'helperIsInstalled': true });
  } else if (request.helperIsInstalled === "nope") {
    chrome.storage.local.set({ 'helperIsInstalled': false });
  } else if (request.openPopOut) {
    // Check if quick key is enabled
    chrome.storage.local.get(['opt_quickKeyOn'], (result) => {
      const quickKeyEnabled = result.opt_quickKeyOn ? JSON.parse(result.opt_quickKeyOn)[0] : false;
      if (quickKeyEnabled) {
        // Open popout window
        chrome.runtime.sendMessage({ action: "openPopout" });
      }
      sendResponse({});
    });
    return true; // Keep the message channel open for the async response
  }
  
  sendResponse({});
  return true;
});