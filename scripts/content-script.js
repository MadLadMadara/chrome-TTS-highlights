// element to be read aloud by TTS
let currentElement = null;

// Chrome message receiver
chrome.runtime.onMessage.addListener((request) => {
    switch (request.action) {
        case "mark-word":
            $(document).unmark();
            var startIndex = request.data.charIndex;
            var wordLength = request.data.length;
            console.log(
                "Request " + request.action + " " + startIndex + " " + wordLength
            );
            $(currentElement).markRanges([
                { start: startIndex, length: wordLength },
            ]);
            break;
        case "read-selection":
                // TODO: need to work out how to handle multiple elements selected
                // get the selected text
                // let selectedText = window.getSelection()
                // let selectedParentEl = selectedText.anchorNode.parentElement
                // let offSet = selectedText.anchorOffset;
                // console.log("Selected text: " + selectedParentEl.textContent);
                // console.log("Selected text start: " + offSet);

                let selection = window.getSelection(); 
                for (i=0; i<selection.rangeCount; i++)  {
                    range = selection.getRangeAt(i);

                    console.log(i); 
                    console.log(range);
                    console.log(range.commonAncestorContainer);
                }
            break
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
