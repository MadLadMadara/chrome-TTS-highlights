import'/node_modules/jquery/dist/jquery.js'; 
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "get_dom_text_content"},
        (response)=> {
            console.log(response);
        }
    );
});
