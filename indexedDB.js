var db;
var request = window.indexedDB.open("HeyGoogler", 1);

//새로만들거나 버전이 높을 때 발생 이벤트
//objectStore을 만들거나 수정할 때, 이 이벤트 내에서 진행
request.onupperadeneeded = function (event) {
  var db = event.target.result;

  var listStore = db.createObjectStore("linkStore", {
    keyPath: "id",
    autoIncrement: true,
  });
  listStore.createIndex("title", "title", { unique: false });
  listStore.createIndex("link", "link", { unique: false });
  listStore.createIndex("memo", "memo", { unique: false });
  listStore.createIndex("keyword", "keyword", { unique: false });
  listStore.createIndex("dir_id", "dir_id", { unique: false });

  var keywordStore = db.createObjectStore("keywordStore", {
    keyPath: "id",
    autoIncrement: true,
  });
  keywordStore.createIndex("keyword", "keyword", { unique: false });
  keywordStore.createIndex("dir_id", "dir_id", { unique: false });

  var dirStore = db.createObjectStore("dirStore", {
    keyPath: "id",
    autoIncrement: true,
  });
  listStore.createIndex("dir_id", "dir_id", { unique: false });
  listStore.createIndex("dir_name", "dir_name", { unique: false });
};

request.onerror = function (event) {
  console.log("failed");
};
request.onsuccess = function (event) {
  db = request.result;
};

function writeIndexedDB(data) {
  var request = window.indexedDB.open("HeyGoogler");

  request.onerror = function (event) {
    console.log("error");
  };

  request.onsuccess = function (event) {
    var db = this.result;
    var tx = db.transaction(["linkStore"], "readwrite");

    tx.oncomplete = function (event) {
      console.log("done");
    };

    tx.onerror = function (event) {
      console.log("fail");
    };

    var listStore = tx.objectStore("listStore");
    var request = objectStore.add(data);
    request.onsuccess = function (event) {
      console.log(event.target.result);
    };
  };
}

var test_data = {
  title: "title",
  link: "link 예시",
  memo: " ",
  keyword: "키워드",
  dir_id: "5",
};

writeIndexedDB(test_data);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  const {action, data} = request;

  if(action === 'write'){
    writeIndexedDB(data)
    .then(()=> {
      sendResponse({success:true});
    })
    .catch(error => {
      console.error('error', error);
      sendResponse({success:false});
    });
   
  }
  console.log(data);
  return true;
});