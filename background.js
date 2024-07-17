// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "log") {
        console.log(request.message); // Logs will be visible in the background console
    }
});
