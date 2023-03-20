var isExtensionOn = false;  //extension 의 현재 상태 저장 

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

chrome.runtime.onInstalled.addListener(() => { //action icon 에 extension 의 상태를 표시하기 위한 badge 초기화 시키는 코드
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

chrome.runtime.onMessage.addListener((msg)=>{  //list.js 로부터 메시지를 받아서 시작버튼 , 중지버튼 눌림에 따라 isExtensionOn 값 변경 및 badge 의 text 변경
  //console.log(msg);
  if(msg=="Start the extension from list.js"){
    isExtensionOn = true;
    console.log("is the extension ON? : " + isExtensionOn);
    chrome.action.setBadgeText({text:"ON"});
  }
  else if(msg=="Stop the extension from list.js"){
    isExtensionOn = false;
    console.log("is the extension ON? : " + isExtensionOn);
    chrome.action.setBadgeText({text:"OFF"});
  }
})


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
    //console.log('        b      ' + beforeTab);
    //console.log('   c    '+currentTab);
    currentURL = new URL(currentTab);
    if(currentURL.hostname==="www.google.com"){
      searchTab=currentTab;
      //console.log("    S       "+searchTab);
    }
  })
});




//방문 기록 리스트 추가 및 콘솔 출력


//중복 확인용으로 이미 추가된 URL을 저장하는 Set 객체 선언
const visitedUrls = new Set();
const visitedSites = [];

chrome.history.onVisited.addListener((historyItem) => {
  const url = historyItem.url;
//  console.log(historyItem.title);
  if (!visitedUrls.has(url)) { // Set 객체에 URL이 포함되어 있지 않은 경우에만 추가
    visitedUrls.add(url);
    chrome.history.search({text: url}, (historyItems) => {
      const title = historyItems[historyItems.length-1].title; 
      visitedSites.push({url: url, title: title});
      console.log("Visited Site:", url, title);
    });
  }
});




  chrome.tabs.onUpdated.addListener((tabId, changeInfo) =>{   //referrer 를 확인한다 ! 
    if (changeInfo.status === 'complete'){
      chrome.tabs.sendMessage(tabId,"referrer",response=>{
        var referrer = response; //referrer 얻은 데이터 !!
        console.log("===========================>>>>>"+referrer);
        
        if(referrer=='https://www.google.com/'){//1차링크 추적 
            //1차링크의 검색어 추적
            const url = new URL(searchTab);
            //console.log(url);
            keyword1 = url.searchParams.get("q"); //1차링크의 검색어 
            console.log("검색어는!!!!!!!!!!!!!!!!!!!!"+keyword1);
            // 이 if 문 안에서 keyword 랑 url 이랑 title 을 모두 접근 가능하다.
            var index = visitedSites.findIndex(e => e.url == currentTab);
            visitedSites[index].keywords = keyword1;
            console.log(index,"번 인덱스에 ", keyword1, "검색어를 저장!!");
        }   
      });
    }
  });
  
  


//새 탭 기록 리스트 추가 및 콘솔 출력
chrome.tabs.onCreated.addListener((tab) => {
  visitedSites.push({url: tab.url, title: tab.title, keywords: " "});
  console.log("Created Tab:", tab.url, tab.title);
});

//새 창 기록 리스트 추가 및 콘솔 출력
chrome.windows.onCreated.addListener((window) => {
  visitedSites.push({url: window.tabs[0].url, title: window.tabs[0].title, keywords: " "});
  console.log("Created Window:", window.tabs[0].url, window.tabs[0].title);
});

/*
//구글 검색어 리스트 추가 및 콘솔 출력
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = new URL(details.url);
  if (url.hostname === "www.google.com" && url.pathname === "/search") {
    const query = url.searchParams.get("q"); //query에 검색어 저장되어있음.
    if (query) {
      var index = visitedSites.findIndex(e => e.url == currentTab);
      visitedSites[index].keywords = query;
      console.log(index,"번 인덱스에 ", query, "검색어를 저장!!");
      console.log("Google Search:", query);
    }
  }
  else {
    var index = visitedSites.findIndex(e => e.url == currentTab);
    visitedSites[index].keywords = " ";
    console.log("Google Search: ");
  }
});
*/



/*
//데이터베이스 생성

const dbName = "the_url";

const urlData = [
    { url: "https://www.google.com", title: " ", keywords: " ", order: 0, dir: 1 },
    { url: "https://www.google.com/search?q=hahaha", title: "hahaha - Google Search",  keywords: "hahaha", order: 1, dir: 1 }
  ];

//DB 오픈
var request = indexedDB.open(dbName, 2);

request.onerror = function(event) {
  console.log("indexedDB error: " + event.target.errorCode);
};

//onupgradeneeded 이벤트 핸들러 실행 
    //Object Store나 인덱스의 구조를 변경하는 작업을 수행하는 경우 (데베 스키마 변경)
    //ex) createObjectStore 메서드, createIndex 메서드  
request.onupgradeneeded = function(event) {
  var db = event.target.result;
    //객체 저장소 생성
  var objectStore = db.createObjectStore("urls", { keyPath: "id", autoIncrement: true });
    //인덱스 생성
  objectStore.createIndex("keywords", "keywords", { unique: false });
  objectStore.createIndex("dir", "dir", { unique: false });
  objectStore.createIndex("order", "order", { unique: true });

    //트랙젝션이 성공하면 다음 작업을 수행
    //객체 저장소 urls에 urlData의 모든 자료를 반복문으로 저장
  objectStore.transaction.oncomplete = function(event) {
    var urlObjectStore = db.transaction("urls", "readwrite").objectStore("urls");
    urlData.forEach(function(url) {
      urlObjectStore.add(url);
    });
  };
};*/