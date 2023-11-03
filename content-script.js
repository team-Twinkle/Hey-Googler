console.log("side-panel script loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg == "toggle") {
        console.log("message received");
        toggle();
    }
    if (msg === 'referrer') {
        const referrer = document.referrer;
        const title = document.title;
        const url = document.baseURI;
        //console.log(referrer);
        sendResponse({ referrer: referrer, title: title, url: url });
    }
});

var iframe = document.createElement('iframe');
iframe.id = "IFRAME";
iframe.style.background = "White";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.left = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.border = "0px";
iframe.style.opacity = 0.8;
iframe.style.boxShadow = '15px 0 35px rgba(0,0,0,.12)';
iframe.src = chrome.runtime.getURL("list.html")

var bg = document.createElement('div');

bg.id = 'background';
bg.style.width = '100%';
bg.style.height = '100%';
bg.style.overflow = 'hidden';
bg.style.zIndex = '9999999';
bg.style.display = 'none';
bg.style.position = 'fixed';
bg.style.left = '0px';
bg.style.top = '0px';
bg.style.background = 'white';
bg.style.opacity = '0.7';

document.body.appendChild(iframe);
document.body.appendChild(bg);

function toggle() {
    if (iframe.style.width == "0px") {
        iframe.style.width = "367px";
        bg.style.display = 'block';
        iframe.animate(
            {
                transform: [
                    'translateX(-367px)',
                    'translateX(0px)'
                ]
            },
            {
                duration: 300,
                fill: 'forwards',
                easing: 'ease'
            }
        );
    }
    else {
        iframe.animate(
            {
                transform: [
                    'translateX(0px)',
                    'translateX(-367px)'
                ]
            },
            {
                duration: 200,
                fill: 'none',
                easing: 'ease'
            }
        ).onfinish = () => {
            iframe.style.width = '0px';
        };
        bg.style.display = 'none';
    }
}

bg.addEventListener('click', () => {
    iframe.animate(
        {
            transform: [
                'translateX(0px)',
                'translateX(-367px)'
            ]
        },
        {
            duration: 200,
            fill: 'none',
            easing: 'ease'
        }
    ).onfinish = () => {
        iframe.style.width = '0px';
    };
    bg.style.display = 'none';
})