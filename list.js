let nowDirId;

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/list.html") {
    initListPage();

  } else if (window.location.pathname === "/dirList.html") {
    readDBAndDisplay();
    document.getElementById("dirAddButton").addEventListener("click", () => { dirAddButtonClick(); });

    defaultDirSet();

  }
});

function dirAddButtonClick() {
  var dir = document.getElementById("dir_template");
  var copy = dir.content.cloneNode(true);

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

  const data = [{ dir_name: '새 폴더' }];
  writeDB(data, 'dirStore', function (d_id) {
    copy.querySelector(".dir-list").id = d_id;

    const dir_id = d_id;
    const dirName = '새 폴더';
    console.log('href생성 전');
    console.log(dir_id, dirName);

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
        editDB("dirStore", "dir_name", parseInt(dir_id), newDirName, true);
      }
      else {
        alert("내용을 입력해주세요");
      }
    }
  })

  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const newDirName = inputElement.value.trim();
      if (newDirName !== "") {

        editDB("dirStore", "dir_name", parseInt(dir_id), newDirName, true);

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
      if (parseInt(result) == d_id) {
        console.log("dirCannotDeleteModal 보여주기");
        const dirCannotDeleteModal = document.getElementById("dirCannotDeleteModal");
        dirCannotDeleteModal.style.display = "flex";
        const dirCannotDeletecloseBtn = dirCannotDeleteModal.querySelector(".closeBtn");
        dirCannotDeletecloseBtn.addEventListener("click", e => {
          dirCannotDeleteModal.style.display = "none";
        })
      }
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


async function initListPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const dirNameElement = document.querySelector("#dir-title");
  const dirBox = document.querySelector(".dir");

  var userHistoryData = await readDBbyStoreName('userHistoryStore');

  var dirId = urlParams.get("dir_id");
  var dirName;
  var dirData;

  if (dirId != null) {
    dirData = await readDBbyStoreNameAndId('dirStore', parseInt(dirId));
  } else {
    try {
      dirId = userHistoryData[0]['recentlyExecutedDir'];
      dirData = await readDBbyStoreNameAndId('dirStore', parseInt(dirId));

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

  var dirTitleBox = document.getElementById('dir-title-box');
  dirTitleBox.addEventListener("click", () => {
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = dirNameElement.textContent;
    inputElement.classList.add("input-dir", "editing");

    dirTitleBox.replaceChild(inputElement, dirNameElement);

    inputElement.focus();
    inputElement.select();

    dirTitleBox.classList.add("editing");

    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const newDirName = inputElement.value.trim();
        if (newDirName !== "") {
          editDB("dirStore", "dir_name", parseInt(dirId), newDirName);
          location.reload();
        } else {
          alert("내용을 입력해주세요");
        }
      }
    });

  });

  nowDirId = dirId;
  editUserHistoryRecentlyVisitedDB('userHistoryStore', 1, nowDirId);

  var nowExecutedDir = userHistoryData[0]['nowExecutedDir'];
  if (dirId == nowExecutedDir) {
    dirBox.style.backgroundColor = '#DFF5E5';
  }

  addEvent();

  window.scrollTo(0, dirData.scroll);

  let scrollHeight;

  let topButton = document.querySelector('#button-top');

  addEventListener('scroll', (event) => {
    scrollHeight = window.scrollY || document.documentElement.scrollTop;
    console.log(`scroll 위치 : ${scrollHeight}`);
    editDB("dirStore", "scroll", parseInt(nowDirId), scrollHeight, false);

    if (scrollHeight != 0) {
      topButton.style.opacity = "100";
    } else {
      topButton.style.opacity = "0";

    }

  });

  topButton.addEventListener('click', (event) => {
    window.scrollTo(0, 0);
  });

}

function startBtnEvent() {
  let modal = document.getElementById("startModal");
  let content = document.getElementById("startModalContent");
  let dirBox = document.getElementById("dir-title");
  let dirName = dirBox.textContent;
  content.innerHTML = "<b>[" + dirName + "]</b> <br>폴더에 검색 기록이 저장됩니다.";
  modal.classList.replace("hidden", "clicked");
  setTimeout(() => { modal.classList.replace("clicked", "hidden"); }, 5000);
}

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
        resolve(data);
      };

      requestGetAll.onerror = function (event) {
        reject(new Error("데이터 읽기 실패"));
      };
    };
  });
}

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
        resolve(data);
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

stopButton.addEventListener("mousedown", () => {
  stopButton.src = "images/icon_stop_true.svg";
});
stopButton.addEventListener("mouseup", () => {
  stopButton.src = "images/icon_stop.svg";
});

reloadButton.addEventListener("click", () => {
  location.reload();
  console.log("reloaded");
});

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

startButton.addEventListener("click", () => {
  startButton.src = "images/icon_start_true.svg";
  chrome.runtime.sendMessage({ onDirId: nowDirId, txt: "Start the extension from list.js" });
  editUserHistoryNowDirDB('userHistoryStore', 1, nowDirId);
  editUserHistoryRecentlyExecutedDirDB('userHistoryStore', 1, nowDirId);
  document.querySelector('.dir').style.backgroundColor = '#DFF5E5';
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message == "Auto Synchronization message") location.reload();
});


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
        callback(event.target.result);
      };
    }
  };
}

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

    var requestId = objectStore.get(parseInt(id));

    requestId.onerror = function (event) { console.log("requestId error"); }

    requestId.onsuccess = function (event) {
      var data = event.target.result;
      data.dir_name = name;

      var requestUpdate = objectStore.put(data);
      requestUpdate.onerror = function (event) { console.log("requestUpdate error"); }
      requestUpdate.onsuccess = function (event) { location.reload(); }
    }

  };
}

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

    var requestDel = objectStore.delete(parseInt(id));

    requestDel.onerror = function (event) { console.log("requestId error"); }

    requestDel.onsuccess = function (event) {
      console.log("dir 삭제 성공");
    }

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
      if (isPushed) {

        editDB("keywordStore", "isToggled", parseInt(id), false, false);
        toggleButton.classList.add("toggleShown");
        toggleButton.classList.remove("toggleHidden");

        pathArea.style.maxHeight = '100vh'
        pathArea.style.opacity = '1';
      } else {
        editDB("keywordStore", "isToggled", parseInt(id), true, false);
        toggleButton.classList.add("toggleHidden");
        toggleButton.classList.remove("toggleShown");

        pathArea.style.maxHeight = '0';
      }
      isPushed = !isPushed;
    })
  }
}


function displayURL(data) {

  const container = document.getElementById('dataContainer');

  for (var i = 0; i < data.length; i++) {
    const key = data[i][0];
    const k = data[i][1];
    const t = data[i][2];
    const p = data[i][3];
    const m = data[i][4];

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

    var deleteBtn = clone.querySelector('.white-menu1');
    deleteBtn.setAttribute('key', key);


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
        .then(result => {
          inputMemo.setAttribute('value', result);
        })
        .catch(error => {
          console.log("메모 디폴트값 불러오기 에러" + error);
        });
    })
    const closeBtn = modal.querySelector(".closeBtn")
    closeBtn.addEventListener("click", e => {
      modal.style.display = "none";
    })

    const memoSaveBtn = modal.querySelector(".saveBtn")
    memoSaveBtn.addEventListener("click", e => {
      let userInputMemo = inputMemo.value;
      editDB("urlStore", "memo", parseInt(memoFlag), userInputMemo, true);
      modal.style.display = "none"

    })

    inputMemo.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        let userInputMemo = inputMemo.value;
        editDB("urlStore", "memo", parseInt(memoFlag), userInputMemo, true, true);
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
      editFlag = e.target.getAttribute("key");
      readValueDB('urlStore', 'title', parseInt(editFlag))
        .then(result => {
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
        editDB("urlStore", "title", parseInt(editFlag), userInputTitle, true);
        editmodal.style.display = "none"
      }

    })

    inputTitle.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        let userInputTitle = inputTitle.value;
        if (!!userInputTitle.trim()) {
          editDB("urlStore", "title", parseInt(editFlag), userInputTitle, true);
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


async function defaultDirSet() {
  console.log('디폴트 디비 함수 실행됨');
  try {
    var dirData = await readDBbyStoreName('dirStore');
    if (dirData.length < 1) {

      dirAddButtonClick();

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

  const container = document.getElementById('dataContainer');
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

    if (toggleStatus) {
      toggleButton.classList.remove("toggleShown");
      toggleButton.classList.add("toggleHidden");
      clone.querySelector(".path-area").style.maxHeight = '0';
    }
    if (!toggleStatus) {
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


      let winWidth = 350;
      let posX = e.pageX;
      let posY = e.pageY;
      let menuWidth = 100;

      let secMargin = 10;

      if (posX + menuWidth + secMargin >= winWidth) {
        posLeft = posX - menuWidth - secMargin + "px";
        posTop = posY + secMargin + "px";
      }
      else {
        posLeft = posX + secMargin + "px";
        posTop = posY + secMargin + "px";
      };

      contextMenu.style.display = 'block';
      contextMenu.style.left = posLeft;
      contextMenu.style.top = posTop;

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


function readDB() {

  return new Promise((resolve, reject) => {
    var request = indexedDB.open("HeyGoogler", 1);

    request.onerror = function (event) {
      console.log("IndexedDB 데이터베이스를 열 수 없습니다.");
    };

    request.onsuccess = function (event) {
      const db = event.target.result;

      let transaction = db.transaction([keyStore], 'readonly');
      let objectStore = transaction.objectStore(keyStore);
      let dirId = parseInt(nowDirId);
      let dirFilterKeyword = [];
      let greenIndex = objectStore.index("dir_id");
      let greenKeyRange = IDBKeyRange.only(dirId);

      greenIndex.openCursor(greenKeyRange).onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
          dirFilterKeyword.push([cursor.value.id, cursor.value.keyword, cursor.value.isToggled]);
          cursor.continue();
        } else {
          displayKeyword(dirFilterKeyword);
        }
      }
      transaction.onerror = function (event) {
        console.log("트랜잭션 오류:", event.target.error);
      };

      transaction.oncomplete = function (event) {
        db.close();
      };

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


function addEvent() {
  readDB().then(() => {

    var request = indexedDB.open("HeyGoogler", 1);
    let dirId = parseInt(nowDirId);

    request.onerror = function (event) {
      console.log("IndexedDB 데이터베이스를 열 수 없습니다.");
    };

    request.onsuccess = function (event) {
      const db = event.target.result;

      let transaction = db.transaction([keyStore, urlStore], 'readwrite');
      let kStore = transaction.objectStore(keyStore);
      let uStore = transaction.objectStore(urlStore);


      requestKey = kStore.getAll();

      requestKey.onsuccess = function (event) {
        let keyData = event.target.result;


        for (var i = 0; i < keyData.length; i++) {
          let dirId = keyData[i].dir_id;
          let keyword = keyData[i].keyword;
          let id = keyData[i].id;

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

    editButton.addEventListener("click", function () {
      setupDirEditEvent(this);
    });

    deleteButton.addEventListener("click", function () {
      setupDirDeleteEvent(this);
    });

    const extensionURL = chrome.runtime.getURL(`list.html?dir_id=${item.d_id}&dirname=${encodeURIComponent(item.dir_name)}`);
    dirLink.href = extensionURL;

    container.appendChild(copy);
  });
}


function deleteDB(obs, key) {
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  request.onsuccess = (e) => {

    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);

    const objStoreRequest = objStore.delete(key);
    objStoreRequest.onsuccess = (e) => {
      console.log('deleted ' + key);
      transaction.commit();
      location.reload();
    }
  }
}



function deleteDB2(key) {
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  request.onsuccess = (e) => {
    var open_Obs = 'keywordStore'
    const db = request.result;
    const transaction = db.transaction([open_Obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([open_Obs]);
    const objStoreRequest = objStore.delete(key);
    objStoreRequest.onsuccess = (e) => {
      console.log('deleted ' + key);
      transaction.commit();
    }
  }
}
function editDB(obs, field, key, value, reload) {
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      let data = event.target.result;
      data[field] = value;
      let updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => {
        console.log('update success');
        if (reload) {
          location.reload();
        }

      }
    }

  }
}

function readValueDB(obs, field, key) {
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
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      var data = event.target.result;
      data.nowExecutedDir = value;
      var updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => console.log('update success');
    }
  }
}

function editUserHistoryRecentlyExecutedDirDB(obs, key, value) {
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
    const objStoreRequest = objStore.get(key);
    objStoreRequest.onsuccess = function (event) {
      var data = event.target.result;
      data.recentlyExecutedDir = value;
      var updateRequest = objStore.put(data);
      updateRequest.onerror = (e) => console.log('update error');
      updateRequest.onsuccess = (e) => console.log('update success');
    }
  }
}

function editUserHistoryRecentlyVisitedDB(obs, key, value) {
  var request = indexedDB.open("HeyGoogler", 1);
  request.onerror = (e) => console.log(e.target.errorCode);
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction([obs], 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');
    const objStore = transaction.objectStore([obs]);
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

function handleClick(event) {
  var keyValue = event.target.getAttribute("key");
  deleteDB(parseInt(keyValue));
}