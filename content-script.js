console.log("side-panel script loaded");

chrome.runtime.onMessage.addListener((msg, sender,sendResponse)=>{
    if(msg == "toggle"){
        console.log("message received");
        toggle();
    }
    else if(msg ==='referrer'){
        var referrer=document.referrer;
        //console.log(referrer);
        sendResponse(referrer);
    }
});

var iframe = document.createElement('iframe'); 
iframe.id="IFRAME"
iframe.style.background = "White";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.left = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.border = "0px"; 
iframe.style.opacity = 0.8; 
iframe.src = chrome.runtime.getURL("list.html")

document.body.appendChild(iframe);

function toggle(){
    if(iframe.style.width == "0px"){
        iframe.style.width="367px";
    }
    else{
        iframe.style.width="0px";
    }
}
