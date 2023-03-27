var db;
const request = window.indexedDB.open("HeyGoogler", 1);

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

  var urlStore = db.createObjectStore("urlStore", {
    keyPath: "id",
    autoIncrement: true
  });

  urlStore.createIndex("url", "url", { unique: false });
  urlStore.createIndex("title", "title", { unique: false });
  urlStore.createIndex("memo", "memo", { unique: false });
  urlStore.createIndex("keyword", "keyword", { unique: false });
  urlStore.createIndex("dir_id", "dir_id", { unique: false });

  var keywordStore = db.createObjectStore("keywordStore", {
    keyPath: "k_id",
    autoIncrement: true
  });
  keywordStore.createIndex("keyword", "keyword", { unique: false });
  keywordStore.createIndex("dir_id", "dir_id", { unique: false });

  var dirStore = db.createObjectStore("dirStore", {
    keyPath: "d_id",
    autoIncrement: true
  });
  dirStore.createIndex("dir_id", "dir_id", { unique: false });
  dirStore.createIndex("dir_name", "dir_name", { unique: false });
  
  request.onerror = function (event) {
    console.log("failed");
  };
  request.onsuccess = function (event) {
    db = request.result;
  };
};

// function writeUrlDB(datas) {
//   const request = window.indexedDB.open('HeyGoogler');

//   request.onerror = function(event){
//     console.log('DB error', event.target.errorCode);
//   };

//   request.onsuccess  = function(event){
//     const db = request.result;
//     const transaction = db.transaction(['urlStore'], 'readwrite');

//     transaction.oncomplete = function(event){
//       console.log ('성공');
//     };
//     transaction.onerror = function(event){
//       console.log('실패');
//     };

//     const urlStore = transaction.objectStore('urlStore');
//     for (const data of datas){
//       const request = urlStore.add(data);
//       request.onsuccess = function(event){
//         console.log(event.target.result);
//       };
//     }

//   };
// }


function writeDB(datas, store_name) {
  const request = window.indexedDB.open('HeyGoogler');

  request.onerror = function(event){
    console.log('DB error', event.target.errorCode);
  };

  request.onsuccess  = function(event){
    const db = request.result;
    const transaction = db.transaction([store_name], 'readwrite');

    transaction.oncomplete = function(event){
      console.log ('성공');
    };
    transaction.onerror = function(event){
      console.log('실패');
    };

    const objectStore = transaction.objectStore(store_name);
    for (const data of datas){
      const request = objectStore.add(data);
      request.onsuccess = function(event){
        console.log(event.target.result);
      };
    }

  };
}


// const data =  {url : "wwww.ddd", title: "구글페이지", memo : "이건중요", keyword:"구굴", dir_id : 1};
  

const datas = [
  {url : "wwww.dddddfffffdd", title: "구글페이지", memo : "이건중요", keyword:"구굴", dir_id : 1}
];

writeDB(datas, 'urlStore');

// writeUrlDB(data);

// const data = {
//     title: "title",
//     url: "object 예시",
//     memo: " ",
//     keyword: "키워드",
//     dir_id: "5",
//   };

// const data = [{
//   url : 'www.dddd'
// }];
  // writeUrlDB(data);

// urlStore.transaction.oncomplete = function(event) {
//     var store = db.transaction("linkStore", "readwrite").urlStore("linkStore");
//     store.add(test_data);
// }


// function writeIndexedDB(data) {
//   var request = window.indexedDB.open("HeyGoogler");

//   request.onerror = function (event) {
//     console.log("error");
//   };

//   request.onsuccess = function (event) {
//     var db = this.result;
//     var tx = db.transaction("urlStore", "readwrite");

//     tx.oncomplete = function (event) {
//       console.log("done");
//     };

//     tx.onerror = function (event) {
//       console.log("fail");
//     };

//     var listStore = tx.urlStore("urlStore");
//     var request = urlStore.add(data);
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