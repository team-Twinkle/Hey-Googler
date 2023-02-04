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
function runningButtonClick(button) {
  var start = document.getElementById("button-start");
  var stop = document.getElementById("button-stop");

  if (running == false && button == "start") {
    start.src = "./images/icon_start_true.svg";
    stop.src = "./images/icon_stop.svg";
    running = true;
  } else if (running == true && button == "stop") {
    stop.src = "./images/icon_stop_true.svg";
    start.src = "./images/icon_start.svg";
    running = false;
  }
}

//dir추가 버튼
//디자인이나 방식 피드백
//prompt창은 디자인이 안 예뻐 .. 제이쿼리
//input방식?
//click -> text edit 창 -> ok -> add dir
//dir이름 수정하기 기능은??
function addDirButtonClick() {}
