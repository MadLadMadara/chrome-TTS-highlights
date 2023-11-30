import {ttsConfig, contextMenuConfig}  from './locales.js';
// required for updating/installing content scripts
const manifestData = chrome.runtime.getManifest();
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
                data :{
                    charIndex: event.charIndex,
                    length: event.length,
                }
            });
            break;
        case "end":
        case "interrupted":
        case "cancelled":
            console.log("TTS " + event.type);
            foreachTab((tab) => {
                chrome.tabs.sendMessage(tab.id, {
                    action: "unmark-all",
                    data: null
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
    // context set up, create context menu items from config
    for (const [key, value] of Object.entries(contextMenuConfig)) {
        chrome.contextMenus.create({
            ...value
        });
    }
    // one install or update
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

// context menu click listener
chrome.contextMenus.onClicked.addListener((item, tab) => {
    console.log("Context menu item clicked: " + item.menuItemId);
    switch (item.menuItemId) {
        // on select
        case contextMenuConfig.select.id:
            chrome.tabs.sendMessage(tab.id, {
                action: "read-selection",
                data: null
            });
            break;
        // on stop
        case contextMenuConfig.stop.id:
            chrome.tts.stop();
            break;
        default:
            console.error("Unknown context menu item: " + item.menuItemId);
            break;
    }
});

/// Chrome message receiver
chrome.runtime.onMessage.addListener((request, sender) => {
    switch (request.action) {
        case "read":
            chrome.tts.speak(
                request.data.text,
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
