// element to be read aloud by TTS
let nodesToSpeak = {
    reading: false,
    nodes: [],
    currentIndex: 0,
    initialOffset: 0,
    reset: function () {
        this.reading = false;
        this.nodes = [];
        this.currentIndex = 0;
        this.initialOffset = 0;
    },
};
// let currentElement = null;
// $(document).on("click", (event) => {
//     let target = event.target;
//     currentElement = target;
//     chrome.runtime.sendMessage({
//         action: "read",
//         data: { text: target.textContent },
//     });
// });

// Chrome message receiver
chrome.runtime.onMessage.addListener((request) => {
    switch (request.action) {
        case "mark-word":
            $(document).unmark();
            var startIndex = request.data.charIndex;
            var wordLength = request.data.length;
            console.log(
                "Request " +
                    request.action +
                    " " +
                    startIndex +
                    " " +
                    wordLength
            );
            $(currentElement).markRanges([
                { start: startIndex, length: wordLength },
            ]);
            break;
        case "read-selection":
            // TODO: need to work out how to handle multiple elements selected
            // TODO: highlighting the correct text in the dom is not working,
            // issue with tree walker and SHOW_TEXT
            // get the selected text
            // Will need to make tree walker that can find groups of sibling text nodes that match what is being spoken
            // https://phuoc.ng/collection/this-vs-that/node-iterator-vs-tree-walker/
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);

            const selectedTextArray = selection
                .toString()
                .split(/\r?\n/)
                .filter((text) => text);
            const maxContentLength =
                range.startOffset +
                selectedTextArray.reduce(
                    (max, text) => Math.max(max, text.length),
                    0
                ) +
                range.endOffset;
            console.log("selection:", selection);
            console.log("range:", range);
            console.log("text:", selectedTextArray);
            console.log("maxContentLength:", maxContentLength);

            // get the nodes that contain the selected text
            const root = range.commonAncestorContainer;
            const treeWalker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode(node) {
                        if (
                            node.textContent === undefined ||
                            node.textContent === null
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        } else if (
                            node.textContent.length > maxContentLength ||
                            node.textContent === ""
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    },
                }
            );

            const recursiveParentFind = (currentNode, text) => {
                if (currentNode === null || currentNode === undefined || currentNode.nodeType == Node.DOCUMENT_NODE) {
                    return null;
                } else {
                    if (currentNode.textContent === text) {
                        return currentNode;
                    } else {
                        return recursiveParentFind(
                            currentNode.parentElement,
                            text
                        );
                    }
                }
            }

            let _nodes = new Set();
            let selectedTextArrayIndex = 0;
            let currentNode = treeWalker.currentNode;
            while ((currentNode = treeWalker.nextNode())) {
                console.log("currentNode:", currentNode);
                console.log("selectedTextArray", selectedTextArrayIndex, selectedTextArray[selectedTextArrayIndex]);
                if (selectedTextArrayIndex > selectedTextArray.length) break;
                if(currentNode.textContent.length > selectedTextArray[selectedTextArrayIndex].length) continue;
                if(currentNode.textContent === selectedTextArray[selectedTextArrayIndex]) {
                    _nodes.add(currentNode);
                    selectedTextArrayIndex++;
                }else if(selectedTextArray[selectedTextArrayIndex].includes(currentNode.textContent)) {
                    
                    let parentWithContextMatch = recursiveParentFind(currentNode, selectedTextArray[selectedTextArrayIndex])
                    if(parentWithContextMatch !== null) {
                        _nodes.add(parentWithContextMatch);
                        selectedTextArrayIndex++;
                    }
                }
            }
            console.log("nodes:", _nodes);
            break;
        case "unmark-all":
            $(document).unmark();
            break;
        case "test":
            console.log("Test message received", request);
            break;
        default:
            $(document).unmark();
            console.error("Unknown action: " + request.action);
            break;
    }
});
