// message all tabs
const messageAllTabs = (message) => {
    chrome.tabs.query({}, (tabs) => tabs.forEach( tab => {
        
    }));
}
// on install and update listener
chrome.runtime.onInstalled.addListener((details) => {
    // one install or update
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL || 
        details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
            console.log("Installing or updating...");
        // inject scripts to all tabs
        chrome.tabs.query({url:"*://*/*"}, (tabs) => tabs.forEach( tab => {
            // ignore chrome:// pages
            console.log("Injecting scripts to tab: " + tab.url);
            if (tab.url?.startsWith("chrome://")) return;
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },files: [
                    "thirdPartyScripts/jquery-3.7.1.min.js",
                    "thirdPartyScripts/jquery.mark.min.js",
                    "scripts/content-script.js"
                ]
            });
        }, (error) => {
            console.error("Error injecting scripts on install/update: " + error);
        }));
    }
    // one install or update
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      

    }else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {

    }
});

/// Chrome message receiver
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var CurrTab = sender.tab;
    switch(request.action) {  
        case "read":
            chrome.tts.speak(
                request.text, 
                {
                    voiceName: "Microsoft George - English (United Kingdom)",
                    rate: 0.8, 
                    lang: 'en-GB',
                    onEvent: (event) => {
                        switch(event.type) {
                            case 'start':
                                break;
                            case 'word':
                                console.log("TTS word: " + event.charIndex + " " + event.length);
                                chrome.tabs.sendMessage(CurrTab.id, 
                                    {
                                        action: "mark-word",
                                        charIndex: event.charIndex, 
                                        length: event.length
                                    });
                                break;
                            case 'end':
                                console.log("TTS end")
                                messageAllTabs({action: "unmark-all"});
                                break;
                            case 'interrupted':
                                console.log("TTS interrupted");
                                messageAllTabs({action: "unmark-all"});
                                break;
                            case 'cancelled':
                                console.log("TTS cancelled");
                                messageAllTabs({action: "unmark-all"});
                                break;
                            case 'error':
                                break;
                            default:
                                // as a fail safe, unmark all
                                // messageAllTabs({action: "unmark-all"});
                                console.error("Unknown TTS event: " + event.type);
                                break;
                        }
                    }
                }, 
                function() {});
                break;
        default:
            console.error("Unknown action in message: " + request.action);
            break;
    }
});
