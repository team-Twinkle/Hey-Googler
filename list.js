let nowDirId;

//init
//분기해서 사용하는 거 중요함
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/list.html") {
    initListPage();


  } else if (window.location.pathname === "/dirList.html") {
    readDBAndDisplay();
    document.getElementById("dirAddButton").addEventListener("click", () => { dirAddButtonClick(); });


    defaultDirSet();
    //경우에 따라 다르게 부여
    //TODO
    // if (onDirId != 0) {
    // document.getElementById("current-dir-link").href = onDirLink;

    // } else {
    // console.log("init 에서 currentDirLink : " + currentDirLink);
    // document.getElementById("current-dir-link").href = currentDirLink;
    // }
    // console.log(document.getElementById("current-dir-link").href);

  }
});



window.history.scrollRestoration = "auto";

/**
  * 스크롤이 움직일때마다 값을 sessionStorage에 넣어줌
  */
let scrollHeight;
addEventListener('scroll', (event) => {
    scrollHeight = $(document).scrollTop();
    sessionStorage.setItem("scrollY", scrollHeight);
});

/**
  * 스크롤 위치 지정
  */
// $(document).ready(function() {
//     const scrollY = parseInt(sessionStorage.getItem("scrollY"));
//     if(scrollY && scrollY > 0){
//         window.scrollTo(0, scrollY);
//     }
// });


//dir추가 버튼
function dirAddButtonClick() {
  var dir = document.getElementById("dir_template");
  var copy = dir.content.cloneNode(true);

  // 버튼 이벤트 리스너 추가
  // 오 템플릿이기 때문에, 이벤트 리스너도 템플릿 생성할 때 추가하도록 해야함
  const editButton = copy.querySelector(".button-edit");
  const deleteButton = copy.querySelector(".button-del");
  const dirLink = copy.querySelector(".dir-link");
  const dirText = copy.querySelector(".dir-text");

  editButton.addEventListener("click", function () {
    setupDirEditEvent(this);
  });

  deleteButton.addEventListener("click", function () {
    setupDirDeleteEvent(this);
  });

  // 데이터베이스 추가
  const data = [{ dir_name: '새 폴더' }];
  writeDB(data, 'dirStore', function (d_id) {
    // console.log(`dirAddButton 눌러쓸 때의 d_id : ${d_id}`);
    copy.querySelector(".dir-list").id = d_id;

    // dir_id를 사용하여 링크 생성
    const dir_id = d_id;
    const dirName = '새 폴더';
    console.log('href생성 전');
    console.log(dir_id, dirName);

    // dirLink.href = `./list.html?dir_id=${dir_id}&dirname=${encodeURIComponent(dirName)}`;
    //chrome-extension://ennclpjamlaabgaipfcmcffiemgkjdph/list.html?dir_id=53&dirname=NEW%20DIR
    // 확장 프로그램 내의 상대 경로를 절대 경로로 변환
    const extensionURL = chrome.runtime.getURL(`list.html?dir_id=${dir_id}&dirname=${encodeURIComponent(dirName)}`);

    dirLink.href = extensionURL;
    dirText.textContent = dirName;

    console.log(dirLink.href);

    document.getElementById("dir_container").appendChild(copy);


  });

}



function setupDirEditEvent(button) {
  const dirElement = button.closest("li");  
  const dirTextElement = dirElement.querySelector(".dir-text");
  const currentTextValue = dirTextElement.textContent;
  const dir_id = dirElement.id;
  // input 생성
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.value = currentTextValue;
  inputElement.classList.add("input-dir", "editing");

  const aElement = dirElement.querySelector("a");
  dirElement.replaceChild(inputElement, aElement);

  inputElement.focus();
  inputElement.select();

  dirElement.classList.add("editing");
  button.classList.add("editing");

  document.addEventListener("click", e => {
    if (!(e.target.classList.contains("editing"))) {
      const newDirName = inputElement.value.trim();
      if (newDirName !== "") {
        editDB("dirStore", "dir_name", parseInt(dir_id), newDirName,true);
      }
      else {
        alert("내용을 입력해주세요");
      }
    }
  })

  // 엔터가 눌렸을 때 수정이 완료되도록
  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const newDirName = inputElement.value.trim();
      if (newDirName !== "") {
        // const newDirTextElement = document.createElement("h1");
        // newDirTextElement.classList.add("dir-text");
        // newDirTextElement.textContent = newDirName;

        // const newAElement = document.createElement("a");

        // // 새로운 URL 파라미터로 dir_id와 dirname을 사용하여 페이지를 업데이트

        // // newAElement.href = `./list.html?dir_id=${dir_id}&dirname=${encodeURIComponent(newDirName)}`;
        // const extensionURL = chrome.runtime.getURL(`list.html?dir_id=${dir_id}&dirname=${encodeURIComponent(newDirName)}`);
        // newAElement.href = extensionURL;
        // console.log('edit href');
        // console.log(newAElement.href);

        // newAElement.appendChild(newDirTextElement);

        // const buttonEdit = dirElement.querySelector(".button-edit");
        // const buttonDel = dirElement.querySelector(".button-del");

        // const newLiElement = document.createElement("li");
        // newLiElement.classList.add("dir-list", "dir");
        // newLiElement.appendChild(newAElement);
        // newLiElement.appendChild(buttonEdit);
        // newLiElement.appendChild(buttonDel);

        // dirElement.parentNode.replaceChild(newLiElement, dirElement);

        // 디렉토리 이름 데이터베이스에 업데이트
        editDB("dirStore", "dir_name", parseInt(dir_id), newDirName,true);
        //그냥 editDirNameDB (editDB) 함수에서 success 하면 location.reload() 하도록 코드 작성했어,,
        //어차피 새로고침하니까 위에 코드는 필요 없어지는 거 아닌가 싶어서 주석처리했구! -10월 14일의 채린...-

      } else {
        alert("내용을 입력해주세요");
      }
    }
  });
}



function setupDirDeleteEvent(button) {
  const dirElement = button.closest("li");
  const d_id = dirElement.id;

  readValueDB('userHistoryStore', 'nowExecutedDir', 1)
    .then(result => {
      //현재 실행 중인 dir과 삭제하려는 dir이 동일하다면 "삭제할 수 없음"
      if (parseInt(result) == d_id) {
        console.log("dirCannotDeleteModal 보여주기");
        const dirCannotDeleteModal = document.getElementById("dirCannotDeleteModal");
        dirCannotDeleteModal.style.display = "flex";
        const dirCannotDeletecloseBtn = dirCannotDeleteModal.querySelector(".closeBtn");
        dirCannotDeletecloseBtn.addEventListener("click", e => {
          dirCannotDeleteModal.style.display = "none";
        })
      }
      //현재 실행 중인 dir과 삭제하려는 dir이 동일하지 않다면 "진짜 삭제하실?"
      else {
        const dirDeleteModal = document.getElementById("dirDeleteModal");
        dirDeleteModal.style.display = "flex";
        const dirDeleteModalcloseBtn = dirDeleteModal.querySelector(".closeBtn");
        const dirDeleteModalDeleteBtn = dirDeleteModal.querySelector(".deleteBtn");
        dirDeleteModalcloseBtn.addEventListener("click", e => {
          dirDeleteModal.style.display = "none";
        })
        dirDeleteModalDeleteBtn.addEventListener("click", e => {
          dirElement.parentNode.removeChild(dirElement);
          deleteDirDB(d_id);
          dirDeleteModal.style.display = "none";
        })
      }

    })
    .catch(error => {
      console.error("에러: " + error);
    });


}


// 리스트 페이지 로드 될 때
async function initListPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const dirNameElement = document.querySelector("#dir-title");
  const dirBox = document.querySelector(".dir");

  var userHistoryData = await readDBbyStoreName('userHistoryStore');

  var dirId = urlParams.get("dir_id");
  var dirName;
  var dirData;

  if (dirId != null) { //dir 폴더로부터 넘어 올 때
    dirData = await readDBbyStoreNameAndId('dirStore', parseInt(dirId));
  } else { //dir 폴더로부터 열리는 것이 아닐 때
    try {
      dirId = userHistoryData[0]['recentlyExecutedDir'];
      dirData = await readDBbyStoreNameAndId('dirStore', parseInt(dirId));

      //recentlyExecutedDir가 삭제 됨 -> 아무 디렉토리
      if (initDirName == undefined) {
        var tempDir = await readDBbyStoreName('dirStore');
        dirId = tempDir[0]['d_id'];
        dirData = await readDBbyStoreNameAndId('dirStore', parseInt(dirId));
      }
    } catch (error) {
    }
  }

  dirName = dirData['dir_name']

  if (dirName != null) {
    dirNameElement.textContent = dirName;
  }

  //dir title 수정
  var dirTitleBox = document.getElementById('dir-title-box');
  dirBox.addEventListener("click", () => {
    // input 생성
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = dirNameElement.textContent;
    inputElement.classList.add("input-dir", "editing");

    dirTitleBox.replaceChild(inputElement, dirNameElement);

    inputElement.focus();
    inputElement.select();

    dirTitleBox.classList.add("editing");

    //엔터 완료
    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const newDirName = inputElement.value.trim();
        if (newDirName !== "") {
          editDB("dirStore", "dir_name", parseInt(dirId), newDirName);
        } else {
          alert("내용을 입력해주세요");
        }
      }
    });

    // document.addEventListener("click", e => {
    //   if (!(e.target.classList.contains("editing"))) {
    //     const newDirName = inputElement.value.trim();
    //     if (newDirName !== "") {
    //       editDB("dirStore", "dir_name", parseInt(dirId), newDirName);
    //       document.reload();
    //     }
    //     else {
    //       alert("내용을 입력해주세요");
    //     }
    //   }
    // })


  });

  nowDirId = dirId;
  editUserHistoryRecentlyVisitedDB('userHistoryStore', 1, nowDirId);

  var nowExecutedDir = userHistoryData[0]['nowExecutedDir'];
  if (dirId == nowExecutedDir) {
    dirBox.style.backgroundColor = '#DFF5E5';
  }

  addEvent();

}

function startBtnEvent(){
  let modal = document.getElementById("startModal");
  let content = document.getElementById("startModalContent");
  let dirBox = document.getElementById("dir-name");
  let dirName = dirBox.textContent;
  content.innerHTML = "<b>[" + dirName + "]</b> <br>폴더에 검색 기록이 저장됩니다.";
  modal.classList.replace("hidden","clicked");
  setTimeout(()=>{modal.classList.replace("clicked","hidden");},5000);
  //console.log("startEvent executed");
}



// //dir-name 에 title 부여
//list.html에서만 가능하니 주의해야함 
// document.getElementById("dir-name").title =
//   document.getElementById("dir-name").innerHTML;


// db에서 데이터를 읽는 함수
function readDBbyStoreName(store_name) {
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

// db에서 데이터를 읽는 함수
function readDBbyStoreNameAndId(store_name, id) {
  return new Promise((resolve, reject) => {
    var request = indexedDB.open("HeyGoogler", 1);

    request.onerror = function (event) {
      reject(new Error("DB error: " + event.target.errorCode));
    };

    request.onsuccess = function (event) {
      const db = request.result;
      const transaction = db.transaction([store_name], "readonly");
      const objectStore = transaction.objectStore(store_name);

      const requestGet = objectStore.get(parseInt(id));

      requestGet.onsuccess = function (event) {
        const data = event.target.result;
        console.log('readDB dirname by id 테스트 실행 데이터 값 : ');
        console.log(data);
        resolve(data); // 비동기 작업이 완료되면 데이터를 반환
      };

      requestGet.onerror = function (event) {
        reject(new Error("데이터 읽기 실패"));
      };
    };
  });
}

async function getNowDirId() {
  try {
    var userHistoryData = await readDBbyStoreName('userHistoryStore');
    console.log('현재 실ㅇ중인 ');
    console.log(userHistoryData[0]['nowExecutedDir']);
    data = userHistoryData[0]['nowExecutedDir'];
    return data;
  } catch (error) {
    return 0;
  }
}

/********************************************************************************************************* */


var reloadButton = document.getElementById("button-reload");
var folderButton = document.getElementById("button-folder");
var startButton = document.getElementById("button-start");
var stopButton = document.getElementById("button-stop");

chrome.action.getBadgeText({}, (txt) => {
  if (txt == "ON") {
    startButton.src = "images/icon_start_true.svg";
  } else {
    startButton.src = "images/icon_start.svg";
  }
});

//stopButton 눌림 action
stopButton.addEventListener("mousedown", () => {
  stopButton.src = "images/icon_stop_true.svg";
});
stopButton.addEventListener("mouseup", () => {
  stopButton.src = "images/icon_stop.svg";
});

//reload
reloadButton.addEventListener("click", () => {
  location.reload();
  console.log("reloaded");
});

//tooltip
reloadButton.addEventListener("mouseover", () => {
  document.getElementById("tooltip-reload").style.display = "block";
});
reloadButton.addEventListener("mouseout", () => {
  document.getElementById("tooltip-reload").style.display = "none";
});
folderButton.addEventListener("mouseover", () => {
  document.getElementById("tooltip-folder").style.display = "block";
});
folderButton.addEventListener("mouseout", () => {
  document.getElementById("tooltip-folder").style.display = "none";
});
startButton.addEventListener("mouseover", () => {
  document.getElementById("tooltip-start").style.display = "block";
});
startButton.addEventListener("mouseout", () => {
  document.getElementById("tooltip-start").style.display = "none";
});
stopButton.addEventListener("mouseover", () => {
  document.getElementById("tooltip-stop").style.display = "block";
});
stopButton.addEventListener("mouseout", () => {
  document.getElementById("tooltip-stop").style.display = "none";
});

//send message to background.js when the start/stop button clicked
startButton.addEventListener("click", () => {
  startButton.src = "images/icon_start_true.svg";
  chrome.runtime.sendMessage({ onDirId: nowDirId, txt: "Start the extension from list.js" });
  editUserHistoryNowDirDB('userHistoryStore', 1, nowDirId);
  editUserHistoryRecentlyExecutedDirDB('userHistoryStore', 1, nowDirId);
  document.querySelector('.dir').style.backgroundColor = '#DFF5E5';
  //거의 10퍼센트 확률로 두번째거 안 먹히는데,, 계속 지속되면 처음 실행되고 다음 되록 수정
  startBtnEvent();
});

stopButton.addEventListener("click", () => {
  startButton.src = "images/icon_start.svg";
  chrome.runtime.sendMessage("Stop the extension from list.js");
  editUserHistoryNowDirDB('userHistoryStore', 1, 'none');
  location.reload();
});

chrome.action.onClicked.addListener(() => {
  chrome.action.getBadgeText({}, (txt) => {
    if (txt == "ON") {
      startButton.src = "images/icon_start_true.svg";
    } else {
      startButton.src = "images/icon_start.svg";
    }

  });
});

//새로운 값 입력
//db입력 함수 (backtground.js에서 동일한 코드인데 import하는 등 효율적인 방법이 없을까?
function intitDB() {
  //만들면 좋을듯
}

//데이터베이수눈 비동기 작업! 콜백 함수로 전달해서 사용해야할 것
function writeDB(datas, store_name, callback) {
  var request = indexedDB.open("HeyGoogler", 1);

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
        console.log(`dirDB 입력 완료 : ${event.target.result}`);
        // return event.target.result;
        callback(event.target.result);
      };
    }
  };
}

//edit 재사용성을 높이고 샆어
//민지 함수랑 같이 확인
function editDirNameDB(id, name) {

  var request = indexedDB.open("HeyGoogler", 1);

  request.onerror = function (event) {
    console.log("DB error", event.target.errorCode);
  };

  request.onsuccess = function (event) {
    const db = request.result;
    const transaction = db.transaction('dirStore', "readwrite");

    transaction.oncomplete = function (event) {
      console.log("성공");
    };
    transaction.onerror = function (event) {
      console.log("실패");
    };

    const objectStore = transaction.objectStore('dirStore');

    //아 변수명 잘 못 지음
    // console.log(`수정 get 전의 ${id} , ${id.type}`);
    var requestId = objectStore.get(parseInt(id)); //주의~~!!
    // console.log(`requestId ${requestId}`);
    // console.log(requestId);

    requestId.onerror = function (event) { console.log("requestId error"); }

    requestId.onsuccess = function (event) {
      var data = event.target.result;
      // console.log(`수정 될 ${data}`);
      data.dir_name = name;

      var requestUpdate = objectStore.put(data);
      requestUpdate.onerror = function (event) { console.log("requestUpdate error"); }
      requestUpdate.onsuccess = function (event) { location.reload(); }
    }

  };
}

//재사용성 높이도록 리팩토링
function deleteDirDB(id) {

  var request = indexedDB.open("HeyGoogler", 1);

  request.onerror = function (event) {
    console.log("DB error", event.target.errorCode);
  };

  request.onsuccess = function (event) {
    const db = request.result;

    //dirDel
    const transaction = db.transaction('dirStore', "readwrite");

    transaction.oncomplete = function (event) {
      console.log("성공");
    };
    transaction.onerror = function (event) {
      console.log("실패");
    };

    const objectStore = transaction.objectStore('dirStore');

    var requestDel = objectStore.delete(parseInt(id)); //주의~~!!

    requestDel.onerror = function (event) { console.log("requestId error"); }

    requestDel.onsuccess = function (event) {
      console.log("dir 삭제 성공");
    }

    //del 하위 keyword
    let keywordTransaction = db.transaction('keywordStore', 'readwrite');

    keywordTransaction.oncomplete = function (event) {
      console.log("키워드 성공");
    };
    keywordTransaction.onerror = function (event) {
      console.log("키워드 실패");
    };

    const keywordObjectStore = keywordTransaction.objectStore('keywordStore');
    const keywordSearch = keywordObjectStore.index("dir_id").getAll(parseInt(id));
    console.log('여기');
    console.log(keywordSearch);

    keywordSearch.onsuccess = (e) => {
      keywords = e.target.result;

      for (let i = 0; i < keywords.length; i++) {
        deleteDB('keywordStore', keywords[i].id);
      }
    }

    keywordTransaction.onerror = function (event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    // keywordTransaction.oncomplete = function (event) {
    //   db.close();
    // };

    //del 하위 url

    let urlTransaction = db.transaction('urlStore', 'readwrite');
    const urlObjectStore = urlTransaction.objectStore('urlStore');
    const urlSearch = urlObjectStore.index("dir_id").getAll(parseInt(id));

    urlSearch.onsuccess = (e) => {
      urls = e.target.result;

      for (let i = 0; i < urls.length; i++) {
        deleteDB('urlStore', urls[i].id);
      }
    }

    urlTransaction.onerror = function (event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    urlTransaction.oncomplete = function (event) {
      db.close();
    };
  }
}


/********************************************************************************************************* */

//열려있는 객체 저장소 정보를 open_Obs 변수로 전달
var urlStore = 'urlStore';
var keyStore = 'keywordStore';


function Toggle(data) {
  for (var i = 0; i < data.length; i++) {
    const k = data[i].keyword;
    const id = data[i].id;
    const isToggled = data[i].isToggled;
    console.log(id);
    const kwBox = document.getElementById("green-" + k);
    const pathArea = document.getElementById("white-" + k);
    const toggleButton = kwBox.querySelector(".toggle_keyword");
    let isPushed = isToggled;
    toggleButton.addEventListener("click", () => {
      // 토글 상태에 따라 컨텐츠 표시/숨김
      if (isPushed) {

        editDB("keywordStore", "isToggled", parseInt(id), false,false);
        toggleButton.classList.add("toggleShown");
        toggleButton.classList.remove("toggleHidden");

        pathArea.style.maxHeight = '100vh'
        pathArea.style.opacity = '1';
      } else {
        // 토글될 컨텐츠 숨김 (애니메이션 포함)
        editDB("keywordStore", "isToggled", parseInt(id), true,false);
        toggleButton.classList.add("toggleHidden");
        toggleButton.classList.remove("toggleShown");

        pathArea.style.maxHeight = '0';
      }
      isPushed = !isPushed;
    })
  }
}


// 데이터를 화면에 출력하는 함수
function displayURL(data) {

  //컨텐츠 들어갈 위치
  const container = document.getElementById('dataContainer');

  // 데이터를 텍스트로 변환하여 화면에 추가
  for (var i = 0; i < data.length; i++) {
    const key = data[i][0];
    const k = data[i][1];
    const t = data[i][2];
    const p = data[i][3];
    const m = data[i][4];
    //console.log("displayURL: "+key);

    const area = document.getElementById("white-" + k);

    const template = document.getElementById("path_template");
    const clone = template.content.cloneNode(true);

    const title = clone.querySelector(".path-box").querySelector(".title");
    const path = clone.querySelector(".path-box").querySelector(".path");
    const memoIcon = clone.querySelector(".path-box").querySelector(".memoIcon");

    title.innerHTML = t;
    path.innerHTML = p;
    memoIcon.id = m;

    if (!!memoIcon.id.trim()) {
      memoIcon.style.display = 'block';
    }

    memoIcon.addEventListener("mouseover", () => {
      path.innerHTML = m;
      path.style.display = "flex";
      path.style.fontSize = "12px";
      path.style.textDecoration = "none";
    })
    memoIcon.addEventListener("mouseout", () => {
      path.innerHTML = p;
      path.style.display = "block";
      path.style.fontSize = "14px";
      path.style.textDecoration = "underline";
    })

    clone.querySelector("#tooltip-title").innerHTML = t;

    clone.querySelector(".path-box").querySelector(".hyperLink").addEventListener("click", () => {
      chrome.tabs.create({ url: p });
    })

    //삭제 기능을 위해 삭제 버튼에 데이터 id 값 추가
    var deleteBtn = clone.querySelector('.white-menu1');
    deleteBtn.setAttribute('key', key);
    //각 삭제 버튼에 클릭 이벤트 리스너를 추가 


    deleteBtn.addEventListener('click', () => {
      deleteDB(urlStore, key);
    });


    const memoBtn = clone.querySelector('.white-menu3');
    let inputMemo = document.getElementById("memoInput");

    memoBtn.setAttribute('key', key);
    const modal = document.getElementById("modal")
    let memoFlag;
    memoBtn.addEventListener('click', (e) => {
      modal.style.display = "flex";
      memoFlag = e.target.getAttribute("key");
      
      readValueDB('urlStore', 'memo', parseInt(memoFlag))
      .then(result=>{
        //console.log("제대로 읽어짐****************" + result);
        //console.log(typeof(result));
        inputMemo.setAttribute('value', result);
      })
      .catch(error => {
        console.log("메모 디폴트값 불러오기 에러" + error);
      });
      //console.log(e);
      //console.log("memo버튼 클릭했을 때 memoFlag : " + memoFlag);
    })
    const closeBtn = modal.querySelector(".closeBtn")
    closeBtn.addEventListener("click", e => {
      modal.style.display = "none";
    })

    const memoSaveBtn = modal.querySelector(".saveBtn")
    memoSaveBtn.addEventListener("click", e => {
      let userInputMemo = inputMemo.value;
      //console.log(userInputMemo);
      //console.log("모달에서 저장 눌렀을 때 memoFlag : " + memoFlag);
      //console.log("를 int로 parsing한 memoFlag : " + parseInt(memoFlag));
      editDB("urlStore", "memo", parseInt(memoFlag), userInputMemo,true);
      modal.style.display = "none"

    })

    inputMemo.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        let userInputMemo = inputMemo.value;
        editDB("urlStore", "memo", parseInt(memoFlag), userInputMemo,true,true);
        modal.style.display = "none"
      }
    })

    modal.addEventListener("click", e => {
      const evTarget = e.target
      if (evTarget.classList.contains("modal-overlay")) {
        modal.style.display = "none"

      }
    })


    const editBtn = clone.querySelector('.white-menu2');
    let inputTitle = document.getElementById("titleInput");

    editBtn.setAttribute('key', key);
    const editmodal = document.getElementById("modal-t")
    let editFlag;
    editBtn.addEventListener('click', (e) => {
      editmodal.style.display = "flex";
      //몇 번째 요소 선택했는지 인덱스저장
      editFlag = e.target.getAttribute("key");
      readValueDB('urlStore', 'title', parseInt(editFlag))
      .then(result=>{
        //console.log("제대로 읽어짐****************" + result);
        //console.log(typeof(result));
        inputTitle.setAttribute('value', result);
      })
      .catch(error => {
        console.log("타이틀 디폴트값 불러오기 에러" + error);
      });
    })
    const editcloseBtn = editmodal.querySelector(".closeBtn")
    editcloseBtn.addEventListener("click", e => {

      editmodal.style.display = "none";
    })



    const editSaveBtn = editmodal.querySelector(".saveBtn")
    editSaveBtn.addEventListener("click", e => {
      let userInputTitle = inputTitle.value;
      if (!!userInputTitle.trim()) {
        editDB("urlStore", "title", parseInt(editFlag), userInputTitle,true);
        editmodal.style.display = "none"
      }

    })

    inputTitle.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        let userInputTitle = inputTitle.value;
        if (!!userInputTitle.trim()) {
          editDB("urlStore", "title", parseInt(editFlag), userInputTitle,true);
          editmodal.style.display = "none"
        }
      }
    })

    editmodal.addEventListener("click", e => {
      const editevTarget = e.target
      if (editevTarget.classList.contains("modal-overlay")) {
        editmodal.style.display = "none";
      }
    })
    if (area) {

      area.appendChild(clone);
    }
  }
}

// displayMenu();
// displayTooltip();


async function defaultDirSet() {
  console.log('디폴트 디비 함수 실행됨');
  try {
    var dirData = await readDBbyStoreName('dirStore');
    if (dirData.length < 1) {

      dirAddButtonClick();
      //위 함수도 따로 더 범용성 있게 하면 좋을 듯,, 클릭이 아니라 그냥 add자체로

    }


  } catch (error) {
    console.error(error);
  }
}

function displayTooltip(dataCount) {
  for (let i = 0; i < dataCount; i++) {
    const textElement = document.getElementsByClassName("title")[i];
    const textContent = textElement.textContent;
    const textLength = textContent.length;
    if (textLength > 22) {
      let selectedTitle = document.getElementsByClassName("title");
      selectedTitle = selectedTitle[i];
      let titleTooltip = document.getElementsByClassName("tooltipTitle");
      titleTooltip = titleTooltip[i];

      selectedTitle.addEventListener("mouseover", (e) => {
        let posX = textElement.getBoundingClientRect().left;
        let posY = textElement.getBoundingClientRect().top + window.scrollY;
        let h = textElement.offsetHeight;
        titleTooltip.style.display = "block";
        titleTooltip.style.left = posX - 5 + "px"
        titleTooltip.style.right = posX - 10 + "px"
        titleTooltip.style.top = posY + h + 3 + "px";
      });
      selectedTitle.addEventListener("mouseout", () => {
        titleTooltip.style.display = "none";
      });
    }
  }

}


function displayKeyword(data) {

  //컨텐츠 들어갈 위치
  const container = document.getElementById('dataContainer');
  // 데이터를 텍스트로 변환하여 화면에 추가
  for (var i = 0; i < data.length; i++) {
    const k = data[i][1];
    console.log(k);
    const gk = data[i][0];
    const toggleStatus = data[i][2];
    console.log(toggleStatus);

    const template = document.getElementById("keyword_template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".keyword-box").querySelector(".keyword").innerHTML = k;
    clone.querySelector(".keyword-box").id = "green-" + k;
    clone.querySelector(".path-area").id = "white-" + k;
    const toggleButton = clone.querySelector(".keyword-box").querySelector(".toggle_keyword");

    clone.querySelector(".keyword-box").querySelector(".keyword").addEventListener("click", () => {
      const url = "https://www.google.com/search?q=" + k;
      chrome.tabs.create({ url: url });
    })

    let greenBox = clone.getElementById("green-" + k);
    greenBox.setAttribute('Key', gk);

    if(toggleStatus){
      toggleButton.classList.remove("toggleShown");
      toggleButton.classList.add("toggleHidden");
      clone.querySelector(".path-area").style.maxHeight = '0';
    }
    if(!toggleStatus){
      toggleButton.classList.add("toggleShown");
      toggleButton.classList.remove("toggleHidden");
      clone.querySelector(".path-area").style.maxHeight = '100vh'
      clone.querySelector(".path-area").style.opacity = '1';
    }

    container.appendChild(clone);

  }
}

function displayMenu(dataCount) {
  for (let i = 0; i < dataCount; i++) {
    let isSelected = false;
    let selectedMenu = document.getElementsByClassName("menu_white");
    selectedMenu = selectedMenu[i];
    let menubar = document.getElementsByClassName('menubar');
    menubar = menubar[i];
    let title = document.getElementsByClassName("title");
    let path = document.getElementsByClassName("path");
    title = title[i];
    path = path[i];
    if (selectedMenu) {
      selectedMenu.addEventListener("click", function () {
        isSelected = !isSelected;
        if (isSelected) {
          menubar.classList.remove('inactive');
          title.classList.remove('inactive');
          path.classList.remove('inactive');
          menubar.classList.add('active');
          title.classList.add('active');
          path.classList.add('active');
          setTimeout(() => {
            isSelected = !isSelected;
            menubar.classList.remove('active');
            title.classList.remove('active');
            path.classList.remove('active');
            menubar.classList.add('inactive');
            title.classList.add('inactive');
            path.classList.add('inactive');
          }, 5000);
        } else {
          menubar.classList.remove('active');
          title.classList.remove('active');
          path.classList.remove('active');
          menubar.classList.add('inactive');
          title.classList.add('inactive');
          path.classList.add('inactive');
        }
      })
    }
  }
}

function greenBoxRightClick(data) {
  for (var i = 0; i < data.length; i++) {
    const id = data[i].id;
    const k = data[i].keyword;
    const kwBox = document.getElementById("green-" + k);
    const contextMenu = document.getElementById("contextmenu");
    const deleteMenu = document.getElementById("deleteGreen");
    const modal = document.getElementById("confirmModal");

    kwBox.oncontextmenu = function (e) {

      console.log(e);


      let winWidth = 350;    //document.body 의 width
      let posX = e.pageX;
      let posY = e.pageY;
      let menuWidth = 100;   //contextMenu 의 width

      //Security margin:
      let secMargin = 10;

      //Prevent page overflow:
      if (posX + menuWidth + secMargin >= winWidth) {
        //Case 2: right overflow:
        posLeft = posX - menuWidth - secMargin + "px";
        posTop = posY + secMargin + "px";
      }
      else {
        //Case 3: default values:
        posLeft = posX + secMargin + "px";
        posTop = posY + secMargin + "px";
      };

      //Display contextmenu:
      contextMenu.style.display = 'block';
      contextMenu.style.left = posLeft;
      contextMenu.style.top = posTop;

      // Hide contextmenu:
      document.body.addEventListener("click", () => {
        contextMenu.style.display = 'none';
      })

      deleteMenu.addEventListener("click", () => {
        modal.style.display = "flex";
      })

      const closeBtn = modal.querySelector(".closeBtn");
      const deleteBtn = modal.querySelector(".deleteBtn");
      closeBtn.addEventListener("click", e => {
        modal.style.display = "none";
      })
      deleteBtn.addEventListener("click", () => {
        var request = indexedDB.open("HeyGoogler", 1);

        request.onerror = function (event) {
          console.log("IndexedDB 데이터베이스를 열 수 없습니다.");
        };

        request.onsuccess = function (event) {
          const db = event.target.result;

          let transaction = db.transaction([urlStore], 'readwrite');
          let objectStore = transaction.objectStore(urlStore);
          let urlSearch = objectStore.index("keyword").getAll(k);

          urlSearch.onsuccess = (e) => {
            urls = e.target.result;
            console.log(urlSearch);
            console.log(urls);

            for (let i = 0; i < urls.length; i++) {
              deleteDB(urlStore, urls[i].id);
            }
          }

          transaction.onerror = function (event) {
            console.log("트랜잭션 오류:", event.target.error);
          };

          transaction.oncomplete = function (event) {
            console.log("ㅅㄱ")
            db.close();
          };
        }
        modal.style.display = "none";
      })

      modal.addEventListener("click", e => {
        const evTarget = e.target
        if (evTarget.classList.contains("modal-overlay")) {
          modal.style.display = "none";
        }
      })
      return false;
    }
  }
}



//혜교가 쓴 코드 참고해서 DB 읽는 함수 다시..
//readDB() 에는 데이터 불러와서 초록박스,흰색박스 display 하는 것만 포함
function readDB() {

  return new Promise((resolve, reject) => {
    //console.log("readDB 실행 시점과 dirId "+ nowDirId);
    var request = indexedDB.open("HeyGoogler", 1);

    request.onerror = function (event) {
      console.log("IndexedDB 데이터베이스를 열 수 없습니다.");
    };

    //1. open() 함수 성공 시 저장소 객체를 불러와서 request에 저장
    request.onsuccess = function (event) {
      const db = event.target.result;

      /* 키워드 출력 (초록 박스) */
      let transaction = db.transaction([keyStore], 'readonly');
      let objectStore = transaction.objectStore(keyStore);
      let dirId = parseInt(nowDirId);
      //console.log(typeof(dirId)); 
      let dirFilterKeyword = [];
      let greenIndex = objectStore.index("dir_id");
      let greenKeyRange = IDBKeyRange.only(dirId);

      greenIndex.openCursor(greenKeyRange).onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
          //console.log(cursor.value.keyword);
          dirFilterKeyword.push([cursor.value.id, cursor.value.keyword,cursor.value.isToggled]);
          cursor.continue();
        } else {
          //console.log(dirFilterKeyword);
          displayKeyword(dirFilterKeyword);
        }
      }
      transaction.onerror = function (event) {
        console.log("트랜잭션 오류:", event.target.error);
      };

      transaction.oncomplete = function (event) {
        db.close();
      };

      /* url 출력 (하얀 박스) */
      transaction = db.transaction([urlStore], 'readonly');
      objectStore = transaction.objectStore('urlStore');

      let dirFilterUrl = [];
      let whiteIndex = objectStore.index("dir_id");
      let whiteKeyRange = IDBKeyRange.only(dirId);

      whiteIndex.openCursor(whiteKeyRange).onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
          dirFilterUrl.push([cursor.value.id, cursor.value.keyword, cursor.value.title, cursor.value.url, cursor.value.memo]);
          cursor.continue();
        } else {
          displayURL(dirFilterUrl);
        }
      }

      transaction.onerror = function (event) {
        console.log("트랜잭션 오류:", event.target.error);
      };

      transaction.oncomplete = function (event) {
        db.close();
      };

      resolve();
    }
  })
}


//초록박스나 흰색박스가 생성된 이후에 추가해야되는 이벤트는 addEvent() 함수 안쪽으로 다 빼냈어 !!
//promise 객체 이용해가지고 readDB() 함수가 끝까지 실행되어야만 addEvent() 코드가 실행되도록 구현했습니당 ..
function addEvent() {
  //console.log("addEvent 전달 "+nowDirId );
  readDB().then(() => {

    var request = indexedDB.open("HeyGoogler", 1);
    let dirId = parseInt(nowDirId);

    request.onerror = function (event) {
      console.log("IndexedDB 데이터베이스를 열 수 없습니다.");
    };

    request.onsuccess = function (event) {
      const db = event.target.result;

      /* url 없을 경우 초록 박스 자동 삭제 */
      let transaction = db.transaction([keyStore, urlStore], 'readwrite');
      let kStore = transaction.objectStore(keyStore);
      let uStore = transaction.objectStore(urlStore);


      requestKey = kStore.getAll();

      requestKey.onsuccess = function (event) {
        let keyData = event.target.result;

        // keyStore의 데이터를 keyData 변수에 저장

        // keyData 배열의 각 요소에 대해 반복
        for (var i = 0; i < keyData.length; i++) {
          let dirId = keyData[i].dir_id;
          let keyword = keyData[i].keyword;
          let id = keyData[i].id;

          // urlStore에서 dir_id와 keyword가 일치하는 데이터를 검색
          let requestUrlSearch = uStore.index('dir_id_keyword').get([dirId, keyword]);


          requestUrlSearch.onsuccess = function (event) {
            let matchingUrlData = event.target.result;

            if (!matchingUrlData) {
              deleteDB(keyStore, id);
              console.log("GreenBox deleted");
            }
          };
        }

      };


      transaction.onerror = function (event) {
        console.log("트랜잭션 오류:", event.target.error);
      };

      transaction.oncomplete = function (event) {
        db.close();
      };


      /* 하얀 박스에 이벤트 추가 (menu , tooltip) - 수정완료 */

      transaction = db.transaction([urlStore], 'readonly');
      objectStore = transaction.objectStore('urlStore');

      dirSearch = objectStore.index("dir_id").getAll(dirId);
      dirSearch.onsuccess = (e) => {
        let filteredURL = e.target.result;
        displayMenu(filteredURL.length);
        displayTooltip(filteredURL.length);
      }

      transaction.onerror = function (event) {
        console.log("트랜잭션 오류:", event.target.error);
      };

      transaction.oncomplete = function (event) {
        db.close();
      };

      /* 초록 박스에 토글 이벤트 추가 - 수정완료 */
      /* 초록 박스에 우클릭 이벤트 추가 - 수정완료*/

      transaction = db.transaction([keyStore], 'readonly');
      objectStore = transaction.objectStore(keyStore);
      dirSearch = objectStore.index("dir_id").getAll(dirId);

      dirSearch.onsuccess = (e) => {
        let filteredKeyword = e.target.result;
        Toggle(filteredKeyword);
        greenBoxRightClick(filteredKeyword);
      }
      transaction.onerror = function (event) {
        console.log("트랜잭션 오류:", event.target.error);
      };

      transaction.oncomplete = function (event) {
        db.close();
      };


    }
  })
}


//dirlist에서
// 데이터베이스 읽어서 화면에 표시
function readDBAndDisplay() {
  var request = indexedDB.open("HeyGoogler", 1);

  request.onerror = function (event) {
    console.log("DB error", event.target.errorCode);
  };

  request.onsuccess = function (event) {
    const db = request.result;
    const transaction = db.transaction(['dirStore'], "readonly");
    const objectStore = transaction.objectStore("dirStore");

    const requestGetAll = objectStore.getAll();

    requestGetAll.onsuccess = function (event) {
      const data = event.target.result;
      displayData(data);
    };

    requestGetAll.onerror = function (event) {
      console.log("데이터 읽기 실패");
    };
  };
}

// 데이터를 화면에 표시
async function displayData(data) {
  const container = document.getElementById("dir_container");
  var nowDIrId;
  nowDIrId = await getNowDirId();
  console.log('현재 실행 중 :');
  console.log(nowDIrId);

  data.forEach(item => {
    const copy = document.getElementById("dir_template").content.cloneNode(true);
    const dirList = copy.querySelector(".dir-list");
    const editButton = copy.querySelector(".button-edit");
    const deleteButton = copy.querySelector(".button-del");
    const dirLink = copy.querySelector(".dir-link");
    const dirTooltip = copy.querySelector(".dir-list").querySelector(".tooltipDirTitle");

    dirList.id = item.d_id;
    if (dirList.id == nowDIrId) {
      dirList.style.backgroundColor = '#DFF5E5'
    } else {
      dirList.style.backgroundColor = 'white'
    }
    dirList.querySelector(".dir-text").textContent = item.dir_name;
    dirTooltip.textContent = item.dir_name;
    //일정 길이 이상일 경우 툴팁도 업데이트------------------------------------------
    let dirTextLength = parseInt(item.dir_name.length);
    if (dirTextLength > 14) {
        let selectedTitle = dirList.querySelector(".dir-text");
        let titleTooltip = dirList.querySelector(".tooltipDirTitle");
        selectedTitle.addEventListener("mouseover", (e) => {
          titleTooltip.style.display = "block";
        });
    
        selectedTitle.addEventListener("mouseout", () => {
          titleTooltip.style.display = "none";
        });
    } 
    //-------------------------------

    editButton.addEventListener("click", function () {
      setupDirEditEvent(this);
    });

    deleteButton.addEventListener("click", function () {
      setupDirDeleteEvent(this);
    });

    //전체 리스트 개시할 때 링크 작업도 해줘야함 .. 어휴 삽질 한참 했네
    const extensionURL = chrome.runtime.getURL(`list.html?dir_id=${item.d_id}&dirname=${encodeURIComponent(item.dir_name)}`);
    dirLink.href = extensionURL;

    container.appendChild(copy);
  });
}


function deleteDB(obs, key) {
  // 1. db 열기
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  // 2-1. db 오픈 성공 시, 현재 열려있는 객체 저장소 정보 받아옴
  request.onsuccess = (e) => {

    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    // 2-2. 열려있는 저장소(현재는 url 저장소) 접근
    const objStore = transaction.objectStore([obs]);

    // 3. 삭제하기 (키 값인 id로 지정해야 함)
    const objStoreRequest = objStore.delete(key);
    objStoreRequest.onsuccess = (e) => {
      console.log('deleted ' + key);
      transaction.commit();
      location.reload();
    }
  }
}



/* 나중에 open_Obs 변수에 원하는 저장소 불러올 수 있다면 위의 deleteDB()와 
통일해서 사용 가능. deleteDB2()는 키워드 삭제용 임시 함수 */
function deleteDB2(key) {
  // 1. db 열기
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  // 2-1. db 오픈 성공 시, 현재 열려있는 객체 저장소 정보 받아옴
  request.onsuccess = (e) => {
    var open_Obs = 'keywordStore'
    const db = request.result;
    const transaction = db.transaction([open_Obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    // 2-2. 열려있는 저장소(현재는 url 저장소) 접근
    const objStore = transaction.objectStore([open_Obs]);
    // 3. 삭제하기 (키 값인 id로 지정해야 함)
    const objStoreRequest = objStore.delete(key);
    objStoreRequest.onsuccess = (e) => {
      console.log('deleted ' + key);
      transaction.commit();
    }
  }
}
function editDB(obs, field, key, value,reload) {
  //value는 변경하려는 값
  //1. db 열기
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  //2. db 오픈 성공 시, 현재 열려있는 객체 저장소 정보 받아옴
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
    //3. key 값을 가진 데이터 불러오기
    //console.log("editDB 함수 안의 key : "+key);
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      let data = event.target.result;
      data[field] = value;
      let updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => {
        console.log('update success');
        if(reload){
          location.reload();
        }
        
      }
    }

  }
}

function readValueDB(obs, field, key) {
  //비동기 콜백 함수 내에서는 return (x), promise (o)
  return new Promise((resolve, reject) => {
    var request = indexedDB.open("HeyGoogler", 1);
    request.onerror = (e) => reject(e.target.errorCode);
    request.onsuccess = (e) => {
      const db = request.result;
      const transaction = db.transaction([obs], 'readwrite');
      const objStore = transaction.objectStore([obs]);

      const objStoreRequest = objStore.get(key);
      objStoreRequest.onsuccess = function (event) {
        let data = event.target.result;
        let findValue;

        findValue = data[field];

        resolve(findValue);
      };
    };
  });
}

function editUserHistoryNowDirDB(obs, key, value) {
  // return new Promise((resolve, reject) => { });
  //1. db 열기
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  //2. db 오픈 성공 시, 현재 열려있는 객체 저장소 정보 받아옴
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
    //3. key 값을 가진 데이터 불러오기
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      var data = event.target.result;
      // 현재는 title의 값 수정하도록 되어있음
      data.nowExecutedDir = value;
      var updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => console.log('update success');
    }
  }
}

function editUserHistoryRecentlyExecutedDirDB(obs, key, value) {
  //1. db 열기
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  //2. db 오픈 성공 시, 현재 열려있는 객체 저장소 정보 받아옴
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
    //3. key 값을 가진 데이터 불러오기
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      var data = event.target.result;
      // 현재는 title의 값 수정하도록 되어있음
      data.recentlyExecutedDir = value;
      var updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => console.log('update success');
    }
    // location.reload();
  }
}

function editUserHistoryRecentlyVisitedDB(obs, key, value) {
  //1. db 열기
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  //2. db 오픈 성공 시, 현재 열려있는 객체 저장소 정보 받아옴
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
    //3. key 값을 가진 데이터 불러오기
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      var data = event.target.result;
      data.recentlyVisitedDir = value;
      var updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => console.log('update success');
    }
  }
}





// readDB() 함수 호출


//addEvent();
// editDB('keywordStore', "dir_id", 3, 3 );
// editDB('keywordStore', "dir_id", 4, 4 );
// editDB('urlStore', "dir_id", 2, 2 );
// editDB('urlStore', "dir_id", 3, 3 );
// editDB('urlStore', "dir_id", 4, 4 );
// editDB('urlStore', "dir_id", 5, 4 );
// editDB('urlStore', "dir_id", 6, 4 );

// 삭제 버튼을 클릭할 때 실행되는 함수를 정의
function handleClick(event) {
  var keyValue = event.target.getAttribute("key");
  deleteDB(parseInt(keyValue)); //keyValue 값이 string.. 주의
}