(async () => {
    // main body, required for top level await of imports
    console.log("content-script.js loaded");
    await import(chrome.runtime.getURL("/node_modules/jquery/dist/jquery.js"));
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
            case "get_treeWalker_all":
                sendResponse(getAllRelevantDomElements());
                break;
            default:
                break;
        }
    });
})();

function getAllRelevantDomElements(root = document) {
    const treeWalker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode(node) {
                console.log(node.role);
                if (
                    (node.tagName === "TITLE" ||
                        node.tagName === "HEADER" ||
                        node.tagName === "MAIN" ||
                        node.tagName === "SECTION" ||
                        node.tagName === "ARTICLE") &&
                    node.textContent.trim().length > 0 &&
                    node.hidden === false
                ) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            },
        }
    );

    
    let elements = [];
    while (treeWalker.nextNode()) {
        let children = [];
        treeWalker.currentNode.childNodes.forEach((child) => {
            children.push({
                tagName: child.tagName,
                textContent: child.textContent,
            });
        });

        elements.push({
            tagName: treeWalker.currentNode.tagName,
            childNodes: children,
        });
    }
    return elements;
}
