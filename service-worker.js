import {ttsConfig}  from './locales.js';
// required for updating/installing content scripts
let manifestData = chrome.runtime.getManifest();
// call a function on all tabs that match the content script url and
/// pass the tab to the function
const foreachTab = (onTab) => {
    chrome.tabs.query(
        {
            url: manifestData.content_scripts[0].matches[0],
        },
        (tabs) =>
            tabs.forEach((tab) => {
                onTab(tab);
            })
    );
};
// event handler for TTS
const ttsEventHandler = (event, tab) => {
    switch (event.type) {
        case "start":
            break;
        case "word":
            console.log("TTS word: " + event.charIndex + " " + event.length);
            chrome.tabs.sendMessage(tab.id, {
                action: "mark-word",
                charIndex: event.charIndex,
                length: event.length,
            });
            break;
        case "end":
        case "interrupted":
        case "cancelled":
            console.log("TTS " + event.type);
            foreachTab((tab) => {
                chrome.tabs.sendMessage(tab.id, {
                    action: "unmark-all",
                });
            });
            break;
        case "error":
            console.error("TTS error: " + event.errorMessage);
            break;
        default:
            // as a fail safe, unmark all
            // messageAllTabs({action: "unmark-all"});
            console.error("Unknown TTS event: " + event.type);
            break;
    }
};
// on install and update listener
chrome.runtime.onInstalled.addListener((details) => {
    // one install or update
    //TODO: can be set to update only on major version change
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        console.log("Installing...");
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        console.log("Updating...");
        // inject scripts into all tabs that match the content script url
        foreachTab((tab) => {
            console.log("Injecting content scripts to tab URL: " + tab.url);
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id,
                },
                files: [...manifestData.content_scripts[0].js],
            });
        });
    }
});

/// Chrome message receiver
chrome.runtime.onMessage.addListener((request, sender) => {
    switch (request.action) {
        case "read":
            chrome.tts.speak(
                request.text,
                {
                    voiceName: "Microsoft George - English (United Kingdom)",
                    rate: 0.8,
                    lang: "en-GB",
                    onEvent: (event) => ttsEventHandler(event, sender.tab),
                    requiredEventTypes: ttsConfig.eventsWhiteList,
                    desiredEventTypes: ttsConfig.eventsWhiteList,
                },
                function () {}
            );
            break;
        default:
            console.error("Unknown action in message: " + request.action);
            break;
    }
});
