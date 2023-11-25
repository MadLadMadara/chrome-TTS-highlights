let port = chrome.runtime.connect({name: "tts"});

let currentElement = null;

// TTS message receiver port
port.onMessage.addListener(function(msg) {

});

// Events on the page
$(document).on('click', function(e) {
    currentElement = e.target;
    port.postMessage({action: "read", text: currentElement.textContent});

});
