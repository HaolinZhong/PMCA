let lastFetchTime = 0;
const fetchInterval = 100;  // 5 seconds

async function eventHandler(details, inServiceWorker) {
    const currentTime = Date.now();
    if (currentTime - lastFetchTime <= fetchInterval) return;
    if (details.method !== "GET") return;
    if (!details.url.startsWith("https://leetcode.com/submissions/detail/") || !details.url.endsWith("/check/")) return;

    lastFetchTime = currentTime;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "success" });
    });


}

chrome.webRequest.onCompleted.addListener(
    function (details) {
        eventHandler(details, true);
    },
    { urls: ["*://*.leetcode.com/*"] }
);