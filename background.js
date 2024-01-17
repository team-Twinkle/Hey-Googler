var isExtensionOn;
var dirId = 1;

var iconPath = "heyGoogler_icon.png";
var offIconPath = "heyGoogler_icon_off.png";

var beforeTab;
var currentTab;
var searchTab;

if (currentTab == null) {
  chrome.tabs.getCurrent((tab) => {
    currentTab = tab;
  })
}

let db;
const request = indexedDB.open("HeyGoogler", 1);

request.onerror = function (event) {
  console.log("failed");
};
request.onsuccess = function (event) {
  db = request.result;
};


request.onupgradeneeded = function (event) {
  db = event.target.result;

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

  var keywordStore = db.createObjectStore("keywordStore", {
    keyPath: "id",
    autoIncrement: true
  });

  keywordStore.createIndex("dir_id", "dir_id", { unique: false });
  keywordStore.createIndex("keyword", ["dir_id", "keyword"], { unique: true });

  var dirStore = db.createObjectStore("dirStore", {
    keyPath: "d_id",
    autoIncrement: true,
  });

  dirStore.createIndex("dir_name", "dir_name", { unique: false });
  dirStore.createIndex("scroll", "scroll", { unique: false });

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
        resolve(data);
      };

      requestGetAll.onerror = function (event) {
        reject(new Error("데이터 읽기 실패"));
      };
    };
  });
}

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
        dir_name: '새 폴더',
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

{
  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      currentTab = tabs[0];
      currentURL = currentTab.url;
      let URLstart = currentURL.substr(0, 9);
      if (URLstart == "chrome://") {
        chrome.tabs.create({
          url: "newTab.html",
          active: true,
        });
      } else {
        chrome.tabs.sendMessage(tab.id, "toggle");
        console.log("message sent");
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
  chrome.action.setIcon({ path: { "16": offIconPath, "48": offIconPath, "128": offIconPath } });

});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.txt == "Start the extension from list.js") {
    isExtensionOn = true;
    dirId = parseInt(msg.onDirId);
    console.log('받은 dir' + dirId);

    console.log("is the extension ON? : " + isExtensionOn);
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setIcon({ path: { "16": iconPath, "48": iconPath, "128": iconPath } });
  } else if (msg == "Stop the extension from list.js") {
    isExtensionOn = false;
    dirId = null;
    console.log("is the extension ON? : " + isExtensionOn);
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setIcon({ path: { "16": offIconPath, "48": offIconPath, "128": offIconPath } });
  }
});


chrome.tabs.onActivated.addListener(activeInfo => {
  beforeTab = currentTab;
  chrome.tabs.get(activeInfo.tabId, Tab => {
    currentTab = Tab.url;
    if (currentTab) {
      currentURL = new URL(currentTab);
    }
    else currentURL = '';
    if ((currentURL.hostname === "www.google.com") || (currentURL.hostname === "scholar.google.com")) {
      searchTab = currentTab;
      console.log("    SearchTab case1 :        " + searchTab);
    }
  })

  chrome.tabs.onUpdated.addListener((currentTabId, changingInfo, tabs) => {
    if (changingInfo.status === 'complete') {
      chrome.tabs.get(currentTabId, Tab => {
        currentTab = Tab.url;
        currentURL = new URL(currentTab);
        if ((currentURL.hostname === "www.google.com") || (currentURL.hostname === "scholar.google.com")) {
          searchTab = currentTab;
          console.log("    SearchTab case2 :       " + searchTab);
        }
      })
    }
  });
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, "referrer", response => {
      if (!response || !response.referrer) {
        return;
      }
      var referrer = response.referrer;

      if ((referrer == 'https://www.google.com/') || (referrer == 'https://scholar.google.com/')) {//1차링크인 경우 추적 

        let url = response.url;
        let title = response.title;
        let str1 = url.substr(0, 22);
        let str2 = url.substr(0, 19);
        if ((str1 == "https://www.google.com") || (str1 == "https://scholar.google.com")) {
          return;
        }
        if (str2 == "chrome-extension://") {
          return;
        }

        const url_ = new URL(searchTab);
        let keyword1 = url_.searchParams.get("q");
        if (keyword1 != null) {
          console.log('키데이터' + dirId);
          const keyData = [{ dir_id: dirId, keyword: keyword1, isToggled: false }];

          console.log("Visited Site:", url, title, keyword1);
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

            chrome.tabs.query({}, function (tabs) {
              chrome.runtime.sendMessage("Auto Synchronization message");
            });


          }
        }

      }
      else console.log("이전 링크가 검색창이 아님!!!!");
    });
  }

});