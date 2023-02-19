console.log("side-panel script loaded");

chrome.runtime.onMessage.addListener((msg, sender,sendResponse)=>{
    if(msg == "toggle"){
        console.log("message received");
        toggle();
    }
    else if(msg=="message for getting search term from background.js"){
        console.log("message received and send data");
        let search_term = document .querySelectorAll('input.gLFyf')[0].value;
        console.log("we will send "+ search_term); //검색 키워드
        sendResponse(search_term);
    }
});

var iframe = document.createElement('iframe'); 
iframe.style.background = "White";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.left = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.border = "0px"; 
iframe.style.opacity = 0.8; 
iframe.src = chrome.runtime.getURL("popup.html")

document.body.appendChild(iframe);

function toggle(){
    if(iframe.style.width == "0px"){
        iframe.style.width="367px";
    }
    else{
        iframe.style.width="0px";
    }
}