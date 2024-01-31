// local variables
import { ttsConfig } from "./locales.js";
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
        // open side panel
        // must be done first or will get error
        await chrome.sidePanel.open({ windowId: tab.windowId });
        // const response = await chrome.tabs.sendMessage(tab.id, {
        //     action: "get_dom_text_content",
        // });
        // console.log(response);
    }
});
// TODO: add event listener for when active tab changes.
