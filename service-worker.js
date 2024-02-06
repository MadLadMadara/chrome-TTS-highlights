// imports and local variables

import Readability from "/node_modules/@mozilla/readability/Readability.js";
import isProbablyReaderable from "/node_modules/@mozilla/readability/Readability-readerable.js";
import {JSDOM} from '/lib/jsdom.js';         

// required for updating/installing content scripts
const manifestData = chrome.runtime.getManifest();
// var { Readability } = require('@mozilla/readability');
// var { JSDOM } = require('jsdom');
// var doc = new JSDOM("<body>Look at this cat: <img src='./cat.jpg'></body>", {
//   url: "https://www.example.com/the-page-i-got-the-source-from"
// });
// let reader = new Readability(doc.window.document);
// let article = reader.parse();


// on install
chrome.runtime.onInstalled.addListener((details) => {
    // create context menu
    chrome.contextMenus.create({
        id: "openSidePanel",
        title: "Open TTS Highlighter Side Panel",
        contexts: ["all"],
    });
    console.log("TTS Highlighter installed");
});

// on context menu click events
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "openSidePanel") {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

// chrome.contextMenus.onClicked.addListener(async (info, tab) => {
//     if (info.menuItemId === "openSidePanel") {
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             chrome.tabs.sendMessage(
//                 tabs[0].id,
//                 {action: "get_dom_text"},
//                 (response) => {
//                     const document = new JSDOM(response, {
//                         url: tabs[0].url,
//                         referrer: tabs[0].url,
//                         contentType: "text/html",
//                         includeNodeLocations: true,
//                     }).window.document;
//                     if (isProbablyReaderable(document)) {
//                         console.log("This page is readerable");
//                     } else {
//                         console.log("This page is not readerable");
//                     }
//                     chrome.sidePanel.open({ windowId: tab.windowId });

//                     const reader = new Readability(document).parse();
//                     console.group("Readability");
//                     console.log(`Title: ${reader.title}`);
//                     console.log(`Byline: ${reader.byline}`);
//                     console.log(`Content: ${reader.content}`);
//                     console.log(`Text Content: ${reader.textContent}`);
//                     console.log(`Length: ${reader.length}`);
//                     console.log(`Excerpt: ${reader.excerpt}`);
//                     console.log(`Site Name: ${reader.siteName}`);
//                     console.log(`Direction: ${reader.dir}`);
//                     console.log(`Language: ${reader.lang}`);
//                     console.groupEnd();
//                 }
//             );
//         });
//     }
// });

