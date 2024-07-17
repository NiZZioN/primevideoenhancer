const DEBUG_MODE = false; // Set to true for logging, false to disable

// Logging function with timestamp
function log(message) {
  if (!DEBUG_MODE) return;

  const now = new Date();
  const timestamp = now.toLocaleString('en-GB', { 
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour12: false,
      formatMatcher: 'basic',
  }).replace(',', ''); // Remove comma for better formatting
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Pad milliseconds
  const formattedTimestamp = `${timestamp}.${milliseconds}`;
  
  chrome.runtime.sendMessage({ action: "log", message: `[${formattedTimestamp}] [PRIME Enhancer] >>> ${message}` });
}

// Function to check if we are on the Amazon Prime Video site
function isAmazonPrimeVideo() {
    const isPrime = window.location.hostname.includes('amazon') && window.location.pathname.includes('video');
    log(`Checking if on Amazon Prime Video: ${isPrime}`);
    return isPrime;
}

// Function to check for the existence of an element by selector
function elementExists(selector) {
    const exists = document.querySelector(selector);
    log(`Element exists (${selector}): ${exists}`);
    return exists;
}

// Function to click an element if it exists
function clickElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        log(`Clicking element (${selector})`);
        element.click();
    }
}

// Function to skip the "Next Up" and "Skip" if conditions are met
function checkAndSkip() {
    chrome.storage.sync.get(["skipDelay", "skipEnabled", "nextDelay", "nextUpEnabled"], ({ nextUpEnabled, nextDelay, skipEnabled, skipDelay }) => {
        if (elementExists('.atvwebplayersdk-nextupcard-show') && nextUpEnabled) {
            setTimeout(() => clickElement('.atvwebplayersdk-nextupcard-button'), nextDelay);
        }

        if (elementExists('.atvwebplayersdk-skipelement-button') && skipEnabled) {
            setTimeout(() => clickElement('.atvwebplayersdk-skipelement-button'), skipDelay);
        }
    });
}


function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
              mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                      if (node.matches(".atvwebplayersdk-nextupcard-show, .atvwebplayersdk-skipelement-button")) {
                          log(`Relevant element added: ${node.className}`);
                          checkAndSkip();
                      }
                  }
              });
          }
      });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}


// Main execution
// Function to execute when the page is fully loaded
function init() {
  if (isAmazonPrimeVideo()) {
      log(`Script loaded on Amazon Prime Video`);
      setTimeout(checkAndSkip, 2000); // Initial delay
      observeDOMChanges();
  } else {
      log(`Not on Amazon Prime Video, script will not run.`);
  }
}

// Listen for the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', init);
