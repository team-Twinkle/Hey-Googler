window.history.scrollRestoration = "auto";

//키워드 토글
function keywordToggleClick() {
  //var toggle = document.getElementsByClassName("toggle_keyword");
  //class로 통채로 받아..? 그럼 전부 지정인가??
}

//dir추가 버튼
function dirAddButtonClick() {
  var dir = document.getElementById("dir_template");
  var copy = dir.content.cloneNode(true);
  document.getElementById("dir_container").appendChild(copy);
  // id를 부여하기 위해 db에 접근해서 몇번까지 아이디 있는지 확인하는 과정
  // 새로 생성된 디렉토리 id를 부여하고 indexeddb 에 집어넣는 과정
}
function dirEdit(button) {
  console.log("함수 실행");
  const dirElement = button.closest("li");
  const dirTextElement = dirElement.querySelector(".dir-text");
  const currentTextValue = dirTextElement.textContent;

  //input 생성
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.value = currentTextValue;
  inputElement.classList.add("input-dir");

  const aElement = dirElement.querySelector("a");
  aElement.replaceChild(inputElement, dirTextElement);

  inputElement.focus();
  inputElement.select();

  //엔터가 눌렸을 때 수정이 완료되도록 하는 것으로
  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const newDirName = inputElement.value.trim();
      if (newDirName !== "") {
        const newDirTextElement = document.createElement("h1");
        newDirTextElement.classList.add("dir-text");
        newDirTextElement.textContent = newDirName;

        const newAElement = document.createElement("a");
        newAElement.href = `./list.html?dirname=${newDirName}`; //백틱으로 감싸기!!
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
      } else {
        alert("빈칸 놉");
      }
    }
  });
}

function dirDel(button) {
  const dirElement = button.closest("li");
  dirElement.parentNode.removeChild(dirElement);
  // 디렉토리 데이터베이스에서도 삭제
}

// URL 파라미터에서 dirname 값을 가져오는 함수
function getDirNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("dirname");
}

// 리스트 페이지 초기화 함수
function initListPage() {
  const dirName = getDirNameFromURL();

  // 디렉토리 이름이 존재한다면 리스트 페이지에 그 이름을 적용
  if (dirName) {
    const dirNameElement = document.querySelector("#dir-name");
    dirNameElement.textContent = dirName;
  }
}

// 리스트 페이지 초기화 함수 호출
initListPage();

//dir-name 에 title 부여
document.getElementById("dir-name").title =
  document.getElementById("dir-name").innerHTML;

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
  chrome.runtime.sendMessage("Start the extension from list.js");
});

stopButton.addEventListener("click", () => {
  startButton.src = "images/icon_start.svg";
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
        pathArea.style.maxHeight = '100vh'
        pathArea.style.opacity = '1';
        isToggled = !isToggled;
      } else {
        // 토글될 컨텐츠 숨김 (애니메이션 포함)
        pathArea.style.maxHeight = '0';
        isToggled = !isToggled;
      }


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
    var deleteKey = clone.querySelector('.white-delete');
    deleteKey.setAttribute('key', key);
    //각 삭제 버튼에 클릭 이벤트 리스너를 추가 
    deleteKey.addEventListener('click', () => {
      deleteDB(urlStore, key);
    });

    area.appendChild(clone);

    // displayMenu();
    // displayTooltip();



  }
}

function displayKeyword(data) {

  //컨텐츠 들어갈 위치
  const container = document.getElementById('dataContainer');

  // 데이터를 텍스트로 변환하여 화면에 추가
  for (var i = 0; i < data.length; i++) {
    const k = data[i].keyword;

    const template = document.getElementById("keyword_template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".keyword-box").querySelector(".keyword").innerHTML = k;
    clone.querySelector(".keyword-box").id = "green-" + k;
    clone.querySelector(".path-area").id = "white-" + k;

    clone.querySelector(".keyword-box").querySelector(".keyword").addEventListener("click", () => {
      const url = "https://www.google.com/search?q=" + k;
      chrome.tabs.create({ url: url });
    })

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
    };

    transaction.onerror = function (event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    transaction.oncomplete = function (event) {
      db.close();
    };

  };
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
    //2. getAll() 함수 성공 시, 화면에 출력
    request.onsuccess = function (event) {
      var data = event.target.result;
      //data에는 urlStore 객체 저장소의 모든 데이터가 배열 형태로 저장
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

// readDB() 함수 호출
readDB();
addEvent();
