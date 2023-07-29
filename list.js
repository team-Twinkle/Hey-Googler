//키워드 토글
function keywordToggleClick() {
  //var toggle = document.getElementsByClassName("toggle_keyword");
  //class로 통채로 받아..? 그럼 전부 지정인가??
}

//dir추가 버튼
//디자인이나 방식 피드백
//prompt창은 디자인이 안 예뻐 .. 제이쿼리
//input방식?
//click -> text edit 창 -> ok -> add dir
//dir이름 수정하기 기능은??
function addDirButtonClick() {}

//dir-name 에 title 부여 
document.getElementById("dir-name").title=document.getElementById("dir-name").innerHTML;

/********************************************************************************************************* */

var reloadButton = document.getElementById("button-reload");
var folderButton = document.getElementById("button-folder");
var startButton = document.getElementById("button-start");
var stopButton = document.getElementById("button-stop"); 

chrome.action.getBadgeText({},(txt)=>{
  if(txt=="ON"){
    startButton.src="images/icon_start_true.svg";
  }
  else{
    startButton.src="images/icon_start.svg";
  }
})

//stopButton 눌림 action
stopButton.addEventListener("mousedown",()=>{
  stopButton.src="images/icon_stop_true.svg";
})
stopButton.addEventListener("mouseup",()=>{
  stopButton.src="images/icon_stop.svg";
})

//reload
reloadButton.addEventListener("click",()=>{
  location.reload();
  console.log("reloaded");
});

//tooltip
reloadButton.addEventListener("mouseover",()=>{
  document.getElementById("tooltip-reload").style.display="block";
});
reloadButton.addEventListener("mouseout",()=>{
  document.getElementById("tooltip-reload").style.display="none";
})
folderButton.addEventListener("mouseover",()=>{
  document.getElementById("tooltip-folder").style.display="block";
});
folderButton.addEventListener("mouseout",()=>{
  document.getElementById("tooltip-folder").style.display="none";
})
startButton.addEventListener("mouseover",()=>{
  document.getElementById("tooltip-start").style.display="block";
});
startButton.addEventListener("mouseout",()=>{
  document.getElementById("tooltip-start").style.display="none";
})
stopButton.addEventListener("mouseover",()=>{
  document.getElementById("tooltip-stop").style.display="block";
});
stopButton.addEventListener("mouseout",()=>{
  document.getElementById("tooltip-stop").style.display="none";
})


//send message to background.js when the start/stop button clicked
startButton.addEventListener("click",()=>{
  startButton.src="images/icon_start_true.svg";
  chrome.runtime.sendMessage("Start the extension from list.js");
});

stopButton.addEventListener("click",()=>{
  startButton.src="images/icon_start.svg";
  chrome.runtime.sendMessage("Stop the extension from list.js");
});

chrome.action.onClicked.addListener(()=>{
  chrome.action.getBadgeText({},(txt)=>{
    if(txt=="ON"){
      startButton.src="images/icon_start_true.svg";
    }
    else{
      startButton.src="images/icon_start.svg";
    }
  })
})


/********************************************************************************************************* */

//열려있는 객체 저장소 정보를 open_Obs 변수로 전달
var open_Obs = 'urlStore';

// 데이터를 화면에 출력하는 함수
function displayData(data) {
  //컨텐츠 들어갈 위치
  var container = document.getElementById('dataContainer');
  container.innerHTML = ''; 

  // 데이터를 텍스트로 변환하여 화면에 추가
  for (var i = 0; i < data.length; i++) {
    var k = JSON.stringify(data[i].keyword);
    var t = JSON.stringify(data[i].title);
    var p = JSON.stringify(data[i].url);

    var template = document.getElementById("keyword_template");
    var path_template = document.querySelector(".path_template");
    var clone = template.content.cloneNode(true);
    var path_clone = path_template.cloneNode(true);
/*
    clone.querySelector(".keyword").innerHTML = k;
    path_clone.querySelector(".title").innerHTML = t;
    path_clone.querySelector(".path").innerHTML = p;
    */
    container.appendChild(clone);
    container.appendChild(path_clone);

    /*
    var item = document.createElement('p');
    item.textContent = "keyword: " + JSON.stringify(data[i].keyword) +
    ", url: " + JSON.stringify(data[i].url) +
    ", title: " + JSON.stringify(data[i].title);
    container.appendChild(item);*/
  }
}

//혜교가 쓴 코드 참고해서 DB 읽는 함수 다시..
function readDB() {
  var request = indexedDB.open("HeyGoogler", 1);

  request.onerror = function(event) {
    console.log("IndexedDB 데이터베이스를 열 수 없습니다.");
  };

  //1. open() 함수 성공 시 저장소 객체를 불러와서 request에 저장
  request.onsuccess = function(event) {
    var db = event.target.result;
    var transaction = db.transaction([open_Obs], 'readonly');
    var objectStore = transaction.objectStore('urlStore');
    var request = objectStore.getAll();
    //2. getAll() 함수 성공 시, 화면에 출력
    request.onsuccess = function(event) {
      var data = event.target.result;
      //data에는 urlStore 객체 저장소의 모든 데이터가 배열 형태로 저장
      displayData(data); 
    };

    transaction.onerror = function(event) {
      console.log("트랜잭션 오류:", event.target.error);
    };

    transaction.oncomplete = function(event) {
      db.close();
    };
  };
}

// readDB() 함수 호출
readDB();

