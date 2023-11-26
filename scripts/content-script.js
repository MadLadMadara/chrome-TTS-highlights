let currentElement = null;

// Events on the page
$(document).on('click', function(e) {
    currentElement = e.target; 
    console.log("Clicked: " + $(currentElement).text());
    chrome.runtime.sendMessage(
        {
            action: "read",
            text: currentElement.textContent
        }
    );
});

// TTS message receiver from service-worker.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // highlight-word word in current element
        if (request.action === "highlight-word") {
            // Get the text content of the element
            $(document).unmark();
            var startIndex = request.charIndex;
            var wordLength = request.length;
            console.log("Request" + request.action + " " + startIndex + " " + wordLength);
            console.log("Highlighting: ");
            $(currentElement).markRanges([{ start: startIndex, length: wordLength }]);
        }
    }
);
