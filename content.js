const DEBUG_MODE = true;
let skipButtonClicked = false; // Flag to track if the skip button has been clicked

function log(message) {
  if (DEBUG_MODE) {
    chrome.runtime.sendMessage({ action: "log", message });
  }
}

function clickButton(buttonClass, delay) {
  const button = document.querySelector(`.${buttonClass}`);
  if (button) {
    setTimeout(() => {
      button.click();
    }, delay);
  }
}

function handleNextUpCard(data) {
  if (data.nextUpEnabled) {
    log("[PRIME Enhancer] >>> Next up enabled + Next up card is showing");
    const nextDelay = data.nextDelay || 5000; // Default to 5 seconds
    log("[PRIME Enhancer] >>> Got next Delay: " + nextDelay);
    clickButton("atvwebplayersdk-nextupcard-button", nextDelay);
  }
}

function handleSkipButton(data) {
  if (data.skipEnabled) {
    log("[PRIME Enhancer] >>> Skip button is showing + Skip Enabled");
    const skipDelay = data.skipDelay || 0; // Default to instant
    log("[PRIME Enhancer] >>> Got Skip Delay: " + skipDelay);
    clickButton("atvwebplayersdk-skipelement-button", skipDelay);
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes") {
      // Check for the next up card
      if (mutation.target.classList.contains("atvwebplayersdk-nextupcard-show")) {
        chrome.storage.sync.get(["nextDelay", "nextUpEnabled"], (data) => {
          if (chrome.runtime.lastError) {
            console.error("[PRIME Enhancer] >>> Error retrieving next up data: ", chrome.runtime.lastError);
            return;
          }
          handleNextUpCard(data);
        });
      }

      // Check for the skip button
      if (mutation.target.classList.contains("atvwebplayersdk-skipelement-button")) {
        chrome.storage.sync.get(["skipDelay", "skipEnabled"], (data) => {
          if (chrome.runtime.lastError) {
            console.error("[PRIME Enhancer] >>> Error retrieving skip data: ", chrome.runtime.lastError);
            return;
          }
          handleSkipButton(data);
        });
      }
    }
  });
});

function onLoadCheck() {
  log("[PRIME Enhancer] >>> Instant check if skip or upnext already there.");
  const skip = document.querySelector(".atvwebplayersdk-skipelement-button");
  const next = document.querySelector(".atvwebplayersdk-nextupcard-show");

  chrome.storage.sync.get(["skipDelay", "skipEnabled", "nextDelay", "nextUpEnabled"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("[PRIME Enhancer] >>> Error retrieving data: ", chrome.runtime.lastError);
      return;
    }

    if (skip) {
      handleSkipButton(data);
    }

    if (next) {
      handleNextUpCard(data);
    }
  });
}

function periodicSkipCheck() {
  chrome.storage.sync.get(["skipEnabled"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("[PRIME Enhancer] >>> Error retrieving data: ", chrome.runtime.lastError);
      return;
    }

    if (data.skipEnabled && !skipButtonClicked) {
      log("[PRIME Enhancer] >>> Periodic check for skip button.");
      const skip = document.querySelector(".atvwebplayersdk-skipelement-button");

      if (skip) {
        chrome.storage.sync.get(["skipDelay"], (data) => {
          if (chrome.runtime.lastError) {
            console.error("[PRIME Enhancer] >>> Error retrieving data: ", chrome.runtime.lastError);
            return;
          }
          handleSkipButton(data);
        });
      }
    }
  });
}


function resetSkipFlag() {
  skipButtonClicked = false; // Reset the flag on page load or URL change
  log("[PRIME Enhancer] >>> Skip flag reset.");
}

// Listen for URL changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "urlChanged") {
    resetSkipFlag();
    onLoadCheck();
  }
});

const skipInterval = setInterval(() => {
  if (!skipButtonClicked) {
    periodicSkipCheck();
  } else {
    clearInterval(skipInterval); // Stop the interval once the skip button has been clicked
  }
}, 5000);


function init() {
  if (document.body.querySelector('#dv-web-player')) {
    skipButtonClicked = false; // Reset the skip button clicked flag
    // Instantly check on page load if it exists
    onLoadCheck();

    // Observe for changes in the body
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    });

    // Start the periodic skip check
    periodicSkipCheck();

    log("[PRIME Enchancer] >>> Initial script run");
  }
}

function setupURLChangeListener() {
  let currentURL = location.href;

  const checkURLChange = () => {
    if (location.href !== currentURL) {
      currentURL = location.href;
      observer.disconnect(); // Stop observing mutations on URL change
      init(); // Re-initialize the script
    }
  };

  // Override pushState and replaceState to detect URL changes
  const pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    checkURLChange();
  };

  const replaceState = history.replaceState;
  history.replaceState = function() {
    replaceState.apply(history, arguments);
    checkURLChange();
  };

  window.addEventListener('popstate', checkURLChange);
}

init();
setupURLChangeListener();