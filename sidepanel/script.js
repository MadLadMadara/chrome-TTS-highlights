// imports
import "/node_modules/jquery/dist/jquery.js";
import Readability from "/node_modules/@mozilla/readability/Readability.js";
import isProbablyReaderable from "/node_modules/@mozilla/readability/Readability-readerable.js";
import { JSDOM } from "/lib/jsdom.js";
// constants
const manifestData = chrome.runtime.getManifest();
// on panel open event
(async () => {
    // main body, required for top level await of imports
    console.log("sidepanel/script.js loaded");
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(
        tab[0].id,
        { action: "get_dom_text" },
        (response) => {
            const document = new JSDOM(response, {
                url: tab[0].url,
                referrer: tab[0].url,
                contentType: "text/html",
                includeNodeLocations: true,
            }).window.document;
            if (isProbablyReaderable(document)) {
                console.log("This page is readerable");
            } else {
                console.log("This page is not readerable");
            }
            chrome.sidePanel.open({ windowId: tab[0].windowId });
            const reader = new Readability(document).parse();
            console.group("Readability");
            console.log(`Title: ${reader.title}`);
            console.log(`Byline: ${reader.byline}`);
            console.log(`Content: ${reader.content}`);
            console.log(`Text Content: ${reader.textContent}`);
            $("main").append(`${reader.content}`);
        }
    );
})();
