const skipPrime = 'skipPrime';
const skipEnabled = 'skipEnabled';

let skipEnabledConfig;
let nextUpEnabledConfig;

// Logger utility using chrome.runtime
function log(message) {
    chrome.runtime.sendMessage({ type: 'log', message: `[Skip Logger] ${message}` });
}

async function getConfigFromStorage(storageKey) {
    const result = await browser.storage.sync.get(storageKey);
    if (result[storageKey] === undefined) {
        const newConfig = {};
        newConfig[storageKey] = true; // Default to true
        await browser.storage.sync.set(newConfig);
        return true;
    }
    return result[storageKey];
}

function onBodyChange(callback) {
    new MutationObserver(callback).observe(document.body, {
        subtree: true,
        childList: true
    });
}

function skipElement(buttonText) {
    onBodyChange(() => {
        if (skipEnabledConfig) {
            const buttons = document.body.getElementsByTagName('button');
            for (let button of buttons) {
                const buttonClass = button.getAttribute('class');
                if (buttonClass && buttonClass.includes('atvwebplayersdk-skipelement-button') && button.textContent === buttonText) {
                    log(`Skipping ${buttonText}`);
                    button.click();
                }
            }
        }
    });
}

function skipNextUp() {
  onBodyChange(() => {
      if (nextUpEnabledConfig) {
          const nextUpCards = document.getElementsByClassName('atvwebplayersdk-nextupcard-show');
          for (let card of nextUpCards) {
              const buttons = card.getElementsByClassName('atvwebplayersdk-nextupcard-button');
              for (let button of buttons) {
                  log(`Skipping Next Up`);
                  button.click();
              }
          }
      }
  });
}


async function skipper() {
    browser.storage.onChanged.addListener((change) => {
        if (change.hasOwnProperty(skipEnabled)) {
            skipEnabledConfig = change[skipEnabled].newValue;
            log(`Skip Enabled Changed: ${skipEnabledConfig}`);
        }
        if (change.hasOwnProperty(nextUpEnabled)) {
          nextUpEnabledConfig = change[nextUpEnabled].newValue;
          log(`Next Up Enabled Changed: ${skipEnabledConfig}`);
      }
    });

    skipEnabledConfig = await getConfigFromStorage(skipEnabled);
    log(`Initial Skip Enabled: ${skipEnabledConfig}`);
    nextUpEnabledConfig = await getConfigFromStorage(nextUpEnabled);
    log(`Initial Skip Enabled: ${nextUpEnabledConfig}`);

    // Call skipElement for all relevant skips
    skipElement('Skip Intro');
    skipElement('Skip Recap');
    skipElement('Skip');
    skipNextUp('Next Up');
}

skipper().then(); // Blank then for IDE compliance
