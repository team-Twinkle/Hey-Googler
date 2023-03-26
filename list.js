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

function dirEdit(){
}

function dirDel(){

}

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