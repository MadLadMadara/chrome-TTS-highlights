(async () => {
    // main body, required for top level await of imports
    console.log("content-script.js loaded");
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
            case "get_dom_text":
                sendResponse(document.all[0].outerHTML);
                break;
            default:
                break;
        }
    });
})();
