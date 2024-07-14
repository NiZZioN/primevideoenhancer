// background.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'PrimeAutoNext: Extension Installed',
        message: 'Please open the extension to set permissions and configure settings.',
        priority: 2
    });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "log") {
        console.log(request.message); // Logs will be visible in the background console
    }
});