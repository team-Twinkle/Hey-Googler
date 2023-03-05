//아이콘 클릭했을 때 이벤트
{chrome.action.onClicked.addListener(tab => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs=> {
    currentTab = tabs[0];
    currentURL=currentTab.url;
    let URLstart=currentURL.substr(0,9);
    //console.log(URLstart);
    //console.log(currentURL);
    if(URLstart=='chrome://'){ // URL이 'chrome://' 로 시작한다면 새탭 생성
      chrome.tabs.create({
        url: "newTab.html",
        active:true
      });
    } 
    else{ // 아니라면 사이드바 생성
      chrome.tabs.sendMessage(tab.id,"toggle");
      console.log('message sent');
    }
 });
});}


//현재 탭과 이전 탭 저장
var beforeTab;
var currentTab;
chrome.tabs.onActivated.addListener(activeInfo=>{
  beforeTab = currentTab;
  console.log("activated changing")
  chrome.tabs.onUpdated.addListener((currentTabId,changingInfo,tabs)=>{
    //console.log(currentTabId);
    chrome.tabs.get(currentTabId,Tab=>{
      currentTab=Tab.url;
    })
    console.log('        b      ' + beforeTab);
    console.log('   c    '+currentTab);
  })
});



let visitedSites = [];
let searchKeywords = [];


//방문 기록 리스트 추가 및 콘솔 출력
chrome.history.onVisited.addListener((historyItem) => { //url을 새로 방문할 때마다 
  visitedSites.push({url: historyItem.url, title: historyItem.title});   //url 과 title 을 확인하고
  console.log("Visited Site:", historyItem.url, historyItem.title);

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) =>{   //referrer 를 확인한다 ! 
    if (changeInfo.status === 'complete'){
      chrome.tabs.sendMessage(tabId,"referrer",response=>{
        var referrer = response; //referrer 얻은 데이터 !!
        console.log("===========================>>>>>"+referrer);
        
        if(referrer=='https://www.google.com/'){//1차링크 추적 
            //1차링크의 검색어 추적
            const url = new URL(beforeTab);
            keyword1 = url.searchParams.get("q"); //1차링크의 검색어 
            console.log(keyword1);
            // 이 if 문 안에서 keyword 랑 url 이랑 title 을 모두 접근 가능하다.
        }   
      });
    }
  });
  
  
});


//새 탭 기록 리스트 추가 및 콘솔 출력
chrome.tabs.onCreated.addListener((tab) => {
  visitedSites.push({url: tab.url, title: tab.title});
  console.log("Created Tab:", tab.url, tab.title);
});

//새 창 기록 리스트 추가 및 콘솔 출력
chrome.windows.onCreated.addListener((window) => {
  visitedSites.push({url: window.tabs[0].url, title: window.tabs[0].title});
  console.log("Created Window:", window.tabs[0].url, window.tabs[0].title);
});


//구글 검색어 리스트 추가 및 콘솔 출력
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = new URL(details.url);
  if (url.hostname === "www.google.com" && url.pathname === "/search") {
    const query = url.searchParams.get("q");
    if (query) {
      searchKeywords.push(query);
      console.log("Google Search:", query);
    }
  }
});
