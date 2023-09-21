
// let onDirLink; 
// let currentDirLink;
let nowDirId;
// let onDirId;
//FIXME 결국 이렇게 전역 변수로 할거면,, id 구하는 코드 중 필요 없는거 꽤 많을 듯

//init
//분기해서 사용하는 거 중요함
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/list.html") {
    initListPage();

  } else if (window.location.pathname === "/dirList.html") {
    readDBAndDisplay();
    document.getElementById("dirAddButton").addEventListener("click", () => { dirAddButtonClick(); });

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
  const data = [{ dir_name: 'NEW DIR' }];
  writeDB(data, 'dirStore', function (d_id) {
    // console.log(`dirAddButton 눌러쓸 때의 d_id : ${d_id}`);
    copy.querySelector(".dir-list").id = d_id;

    // dir_id를 사용하여 링크 생성
    const dir_id = d_id;
    const dirName = 'NEW DIR';
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

  // input 생성
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.value = currentTextValue;
  inputElement.classList.add("input-dir");

  const aElement = dirElement.querySelector("a");
  aElement.replaceChild(inputElement, dirTextElement);

  inputElement.focus();
  inputElement.select();

  // 엔터가 눌렸을 때 수정이 완료되도록
  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const newDirName = inputElement.value.trim();
      if (newDirName !== "") {
        const newDirTextElement = document.createElement("h1");
        newDirTextElement.classList.add("dir-text");
        newDirTextElement.textContent = newDirName;

        const newAElement = document.createElement("a");

        // 새로운 URL 파라미터로 dir_id와 dirname을 사용하여 페이지를 업데이트
        const dir_id = dirElement.id;
        // newAElement.href = `./list.html?dir_id=${dir_id}&dirname=${encodeURIComponent(newDirName)}`;
        const extensionURL = chrome.runtime.getURL(`list.html?dir_id=${dir_id}&dirname=${encodeURIComponent(newDirName)}`);
        newAElement.href = extensionURL;
        console.log('edit href');
        console.log(newAElement.href);

        newAElement.appendChild(newDirTextElement);

        const buttonEdit = dirElement.querySelector(".button-edit");
        const buttonDel = dirElement.querySelector(".button-del");

        const newLiElement = document.createElement("li");
        newLiElement.classList.add("dir-list", "dir");
        newLiElement.appendChild(newAElement);
        newLiElement.appendChild(buttonEdit);
        newLiElement.appendChild(buttonDel);

        dirElement.parentNode.replaceChild(newLiElement, dirElement);

        // 디렉토리 이름 데이터베이스에 업데이트
        editDirNameDB(dir_id, newDirName);

      } else {
        alert("빈칸 놉");
      }
    }
  });
}



function setupDirDeleteEvent(button) {
  const dirElement = button.closest("li");
  dirElement.parentNode.removeChild(dirElement);
  // 디렉토리 데이터베이스에서도 삭제
  const d_id = dirElement.id;
  deleteDirDB(d_id);
}


// 리스트 페이지 초기화 함수
function initListPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const dirName = urlParams.get("dirname");
  const dirId = urlParams.get("dir_id");

  // var url = chrome.runtime.getURL(`list.html?dir_id=${dirId}&dirname=${encodeURIComponent(dirName)}`);

  // currentDirLink = url;
  nowDirId = dirId;

  console.log("initListPage");
  console.log(dirName, dirId);
  // console.log(currentDirLink, currenDirId);

  //NULL체크는 필수! -> 왜냐하면 dirlist.html에서는 dirName이 null이기 때문에
  if (dirName != null) {
    const dirNameElement = document.querySelector("#dir-name");
    dirNameElement.textContent = dirName;
  }

  //TODOdirId에 맞게 키워드와 url 필터링해서 디스플레이 하는 작업 진행
  //null 체크 필수 
  if (dirId != null) {
  }
}



// //dir-name 에 title 부여
//list.html에서만 가능하니 주의해야함 
// document.getElementById("dir-name").title =
//   document.getElementById("dir-name").innerHTML;

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
  // onDirId = currenDirId; 
  chrome.runtime.sendMessage("Start the extension from list.js");
});

stopButton.addEventListener("click", () => {
  startButton.src = "images/icon_start.svg";
  // onDirLink = '';
  // onDirId = 0;
  chrome.runtime.sendMessage("Stop the extension from list.js");
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
      requestUpdate.onsuccess = function (event) { console.log("requestUpdate success"); }
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
    const transaction = db.transaction('dirStore', "readwrite");

    transaction.oncomplete = function (event) {
      console.log("성공");
    };
    transaction.onerror = function (event) {
      console.log("실패");
    };

    const objectStore = transaction.objectStore('dirStore');

    var requestDel = objectStore.delete(parseInt(id)); //주의~~!!

    requestId.onerror = function (event) { console.log("requestId error"); }

    requestId.onsuccess = function (event) {
      console.log("dir 삭제 성공");
    }
  }
}


/********************************************************************************************************* */

//열려있는 객체 저장소 정보를 open_Obs 변수로 전달
var urlStore = 'urlStore';
var keyStore = 'keywordStore';


function Toggle(data) {
  for (var i = 0; i < data.length; i++) {
    const k = data[i].keyword;

    const kwBox = document.getElementById("green-" + k);
    const pathArea = document.getElementById("white-" + k);
    const toggleButton = kwBox.querySelector(".toggle_keyword");
    let isToggled = false;

    toggleButton.addEventListener("click", () => {
      // 토글 상태에 따라 컨텐츠 표시/숨김
      if (isToggled) {

        toggleButton.classList.add("toggleShown");
        toggleButton.classList.remove("toggleHidden");

        pathArea.style.maxHeight = '100vh'
        pathArea.style.opacity = '1';
      } else {
        // 토글될 컨텐츠 숨김 (애니메이션 포함)
        toggleButton.classList.add("toggleHidden");
        toggleButton.classList.remove("toggleShown");

        pathArea.style.maxHeight = '0';
      }
      isToggled = !isToggled;
    })
  }
}


// 데이터를 화면에 출력하는 함수
function displayURL(data) {

  //컨텐츠 들어갈 위치
  const container = document.getElementById('dataContainer');

  // 데이터를 텍스트로 변환하여 화면에 추가
  for (var i = 0; i < data.length; i++) {
    const k = data[i].keyword;
    const t = data[i].title;
    const p = data[i].url;
    const key = data[i].id;
    //console.log(key);

    const area = document.getElementById("white-" + k);

    const template = document.getElementById("path_template");
    const clone = template.content.cloneNode(true);

    const title = clone.querySelector(".path-box").querySelector(".title");
    const path = clone.querySelector(".path-box").querySelector(".path")

    title.innerHTML = t;
    path.innerHTML = p;

    clone.querySelector(".path-box").querySelector("#tooltip-title").innerHTML = t;

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
    memoBtn.setAttribute('key', key);
    const modal = document.getElementById("modal")
    var memoFlag;
    memoBtn.addEventListener('click', () => {
      modal.style.display = "flex";
      memoFlag = e.target.parentElement.getAttribute("key");
    })
    const closeBtn = modal.querySelector(".closeBtn")
    closeBtn.addEventListener("click", e => {
      modal.style.display = "none"
    })
    const memoSaveBtn = modal.querySelector(".saveBtn")
    memoSaveBtn.addEventListener("click", e=> {
      let inputMemo = document.getElementById("memoInput");
      let userInputMemo = inputMemo.value;
      editDB("urlStore", "memo", parseInt(editFlag), userInputMemo);
      modal.style.display = "none"
    })
    modal.addEventListener("click", e => {
      const evTarget = e.target
      if (evTarget.classList.contains("modal-overlay")) {
        modal.style.display = "none"

      }
    })


    const editBtn = clone.querySelector('.white-menu2');
    editBtn.setAttribute('key', key);
    const editmodal = document.getElementById("modal-t")
    var editFlag;
    editBtn.addEventListener('click', (e) => {
     editmodal.style.display = "flex";
     //몇 번째 요소 선택했는지 인덱스저장
     editFlag = e.target.parentElement.getAttribute("key");
    })
    const editcloseBtn = editmodal.querySelector(".closeBtn")
    editcloseBtn.addEventListener("click", e => {
    editmodal.style.display = "none"
    })
    const editSaveBtn = editmodal.querySelector(".saveBtn")
    editSaveBtn.addEventListener("click", e=> {
      let inputTitle = document.getElementById("titleInput");
      let userInputTitle = inputTitle.value;
      editDB("urlStore", "title", parseInt(editFlag), userInputTitle);
      editmodal.style.display = "none"
    })

    editmodal.addEventListener("click", e => {
      const editevTarget = e.target
      if (editevTarget.classList.contains("modal-overlay")) {
        editmodal.style.display = "none"
      }
    })
    if(area){

      area.appendChild(clone);
    }
  }
}

// displayMenu();
// displayTooltip();




function displayTooltip() {
  const textElement = document.getElementsByClassName("title")[i];
  const textContent = textElement.textContent;
  const textLength = textContent.length;

  if (textLength > 22) {
    var selectedTitle = document.getElementsByClassName("title");
    selectedTitle = selectedTitle[i];
    var titleTooltip = document.getElementsByClassName("tooltip");
    titleTooltip = titleTooltip[i + 1];

    selectedTitle.addEventListener("mouseover", () => {
      titleTooltip.style.display = "block";
    });
    selectedTitle.addEventListener("mouseout", () => {
      titleTooltip.style.display = "none";
    });
  }
}


function displayKeyword(data) {

  //컨텐츠 들어갈 위치
  const container = document.getElementById('dataContainer');

  // 데이터를 텍스트로 변환하여 화면에 추가
  for (var i = 0; i < data.length; i++) {
    const k = data[i].keyword;
    const gk = data[i].id;

    const template = document.getElementById("keyword_template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".keyword-box").querySelector(".keyword").innerHTML = k;
    clone.querySelector(".keyword-box").id = "green-" + k;
    clone.querySelector(".path-area").id = "white-" + k;

    clone.querySelector(".keyword-box").querySelector(".keyword").addEventListener("click", () => {
      const url = "https://www.google.com/search?q=" + k;
      chrome.tabs.create({ url: url });
    })

    var greenBox = clone.getElementById("green-" + k);
    greenBox.setAttribute('Key', gk);

    container.appendChild(clone);


  }
}

function displayMenu() {
  let isSelected = false;
  let selectedMenu = document.getElementsByClassName("menu_white");
  selectedMenu = selectedMenu[i];
  let menubar = document.getElementsByClassName('menubar');
  menubar = menubar[i];
  if (selectedMenu) {
    selectedMenu.addEventListener("click", function () {
      isSelected = !isSelected;
      if (isSelected) {
        menubar.classList.remove('inactive');
        title.classList.remove('inactive');
        menubar.classList.add('active');
        title.classList.add('active');
        setTimeout(() => {
          isSelected = !isSelected;
          menubar.classList.remove('active');
          title.classList.remove('active');
          menubar.classList.add('inactive');
          title.classList.add('inactive');
        }, 5000);
      } else {
        menubar.classList.remove('active');
        title.classList.remove('active');
        menubar.classList.add('inactive');
        title.classList.add('inactive');
      }
    })
  }
}

function displayTooltip() {
  const textElement = document.getElementsByClassName("title")[i];
  const textContent = textElement.textContent;
  const textLength = textContent.length;

  if (textLength > 22) {
    var selectedTitle = document.getElementsByClassName("title");
    selectedTitle = selectedTitle[i];
    var titleTooltip = document.getElementsByClassName("tooltip");
    titleTooltip = titleTooltip[i + 1];

    selectedTitle.addEventListener("mouseover", () => {
      titleTooltip.style.display = "block";
    });
    selectedTitle.addEventListener("mouseout", () => {
      titleTooltip.style.display = "none";
    });
  }
}



//혜교가 쓴 코드 참고해서 DB 읽는 함수 다시..
function readDB() {
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
    let request = objectStore.getAll();

    request.onsuccess = function (event) {
      var data = event.target.result;
      displayKeyword(data);
    };

    transaction.onerror = function (event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    transaction.oncomplete = function (event) {
      db.close();
    };

    /* url 출력 (하얀 박스) */
    transaction = db.transaction([urlStore], 'readonly');
    objectStore = transaction.objectStore('urlStore');
    request = objectStore.getAll();
    //2. getAll() 함수 성공 시, 화면에 출력
    request.onsuccess = function (event) {

      var data = event.target.result;
      //data에는 urlStore 객체 저장소의 모든 데이터가 배열 형태로 저장
      displayURL(data);
    };

    transaction.onerror = function (event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    transaction.oncomplete = function (event) {
      db.close();
    };

    /* url 없을 경우 초록 박스 자동 삭제 */
    transaction = db.transaction([keyStore, urlStore], 'readwrite');
    objectStoreKey = transaction.objectStore(keyStore);
    objectStoreUrl = transaction.objectStore(urlStore);

    requestKey = objectStoreKey.getAll();


    requestKey.onsuccess = function(event) {
      let keyData = event.target.result;

      // keyStore의 데이터를 keyData 변수에 저장

      // keyData 배열의 각 요소에 대해 반복
      for (var i = 0; i < keyData.length; i++) {
        let dirId = keyData[i].dir_id;
        let keyword = keyData[i].keyword;
        let id = keyData[i].id;

        // urlStore에서 dir_id와 keyword가 일치하는 데이터를 검색
        let requestUrlSearch = objectStoreUrl.index('dir_id_keyword').get([dirId, keyword]);


        requestUrlSearch.onsuccess = function(event) {
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


    /* 하얀 박스에 이벤트 추가 (menu , tooltip) */

    transaction = db.transaction([urlStore], 'readonly');
    objectStore = transaction.objectStore('urlStore');
    request = objectStore.getAll();
    //2. getAll() 함수 성공 시, 화면에 출력
    request.onsuccess = function (event) {
      var data = event.target.result;
      //data에는 urlStore 객체 저장소의 모든 데이터가 배열 형태로 저장
      for (var i = 0; i < data.length; i++) {
        //displayMenu
        let isSelected = false;
        let selectedMenu = document.getElementsByClassName("menu_white");
        selectedMenu = selectedMenu[i];
        let menubar = document.getElementsByClassName('menubar');
        menubar = menubar[i];
        let title = document.getElementsByClassName("title");
        title = title[i];
        if (selectedMenu) {
          selectedMenu.addEventListener("click", function () {
            isSelected = !isSelected;
            if (isSelected) {
              menubar.classList.remove('inactive');
              title.classList.remove('inactive');
              menubar.classList.add('active');
              title.classList.add('active');
              setTimeout(() => {
                isSelected = !isSelected;
                menubar.classList.remove('active');
                title.classList.remove('active');
                menubar.classList.add('inactive');
                title.classList.add('inactive');
              }, 5000);
            } else {
              menubar.classList.remove('active');
              title.classList.remove('active');
              menubar.classList.add('inactive');
              title.classList.add('inactive');
            }
          })
        }
        //displayTooltip

          const textElement = document.getElementsByClassName("title")[i];
          const textContent = textElement.textContent;
          const textLength = textContent.length;
          
          if(textLength > 22){
            //주의: var 아닌 let으로 선언해줘야함.
            let selectedTitle = document.getElementsByClassName("title");
            selectedTitle = selectedTitle[i];
            let titleTooltip = document.getElementsByClassName("tooltipTitle");
            titleTooltip = titleTooltip[i];
        
            selectedTitle.addEventListener("mouseover", () => {
              titleTooltip.style.display = "block";
            });
            selectedTitle.addEventListener("mouseout", () => {
              titleTooltip.style.display = "none";
            });
          }

      }

    };

    transaction.onerror = function (event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    transaction.oncomplete = function (event) {
      db.close();
    };


  };
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
    const transaction = db.transaction("dirStore", "readonly");
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
function displayData(data) {
  const container = document.getElementById("dir_container");

  data.forEach(item => {
    const copy = document.getElementById("dir_template").content.cloneNode(true);
    const dirList = copy.querySelector(".dir-list");
    const editButton = copy.querySelector(".button-edit");
    const deleteButton = copy.querySelector(".button-del");
    const dirLink = copy.querySelector(".dir-link");

    dirList.id = item.d_id;
    dirList.querySelector(".dir-text").textContent = item.dir_name;

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

function addEvent() {
  var request = indexedDB.open("HeyGoogler", 1);

  request.onerror = function (event) {
    console.log("IndexedDB 데이터베이스를 열 수 없습니다.");
  };

  //1. open() 함수 성공 시 저장소 객체를 불러와서 request에 저장
  request.onsuccess = function (event) {
    const db = event.target.result;
    let transaction = db.transaction([keyStore], 'readonly');
    let objectStore = transaction.objectStore(keyStore);
    let request = objectStore.getAll();
    //2. getAll() 함수 성공 시, 각각의 키워드에 토글 이벤트 추가
    request.onsuccess = function (event) {
      var data = event.target.result;
      Toggle(data);
    };

    transaction.onerror = function (event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    transaction.oncomplete = function (event) {
      db.close();
    };
  }
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

function editDB(obs, field, key, value) {
  //value는 변경하려는 값
  //1. db 열기
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  //2. db 오픈 성공 시, 현재 열려있는 객체 저장소 정보 받아옴
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) =>console.log('success');
    const objStore = transaction.objectStore([obs]);
    //3. key 값을 가진 데이터 불러오기
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      let data = event.target.result;
      // 현재는 title의 값 수정하도록 되어있음
      if(field == "url"){
        data.url = value;
      }
      else if(field == "title"){
        data.title = value;
      }
      else if(field == "memo"){
        data.memo = value;
      }
      else if(field == "keyword"){
        data.keyword = value;
      }
      else if(field == "dir_id"){
        data.dir_id = value;
      }
      else if(field == "dir_name"){
        data.dir_name = value;
      }
      else {
        console.log("필드 추가가 필요함");
      }

      let updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => console.log('update success');
    }
    location.reload();
  }
}


  // readDB() 함수 호출
  readDB();
  addEvent();



// 삭제 버튼을 클릭할 때 실행되는 함수를 정의
function handleClick(event) {
  var keyValue = event.target.getAttribute("key");
  deleteDB(parseInt(keyValue)); //keyValue 값이 string.. 주의
}