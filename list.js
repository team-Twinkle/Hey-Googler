//전역 변수
var running = false;

// 버튼/이미지 클릭 이벤트

//키워드 토글
function keywordToggleClick() {
  //var toggle = document.getElementsByClassName("toggle_keyword");
  //class로 통채로 받아..? 그럼 전부 지정인가??
}

// start,stop버튼 누르면 동작되는 자세한 코드들은 background.js 인가?
//그 떄는 html 함수 여러개 걸기
//처음 디폴트는 정지도 눌려있는 상태여야 하는 건가?
//마우스 오버시 마우스 모양 바뀌는 것도 필요한가?
//start & stop button


//dir추가 버튼
//디자인이나 방식 피드백
//prompt창은 디자인이 안 예뻐 .. 제이쿼리
//input방식?
//click -> text edit 창 -> ok -> add dir
//dir이름 수정하기 기능은??
function addDirButtonClick() {}


/********************************************************************************************************* */

var folderButton = document.getElementById("button-folder");
var startButton = document.getElementById("button-start");
var stopButton = document.getElementById("button-stop"); 


//tooltip
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