const DEBUG_MODE = false;

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

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes") {
      // Check for the next up card
      if (mutation.target.classList.contains("atvwebplayersdk-nextupcard-show")) {
        chrome.storage.sync.get(["nextDelay", "nextUpEnabled"], (data) => {
          if (chrome.runtime.lastError) {
            console.error(
              "[PRIME Enchancer] >>> Error retrieving data: ",
              chrome.runtime.lastError
            );
            return;
          }
          
          // Check if next up is enabled
          if (data.nextUpEnabled) {
            log("[PRIME Enchancer] >>> Next up enabled + Next up card is showing");
            const nextDelay = data.nextDelay || 5000; // Default to 5 seconds
            log("[PRIME Enchancer] >>> Got next Delay: " + nextDelay);
            clickButton("atvwebplayersdk-nextupcard-button", nextDelay);
          }
        });
      }

      // Check for the skip button
      if (mutation.target.classList.contains("atvwebplayersdk-skipelement-button")) {
        chrome.storage.sync.get(["skipDelay", "skipEnabled"], (data) => {
          if (chrome.runtime.lastError) {
            console.error(
              "[PRIME Enchancer] >>> Error retrieving data: ",
              chrome.runtime.lastError
            );
            return;
          }
          
          // Check if skip is enabled
          if (data.skipEnabled) {
            log("[PRIME Enchancer] >>> Skip button is showing + Skip Enabled");
            const skipDelay = data.skipDelay || 0; // Default to instant
            log("[PRIME Enchancer] >>> Got Skip Delay: " + skipDelay);
            clickButton("atvwebplayersdk-skipelement-button", skipDelay);
          }
        });
      }
    }
  });
});

function onLoadCheck() {
  log("[PRIME Enchancer] >>> Instant check if skip or upnext already there.");
  var skip = document.querySelector(".atvwebplayersdk-skipelement-button");
  var next = document.querySelector(".atvwebplayersdk-nextupcard-show");

  if (skip) {
    chrome.storage.sync.get(["skipDelay", "skipEnabled"], (data) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PRIME Enchancer] >>> Error retrieving data: ",
          chrome.runtime.lastError
        );
        return;
      }
      
      // Check if skip is enabled
      if (data.skipEnabled) {
        log("[PRIME Enchancer] >>> Skip enabled + Skip already onload.");
        const skipDelay = data.skipDelay || 0; // Default to instant
        clickButton("atvwebplayersdk-skipelement-button", skipDelay);
      }
    });
  }

  if (next) {
    chrome.storage.sync.get(["nextDelay", "nextUpEnabled"], (data) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PRIME Enchancer] >>> Error retrieving data: ",
          chrome.runtime.lastError
        );
        return;
      }
      
      // Check if next up is enabled
      if (data.nextUpEnabled) {
        log("[PRIME Enchancer] >>> Next Up enabled + Next up already onload.");
        const nextDelay = data.nextDelay || 5000; // Default to 5 seconds
        clickButton("atvwebplayersdk-nextupcard-button", nextDelay);
      }
    });
  }
}

//instantly check on page load if it exists
onLoadCheck();

// Observe for changes in the body
observer.observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ["class"],
});

log("[PRIME Enchancer] >>> Initial script run");
