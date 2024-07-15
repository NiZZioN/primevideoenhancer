const DEBUG_MODE = false; // Set to true for logging, false to disable
const isSkipped = false;
let lastIntroTime = 0; // Store last intro time
const AmazonVideoClass = "#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video";

// Logging function with timestamp
function log(message) {
  const timestamp = new Date().toLocaleString('en-GB', { 
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour12: false,
      formatMatcher: 'basic',
  }).replace(',', ''); // Remove comma for better formatting
  const milliseconds = new Date().getMilliseconds().toString().padStart(3, '0'); // Pad milliseconds
  const formattedTimestamp = `${timestamp}.${milliseconds}`;
  
  if (DEBUG_MODE) {
      chrome.runtime.sendMessage({ action: "log", message: `[${formattedTimestamp}] [PRIME Enhancer] >>> ${message}` });
  }
}

// Function to check if we are on the Amazon Prime Video site
function isAmazonPrimeVideo() {
    const isPrime = window.location.hostname.includes('amazon') && window.location.pathname.includes('video');
    log(`Checking if on Amazon Prime Video: ${isPrime}`);
    return isPrime;
}

// Function to check for the "Next Up" element
function hasNextUpElement() {
    const exists = document.querySelector('.atvwebplayersdk-nextupcard-show');
    log(`Next Up element exists: ${exists}`);
    return exists;
}

// Function to check for the "Skip" button
function hasSkipButton() {
    const exists = document.querySelector('.atvwebplayersdk-skipelement-button');
    log(`Skip button exists: ${exists}`);
    return exists;
}

// Function to skip the intro if conditions are met
function Amazon_Intro(skipEnabled) {
    if (skipEnabled) {
        let button = document.querySelector("[class*=skipelement]");
        if (button) {
            let video = document.querySelector(AmazonVideoClass);
            const time = video?.currentTime;
            if (typeof time === "number" && lastIntroTime !== parseInt(time)) {
                lastIntroTime = parseInt(time);
                button.click();
                log("Intro skipped", button);
            }
        }
    }
}

// Function to skip the "Next Up" if conditions are met
function checkAndSkip() {
    chrome.storage.sync.get(["skipDelay", "skipEnabled", "nextDelay", "nextUpEnabled"], (result) => {
        const { nextUpEnabled, nextDelay, skipEnabled, skipDelay } = result;

        // Check for "Next Up" element
        if (hasNextUpElement() && nextUpEnabled) {
            setTimeout(() => {
                const nextUpElement = document.querySelector('.atvwebplayersdk-nextupcard-button');
                if (nextUpElement) {
                    log(`Clicking Next Up element`);
                    nextUpElement.click(); // Simulate click on Next Up
                }
            }, nextDelay);
        }

        // Check for "Skip" button
        if (hasSkipButton() && skipEnabled) {
            setTimeout(() => {
                const skipButton = document.querySelector('.atvwebplayersdk-skipelement-button');
                if (skipButton) {
                    log("Clicking Skip Button.");
                    skipButton.click();
                }
            }, skipDelay);
        }

        // Check for intro skipping
        Amazon_Intro(skipEnabled);
    });
}

// Main execution
if (isAmazonPrimeVideo()) {
    log(`Script loaded on Amazon Prime Video`);

    // Initial check on page load
    setTimeout(() => {
      checkAndSkip();
    },5000);

    // Set up a MutationObserver with specific options
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                // Check for added nodes
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList.contains("atvwebplayersdk-nextupcard-show") || 
                            node.classList.contains("atvwebplayersdk-skipelement-button")) {
                            log(`Relevant element added: ${node.className}`);
                            checkAndSkip();
                        }
                    }
                });
            } else if (mutation.type === "attributes") {
                // Check if the modified element is relevant
                if (mutation.target.classList.contains("atvwebplayersdk-nextupcard-show") ||
                    mutation.target.classList.contains("atvwebplayersdk-skipelement-button")) {
                    log(`Relevant attribute changed on: ${mutation.target.className}`);
                    checkAndSkip();
                }
            }
        });
    });

    // Observe changes to child nodes and attributes in the body
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
} else {
    log(`Not on Amazon Prime Video, script will not run.`);
}
