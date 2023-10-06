let lastFetchTime = 0;
const fetchInterval = 5000;  // 5 seconds

async function eventHandler(details, inServiceWorker) {
    const currentTime = Date.now();
    if (currentTime - lastFetchTime <= fetchInterval) return;
    if (details.method !== "GET") return;
    if (!details.url.startsWith("https://leetcode.com/submissions/detail/") || !details.url.endsWith("/check/")) return;

    lastFetchTime = currentTime;

    // Log details for debugging
    console.log("Intercepted GET request to check endpoint:", JSON.stringify(details, null, 2));

    let fetchResponse = await fetch(details.url, {
        method: 'GET',
        headers: details.requestHeaders
    });

    let data = await fetchResponse.json();

    if (data.state === "SUCCESS") {
        console.log("Submission was successful.");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "success" });
        });
    }

}

chrome.webRequest.onCompleted.addListener(
    function (details) {
        eventHandler(details, true);
    },
    { urls: ["*://*.leetcode.com/*"] }
);