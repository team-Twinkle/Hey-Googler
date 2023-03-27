var db;
const request = window.indexedDB.open("HeyGoogler", 5);
// request.onerror=(e)=>alert('failed');
// request.onsuccess =(e)=> db = request.result;
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

  db.createObjectStore("url", {
    keyPath: "id",
    autoIncrement: true
  });

  request.onerror = function (event) {
    console.log("failed");
  };
  request.onsuccess = function (event) {
    db = request.result;
  };

  // request.onsuccess=(e)=> db = request.result;

  // objectStore.createIndex("title", "title", { unique: false });
  // objectStore.createIndex("url", "url", { unique: false });
  // objectStore.createIndex("memo", "memo", { unique: false });
  // objectStore.createIndex("keyword", "keyword", { unique: false });
  // objectStore.createIndex("dir_id", "dir_id", { unique: false });

  // var keywordStore = db.createObjectStore("keywordStore", {
  //   keyPath: "k_id",
  //   autoIncrement: true
  // });
  // keywordStore.createIndex("keyword", "keyword", { unique: false });
  // keywordStore.createIndex("dir_id", "dir_id", { unique: false });

  // var dirStore = db.createObjectStore("dirStore", {
  //   keyPath: "d_id",
  //   autoIncrement: true
  // });
  // dirStore.createIndex("dir_id", "dir_id", { unique: false });
  // dirStore.createIndex("dir_name", "dir_name", { unique: false });
};

function writeUrlDB(data) {
  var request = window.indexedDB.open('HeyGoogler');
  request.onerror = function(event){
    console.log('DB error', event.target.errorCode);
  }

  request.onsuccess  = function(event){
    var request = window.indexedDB.open('HeyGoogler');
    const db = target.result;
    const transaction = db.transaction(['url'], 'readwrite');

    transaction.oncomplete = function(event){
      console.log ('성공');
    }
    transaction.onerror = function(event){
      console.log('실패');
    }

    var objectStore = transaction.objectStore('url');
    request = objectStore.add(data);
    request.onsuccess = function(event){
      console.log(event.target.result);
    }
  }
}

// const data = {
//     title: "title",
//     url: "object 예시",
//     memo: " ",
//     keyword: "키워드",
//     dir_id: "5",
//   };

const data = {
  id : 1,
  url : 'www.dddd'
};
  writeUrlDB(data);

// objectStore.transaction.oncomplete = function(event) {
//     var store = db.transaction("linkStore", "readwrite").objectStore("linkStore");
//     store.add(test_data);
// }


// function writeIndexedDB(data) {
//   var request = window.indexedDB.open("HeyGoogler");

//   request.onerror = function (event) {
//     console.log("error");
//   };

//   request.onsuccess = function (event) {
//     var db = this.result;
//     var tx = db.transaction("objectStore", "readwrite");

//     tx.oncomplete = function (event) {
//       console.log("done");
//     };

//     tx.onerror = function (event) {
//       console.log("fail");
//     };

//     var listStore = tx.objectStore("objectStore");
//     var request = objectStore.add(data);
//     request.onsuccess = function (event) {
//       console.log(event.target.result);
//     };
//   };
// }


// // writeIndexedDB(test_data);

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
//   const {action, data} = request;

//   if(action === 'write'){
//     writeIndexedDB(data)
//     .then(()=> {
//       sendResponse({success:true});
//     })
//     .catch(error => {
//       console.error('error', error);
//       sendResponse({success:false});
//     });
   
//   }
//   console.log(data);
//   return true;
// });