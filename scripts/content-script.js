// element to be read aloud by TTS
let currentElement = null;
// Events on the page
$(document).on("click", function (e) {
    currentElement = e.target;
    console.log("Clicked: " + $(currentElement).text());
    chrome.runtime.sendMessage({
        action: "read",
        text: currentElement.textContent,
    });
});

// Chrome message receiver
chrome.runtime.onMessage.addListener((request) => {
    switch (request.action) {
        case "mark-word":
            $(document).unmark();
            var startIndex = request.charIndex;
            var wordLength = request.length;
            console.log(
                "Request" + request.action + " " + startIndex + " " + wordLength
            );
            console.log("Highlighting: ");
            $(currentElement).markRanges([
                { start: startIndex, length: wordLength },
            ]);
            break;
        case "unmark-all":
            $(document).unmark();
            break;
        default:
            $(document).unmark();
            console.error("Unknown action: " + request.action);
            break;
    }
});
