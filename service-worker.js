// required for updaiting/installing content scripts
let manifestData = chrome.runtime.getManifest();
// message all tabs
const messageAllTabs = (message) => {
    chrome.tabs.query(
        {
            url: manifestData.content_scripts[0].matches[0],
        },
        (tabs) =>
            tabs.forEach(
                (tab) => {
                    chrome.tabs.sendMessage(tab.id, {
                        ...message,
                    });
                },
                (error) => {
                    console.error(
                        "Error messaging all tab: " +
                            error +
                            "\nURL: " +
                            tab.url + 
                            "\nMessage: " + message
                    );
                }
            )
    );
};
// on install and update listener
chrome.runtime.onInstalled.addListener((details) => {
    // one install or update
    //TODO: can be set to update only on major version change
    if (
        details.reason === chrome.runtime.OnInstalledReason.INSTALL ||
        details.reason === chrome.runtime.OnInstalledReason.UPDATE
    ) {
        console.log("Installing or updating...");
        // inject scripts
        chrome.tabs.query(
            {
                url: manifestData.content_scripts[0].matches[0],
            },
            (tabs) =>
                tabs.forEach(
                    (tab) => {
                        // ignore chrome:// pages
                        console.log("Injecting scripts to tab: " + tab.url);
                        if (tab.url?.startsWith("chrome://")) return;
                        chrome.scripting.executeScript({
                            target: {
                                tabId: tab.id,
                            },
                            files: [...manifestData.content_scripts[0].js],
                        });
                    },
                    (error) => {
                        console.error(
                            "Error injecting scripts on install/update: " +
                                error
                        );
                    }
                )
        );
    }
});

/// Chrome message receiver
chrome.runtime.onMessage.addListener((request, sender) => {
    var tab = sender.tab;
    switch (request.action) {
        case "read":
            chrome.tts.speak(
                request.text,
                {
                    voiceName: "Microsoft George - English (United Kingdom)",
                    rate: 0.8,
                    lang: "en-GB",
                    onEvent: (event) => {
                        // TODO: this event handeler should be in for cleaner code
                        switch (event.type) {
                            case "start":
                                break;
                            case "word":
                                console.log(
                                    "TTS word: " +
                                        event.charIndex +
                                        " " +
                                        event.length
                                );
                                chrome.tabs.sendMessage(tab.id, {
                                    action: "mark-word",
                                    charIndex: event.charIndex,
                                    length: event.length,
                                });
                                break;
                            case "sentence":
                                // not used
                                console.log(
                                    "TTS sentence: " +
                                        event.charIndex
                                );
                                break;
                            case "end":
                                console.log("TTS end");
                                messageAllTabs({ action: "unmark-all" });
                                break;
                            case "interrupted":
                                console.log("TTS interrupted");
                                messageAllTabs({ action: "unmark-all" });
                                break;
                            case "cancelled":
                                console.log("TTS cancelled");
                                messageAllTabs({ action: "unmark-all" });
                                break;
                            case "error":
                                break;
                            default:
                                // as a fail safe, unmark all
                                // messageAllTabs({action: "unmark-all"});
                                console.error(
                                    "Unknown TTS event: " + event.type
                                );
                                break;
                        }
                    },
                },
                function () {}
            );
            break;
        default:
            console.error("Unknown action in message: " + request.action);
            break;
    }
});
