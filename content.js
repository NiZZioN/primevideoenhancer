const DEBUG = false;

let skipEnabledConfig;
let nextUpEnabledConfig;
let nextDelayConfig;
let skipDelayConfig;

function log(msg){
    if(!DEBUG) return;
    var date = new Date().toLocaleString();
    //chrome.runtime.sendMessage({ type: 'log', message: `[${date}] - [PRIME VIDEO ENHANCER] >>> ${message}` });
    console.log(`[${date}] [PRIME VIDEO ENHANCER] >>> ${msg}`);
}


function getElement(div){
    var skipBtn = document.querySelector(`.${div}`)
    if(skipBtn){
        return skipBtn;
    }
    return null;
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


function handleSkipAndNextUp(){
    var skipBtn = getElement("atvwebplayersdk-skipelement-button");
    log(`Skip btn exists: ${skipBtn}`);
    if(skipBtn && skipEnabledConfig){
        log("Skip button clicked...");
        skipBtn.click();
    }

    var nextUpCard = getElement("atvwebplayersdk-nextupcard-show");
    log(`NextUpCard exists: ${nextUpCard}`);
    if(nextUpCard && nextUpEnabledConfig){
        var nextUpBtn = getElement("atvwebplayersdk-nextupcard-button");
        if(nextUpBtn){
            log("NextUp button clicked...");
            nextUpBtn.click();
        }
    }
}

function observeNextUpCard(){
    const nextUpCard = getElement('atvwebplayersdk-nextupcard-wrapper');
    if (!nextUpCard) {
        log('Next up card wrapper not found.');
        return;
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        log(`Added node: ${node.outerHTML}`);
                        var nextUpBtn = node.querySelector('.atvwebplayersdk-nextupcard-button');
                        log(`NextUp element btn: ${nextUpBtn}`);
                        if(nextUpEnabledConfig && nextUpBtn){
                            setTimeout(() => {
                                log(`Next button clicked...`);
                                nextUpBtn.click();
                            }, nextDelayConfig);
                        }
                    }
                });
            }
        }
    });

    observer.observe(nextUpCard, {
        childList: true,
        subtree: true
    });

    log("MutationObserver for next up card initialized.");
}


function observeActionButtons() {
    const actionButtons = getElement('atvwebplayersdk-action-buttons');
    if (!actionButtons) {
        log('Action buttons container not found.');
        return;
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        log(`Added node: ${node.outerHTML}`);
                        var skipBtn = node.querySelector('.atvwebplayersdk-skipelement-button');
                        log(`Skip element btn: ${skipBtn}`);
                        if(skipEnabledConfig && skipBtn){
                            setTimeout(() => {
                                log(`${skipBtn.innerText} button clicked...`);
                                skipBtn.click();
                            }, skipDelayConfig);
                        }
                    }
                });
                // TODO: might be useful, when a node gets removed...
                // mutation.removedNodes.forEach(node => {
                //     if (node.nodeType === Node.ELEMENT_NODE) {
                //         log(`Removed node: ${node.outerHTML}`);
                //     }
                // });
            }
        }
    });

    observer.observe(actionButtons, {
        childList: true,
        subtree: true
    });

    var skipBtn = document.querySelector('.atvwebplayersdk-skipelement-button');
    if(skipBtn){
        log(`${skipBtn.innerText} initally there, button clicked...`);
        skipBtn.click()
    }

    log("MutationObserver for action buttons initialized.");
}


async function rerunScript() {
    log("Re-initializing script...");
    skipEnabledConfig   = await getConfigFromStorage('skipEnabled');
    nextUpEnabledConfig = await getConfigFromStorage('nextUpEnabled');
    skipDelayConfig     = await getConfigFromStorage('skipDelay');
    nextDelayConfig     = await getConfigFromStorage('nextDelay');
    handleSkipAndNextUp();
    observeActionButtons();
    observeNextUpCard();
}

function observeVideoChange() {
    const videoPlayer = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video"); // Adjust this selector as needed
    if (!videoPlayer) {
        log('Video player not found.');
        return;
    }

    const observer = new MutationObserver(() => {
        log('Video changed, re-running script...');
        setTimeout(() => {
            rerunScript();
        }, 1000);
    });

    observer.observe(videoPlayer, {
        attributes: true, // Watch for attribute changes
        childList: true, // Watch for child changes
        subtree: true // Watch all descendants
    });

    log("MutationObserver for video change initialized.");
}


(async () => {
    log("Initial Run...");

    browser.storage.onChanged.addListener((changes, area) => {
        if (changes.hasOwnProperty('skipEnabled')) {
            skipEnabledConfig = changes['skipEnabled'].newValue;
            log(`Skip Enabled Changed: ${skipEnabledConfig}`);
        }
        if (changes.hasOwnProperty('nextUpEnabled')) {
            nextUpEnabledConfig = changes['nextUpEnabled'].newValue;
            log(`Next Up Enabled Changed: ${nextUpEnabledConfig}`);
        }
        if (changes.hasOwnProperty('nextDelay')) {
            nextDelayConfig = changes['nextDelay'].newValue;
            log(`Next delay Changed: ${nextDelayConfig}`);
        }
        if (changes.hasOwnProperty('skipDelay')) {
            skipDelayConfig = changes['skipDelay'].newValue;
            log(`Skip delay Changed: ${skipDelayConfig}`);
        }
    });

    skipEnabledConfig = await getConfigFromStorage('skipEnabled');
    log(`Initial Skip Enabled: ${skipEnabledConfig}`);
    nextUpEnabledConfig = await getConfigFromStorage('nextUpEnabled');
    log(`Initial Next Up Enabled: ${nextUpEnabledConfig}`);
    skipDelayConfig = await getConfigFromStorage('skipDelay');
    log(`Initial Skip Delay: ${skipDelayConfig}`);
    nextDelayConfig = await getConfigFromStorage('nextDelay');
    log(`Initial Next Up Delay: ${nextDelayConfig}`);



    setTimeout(() => {
        handleSkipAndNextUp();
        observeActionButtons();
        observeNextUpCard();
        observeVideoChange();
    }, 2000);
})().then();
