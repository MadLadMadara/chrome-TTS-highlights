chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "get_dom_text_content":
            let domTextContent = getDomTextContent();
            sendResponse(domTextContent);
            break;
        default:
            break;
    }
});
console.log("content-script.js loaded");
function getDomTextContent(root = document) {


}
