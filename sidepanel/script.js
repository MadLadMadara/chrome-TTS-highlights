chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "get_dom_text_content"},
        (response)=> {
            $("#text-area").text(response.data);
            console.log(response);
        }
    );
});
