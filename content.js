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

// Instantly check on page load if it exists
onLoadCheck();

// Observe for changes in the body
observer.observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ["class"],
});

log("[PRIME Enhancer] >>> Initial script run");
