chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "get_dom_text_content":
            sendResponse({ data: getDomTextContent() });
            break;
        default:
            break;
    }
});

function getDomTextContent(root = document.body) {
    console.group("Getting DOM text content");
    console.time("Tree walker loop");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    let elements = [];
    while ((node = walker.nextNode())) {

            elements.push(node);

    }
    console.log(elements);
    console.timeEnd("Tree walker loop");
    console.groupEnd();
    return elements;
}
