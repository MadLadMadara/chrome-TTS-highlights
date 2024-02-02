// local variables


console.log("service-worker.js loaded");
import { ttsConfig } from "./locales.js";
import isGibberish from "/node_modules/gibberish-detector/index.js";
// required for updating/installing content scripts
const manifestData = chrome.runtime.getManifest();
// on install
chrome.runtime.onInstalled.addListener((details) => {
    // create context menu
    chrome.contextMenus.create({
        id: "openSidePanel",
        title: "Open TTS Highlighter Side Panel",
        contexts: ["all"],
    });
});

// on context menu click events
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "openSidePanel") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {action: "get_treeWalker_all" },
                (response) => {
                    console.log(parseHTML(response));
                }
            );
        });
    }
});


// TODO: add event listener for when active tab changes.

const parseHTML = (treeWaler) => {
    console.log(treeWaler);
}

