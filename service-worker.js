// TTS message receiver from content-script.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.tabs.query({active : true, lastFocusedWindow : true}, function (tabs) {
        var CurrTab = tabs[0];

        if (request.action === "read") {  
            chrome.tts.speak(
                request.text, 
                {
                    voiceName: "Microsoft George - English (United Kingdom)",
                    rate: 0.8, 
                    lang: 'en-GB',
                    onEvent: function(event) 
                    {
                        console.log("TTS event: " + event.type);
                        switch(event.type) {
                            case 'start':
                                break;
                            case 'word':
                                console.log("TTS read event data: " + event.charIndex + " " + event.length);
                                chrome.tabs.sendMessage(CurrTab.id, 
                                    {
                                        action: "highlight-word",
                                        charIndex: event.charIndex, 
                                        length: event.length
                                    });
                                break;
                            case 'interrupted':
                                break;
                            case 'cancelled':
                                break;
                            case 'error':
                                break;
                            default:
                                break;
                        }
                    }
                }, 
                function() {});
        }
    })
});
