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
