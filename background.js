var isExtensionOn;
var dirId = 1; //현재 선택된 디렉토리의 id 저장

var iconPath = "heyGoogler_icon.png";
var offIconPath = "heyGoogler_icon_off.png";
/****************************************************indexedDB 코드*************************************************************/
let db;
const request = indexedDB.open("HeyGoogler", 1);

request.onerror = function (event) {
  console.log("failed");
};
request.onsuccess = function (event) {
  db = request.result;
};

//새로만들거나 버전이 높을 때 발생 이벤트
//objectStore을 만들거나 수정할 때, 이 이벤트 내에서 진행
request.onupgradeneeded = function (event) {
  db = event.target.result;

  //url store
  var urlStore = db.createObjectStore("urlStore", {
    keyPath: "id",
    autoIncrement: true,
  });


  urlStore.createIndex("url", ["dir_id", "url"], { unique: true });

  urlStore.createIndex("title", "title", { unique: false });
  urlStore.createIndex("memo", "memo", { unique: false });
  urlStore.createIndex("keyword", "keyword", { unique: false });
  urlStore.createIndex("dir_id", "dir_id", { unique: false });
  urlStore.createIndex("dir_id_keyword", ["dir_id", "keyword"], { unique: false });

  //keyword store
  var keywordStore = db.createObjectStore("keywordStore", {
    keyPath: "id",
    autoIncrement: true
  });

  keywordStore.createIndex("dir_id", "dir_id", { unique: false });

  keywordStore.createIndex("keyword", ["dir_id", "keyword"], { unique: true });


  //dir store
  var dirStore = db.createObjectStore("dirStore", {
    keyPath: "d_id",
    autoIncrement: true,
  });

  dirStore.createIndex("dir_name", "dir_name", { unique: false });

  //user history store
  var dirStore = db.createObjectStore("userHistoryStore", {
    keyPath: "id",
    autoIncrement: true,
  });

  dirStore.createIndex("recentlyVisitedDir", "recentlyVisitedDir", { unique: false });
  dirStore.createIndex("recentlyExecutedDir", "recentlyExecutedDir", { unique: false });
  dirStore.createIndex("nowExecutedDir", "nowExecutedDir", { unique: false });

  request.onerror = function (event) {
    console.log("failed");
  };
  request.onsuccess = function (event) {
    db = request.result;
  };
};

//db입력 함수
function writeDB(datas, store_name) {
  const request = indexedDB.open("HeyGoogler");

  request.onerror = function (event) {
    console.log("DB error", event.target.errorCode);
  };

  request.onsuccess = function (event) {
    const db = request.result;
    const transaction = db.transaction([store_name], "readwrite");

    transaction.oncomplete = function (event) {
      console.log("성공");
    };
    transaction.onerror = function (event) {
      console.log("실패");
    };

    const objectStore = transaction.objectStore(store_name);
    for (const data of datas) {
      const request = objectStore.add(data);
      request.onsuccess = function (event) {
        console.log(event.target.result);
      };
    }
  };
}

// db에서 데이터를 읽는 함수
function readDB(store_name) {
  return new Promise((resolve, reject) => {
    var request = indexedDB.open("HeyGoogler", 1);

    request.onerror = function (event) {
      reject(new Error("DB error: " + event.target.errorCode));
    };

    request.onsuccess = function (event) {
      const db = request.result;
      const transaction = db.transaction([store_name], "readonly");
      const objectStore = transaction.objectStore(store_name);

      const requestGetAll = objectStore.getAll();

      requestGetAll.onsuccess = function (event) {
        const data = event.target.result;
        console.log('readDB 테스트 실행 데이터 값 : ');
        console.log(data);
        resolve(data); // 비동기 작업이 완료되면 데이터를 반환
      };

      requestGetAll.onerror = function (event) {
        reject(new Error("데이터 읽기 실패"));
      };
    };
  });
}

// db 초기값 설정
async function initUserHistoryData() {
  try {
    var userHistoryData = await readDB('userHistoryStore');

    if (userHistoryData.length < 1) {
      const datas = [
        {
          recentlyVisitedDir: 1,
          recentlyExecutedDir: 1,
          nowExecutedDir: 'none',
        },
      ];
      writeDB(datas, "userHistoryStore");
      const dirDatas = [{
        dir_name: '초기 New Dir',
      }];
      writeDB(dirDatas, "dirStore");

    }

  } catch (error) {
    console.error(error);
  }
}

async function isExtensionOnFunc() {
  try {
    var userHistoryData = await readDB('userHistoryStore');

    if (userHistoryData.length > 0) {

      let nowExecutedDir = userHistoryData[0].nowExecutedDir;
      if (nowExecutedDir == 'none') {
        isExtensionOn = false;
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setIcon({ path: { "16": offIconPath, "48": offIconPath, "128": offIconPath } });
      } else {
        isExtensionOn = true;
        dirId = parseInt(nowExecutedDir);
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setIcon({ path: { "16": iconPath, "48": iconPath, "128": iconPath } });
      }

    }

  } catch (error) {
    console.error(error);
  }
}

initUserHistoryData();
isExtensionOnFunc();

/*********************************************************************************************************************/

//액션 아이콘 클릭 이벤트 <extension 실행 유무와 상관없이 실행되어야함>
{
  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      currentTab = tabs[0];
      currentURL = currentTab.url;
      let URLstart = currentURL.substr(0, 9);
      if (URLstart == "chrome://") {
        // URL이 'chrome://' 로 시작한다면 새탭 열어서 예외처리 창 띄우기
        chrome.tabs.create({
          url: "newTab.html",
          active: true,
        });
      } else {
        // 아니라면 사이드바 띄우기 
        chrome.tabs.sendMessage(tab.id, "toggle");
        console.log("message sent");
      }
    });
  });
}

//액션 아이콘에 extension 의 상태를 표시하기 위한 badge 초기화 시키는 코드 <extension 실행 유무와 상관없이 실행되어야함>
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
  chrome.action.setIcon({ path: { "16": offIconPath, "48": offIconPath, "128": offIconPath } });

});

//list.js 로부터 메시지를 받아서 사이드바에서 시작버튼이나 중지 버튼을 누르면 isExtensionOn 의 값과 액션 아이콘 뱃지의 텍스트가 변경되도록 하는 코드
//<extension 실행 유무와 상관없이 실행되어야함>
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.txt == "Start the extension from list.js") { //사이드바에서 시작버튼을 눌렀을 때
    isExtensionOn = true;
    dirId = parseInt(msg.onDirId);
    console.log('받은 dir' + dirId);

    console.log("is the extension ON? : " + isExtensionOn);
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setIcon({ path: { "16": iconPath, "48": iconPath, "128": iconPath } });
  } else if (msg == "Stop the extension from list.js") { //사이드바에서 중지버튼을 눌렀을 때
    isExtensionOn = false;
    dirId = null;
    console.log("is the extension ON? : " + isExtensionOn);
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setIcon({ path: { "16": offIconPath, "48": offIconPath, "128": offIconPath } });
  }
});

//현재 보고있는 탭(currentTab), 가장 최근까지 보고있던 탭(beforeTab), 검색창(searchTab) 저장 
//<extension 실행 유무와 상관없이 실행되어야함>
var beforeTab;
var currentTab;
var searchTab;

chrome.tabs.onActivated.addListener(activeInfo => {
  beforeTab = currentTab;
  //console.log("activated changing")
  chrome.tabs.get(activeInfo.tabId, Tab => {
    currentTab = Tab.url;
    currentURL = new URL(currentTab);
    if (currentURL.hostname === "www.google.com") {
      searchTab = currentTab;
      console.log("    SearchTab case1 :        " + searchTab);
    }
  })

  chrome.tabs.onUpdated.addListener((currentTabId, changingInfo, tabs) => {
    if (changingInfo.status === 'complete') {
      //console.log(currentTabId);
      chrome.tabs.get(currentTabId, Tab => {
        currentTab = Tab.url;
        currentURL = new URL(currentTab);
        //console.log(currentURL);
        if (currentURL.hostname === "www.google.com") {
          searchTab = currentTab;
          console.log("    SearchTab case2 :       " + searchTab);
        }
      })

    }
  });
});


// 새 탭, 검색창, 2차 이상 링크 모두 제외하고 ***1차 링크만*** 기록
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {   //referrer 를 확인한다 ! 
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, "referrer", response => {
      var referrer = response.referrer; //referrer 얻은 데이터 !!
      //console.log("===========================>>>>>"+referrer);

      if (referrer == 'https://www.google.com/') {//1차링크인 경우 추적 

        let url = response.url;
        let title = response.title;
        //검색창인 경우 제외
        let str1 = url.substr(0, 22);
        let str2 = url.substr(0, 19);
        if (str1 == "https://www.google.com") {
          return;
        }
        if (str2 == "chrome-extension://") {
          return;
        }
        //console.log(historyItem.title);

        const url_ = new URL(searchTab);
        //console.log(url_);
        let keyword1 = url_.searchParams.get("q"); //1차링크의 검색어 
        if (keyword1 != null) {
          console.log('키데이터' + dirId);
          const keyData = [{ dir_id: dirId, keyword: keyword1 }];

          console.log("Visited Site:", url, title, keyword1);
          //db에 data 입력
          const datas = [
            {
              url: url,
              title: title,
              memo: " ",
              keyword: keyword1,
              dir_id: dirId

            },
          ];
          if (isExtensionOn) {
            writeDB(keyData, "keywordStore");
            writeDB(datas, "urlStore");
          }
        }

      }
      else console.log("이전 링크가 검색창이 아님!!!!");
    });
  }

});

//해결된 부분: 키워드 이제 잘 잡힘. url title keyword 동시에 푸시(시간 복잡도 줄임). 중복 기록 발생 x
//문제인 부분: 분명히 referrer if문 안에서 돌렸는데 자꾸 2차, 3차 링크도 같이 잡힘.
//(이전 링크가 google인 얘들만 잡혀야 하는데.. 그렇게 거르고 했는데 어째서인지 2차 이상도 같이 기록되네?? )
//(아마 referrer 부분 코드짠 채린이랑 같이 수정을 해봐야할 듯??)
//보통은 다음 검색어가 발생하기 전까지 이전 검색어로 계속 유지되서 푸시됨. = 우리가 원했던 2, 3차 링크 꼴대로 잘 기록됨.
//그러나 다중 사이트로 테스트 해본 결과, 마지막으로 켜놨던 사이트의 키워드로 들어가는 것으로 확인.

/*
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
