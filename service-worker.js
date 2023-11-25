// TTS message receiver port
chrome.runtime.onConnect.addListener(function(port) {
    if (port.name !== "tts") {
        return;
    }
    port.onMessage.addListener(function(msg) {
        if (msg.action === "read") {
            chrome.tts.speak(msg.text, 
                    { rate: 0.8, onEvent: function(event) {}}, function() {});
        }
    });
});
