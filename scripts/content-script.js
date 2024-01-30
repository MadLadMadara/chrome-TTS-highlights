// element to be read aloud by TTS
let nodesToSpeak = {
    reading: false,
    nodes: [],
    currentIndex: 0,
    startOffset: 0,
    endOffset: 0,
    reset: function () {
        this.reading = false;
        this.nodes = [];
        this.currentIndex = 0;
        this.initialOffset = 0;
    },
};

// using Levenshtein distance algorithm to compare strings
// https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (
        (longerLength - editDistance(longer, shorter)) /
        parseFloat(longerLength)
    );
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue =
                            Math.min(Math.min(newValue, lastValue), costs[j]) +
                            1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
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

            // create an array of the selected text seperated by new lines
            // new line seems to be a good indecater of a new element, not perfect but good enough for now
            // TODO: Will need refinement and tinkering to get this working well
            const selectedTextArray = selection
                .toString()
                .split(/\r?\n/)
                .filter((text) => text)
                .map(function(item) {
                    return item.trim();
                });;

            let search_set = new Set();
            selectedTextArray.forEach((text) => {
                search_set.add({
                    text: text.trim(),
                    node_similarity: 0.0,
                    node: null,
                });
            });

            console.log("selection:", selection.toString(), selection);
            console.log("range:", range);
            console.log("selectedTextArray:", selectedTextArray);
            // get the nodes that contain the selected text
            const root = range.commonAncestorContainer;

            // tree walker to find text nodes
            // will need to handle hidden text nodes
            const treeWalker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_ALL,
                {
                    acceptNode(node) {
                        if (    
                            node.nodeName == "SCRIPT" ||
                            node.nodeName == "STYLE" ||
                            node.nodeName == "BR" ||
                            node.nodeName == "HR" ||
                            node.tagName=="IMG"
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }else if (node.textContent === undefined) return NodeFilter.FILTER_SKIP;
                        return NodeFilter.FILTER_ACCEPT;
                    },
                },
                false
            );

            

            console.time("Tree walker loop");
            let currentDocumentNode = root;
            do {
                let textContent = currentDocumentNode.textContent;                
                console.group("tree walker loop:", currentDocumentNode.nodeName, currentDocumentNode.nodeType, currentDocumentNode);
                search_set.forEach((node) => {
                    console.group("Search text:", node.text);
                    console.group("Text in element");

                    let include = textContent.includes(node.text);                
                    console.log("textContent:", textContent);
                    console.log("textContent include:", include);
                    $( `:contains('${node.text}')`).css( "text-decoration", "underline" )
                    if (include) {
                        node.node = currentDocumentNode;
                        let sim = similarity(node.text, textContent)
                        node.node_similarity = sim;
                        console.log("textContent sim:", sim);
                    }
                    
                    console.groupEnd();
                    console.groupEnd();
                });
                console.groupEnd();
            } while (currentDocumentNode = treeWalker.nextNode());
            console.timeEnd("Tree walker loop");
            console.log("found nodes", search_set);

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
