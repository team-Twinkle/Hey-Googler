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

//db입력 함수
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

//데이터 확인용 예제
// const datas = [
//   {url : "wwww.dddddfffffdd", title: "구글페이지", memo : "이건중요", keyword:"구굴", dir_id : 1}
// ];

// writeDB(datas, 'urlStore');

// chrome.runtime.onMessage.addListener(
//     function (request) {
//        console.log('data받음');
//        if(request.storeName == 'urlStore'){
//            const datas = [
//                {url: request.url, title: request.title, memo: " ", keyword: request.keyword, dir_id:1}
//            ];
//            console.log(datas);
//            // writeDB(datas, 'urlStore');
//        }
// })