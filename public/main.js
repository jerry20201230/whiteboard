


//'use strict';
  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  //var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');

  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);
/*
  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }*/

  

  socket.on('drawing', onDrawingEvent);
  socket.on('getData',(data)=>{

    var err = false
    for(let i=0;i<data.x1.length;i++){
  
      var w = canvas.width;
      var h = canvas.height;
      if(data.action[i] == "line"){

      drawLine(data.x0[i] * w, data.y0[i] * h, data.x1[i] * w, data.y1[i] * h, data.color[i]);
    }else{
      $("#whiteboard-loading").html(`        
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" class="text-danger bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
    </svg>
    <p></p>
  <span class=text-danger >同步資料失敗</span>
  <p></p>
  <span class=text-danger>錯誤碼:Unknow action: ${data.action[i]} (at data-action :${i}:1)</span>
  <p></p><span class=text-primary>建議作法:<br>
  <ul>
 
  <li>畫布資訊可能有誤，請重新同步或建立新畫布</li>
  
  </ul>
  <p></p>
  <button class="btn btn-primary" onclick="socket.emit('getData','p');reload_ui()">重新同步</button>
  </span>`)
  err = true
  $("#infoText").text("發生錯誤")
  break;
    }
  }
  if(!err){
    $("#infoText").text("就緒")
   
    $("#whiteboard-loading").hide()
 $(".whiteboard").show()
  }else{
    $("#infoText").text("發生錯誤")
    
  }
  })

  window.addEventListener('resize', onResize, false);
  onResize();




  function reload_ui(){
    $("#whiteboard-loading").html(`        <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">正在同步資料...</span>
  </div>
  <p></p>
<span>正在同步資料...</span>`)
    $("#whiteboard-loading").show()
    $(".whiteboard").hide()

    $("#infoText").text("正在同步...")
  }



  function drawLine(x0, y0, x1, y1, color, emit){
    context.lineJoin = 'round';  // 兩條線交匯處產生 "圓形" 邊角
    context.lineCap = 'round';  // 筆觸預設為 "圓形"    
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x0, y0);

    context.stroke();
    context.lineTo(x1, y1);


    context.stroke();
  //  context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

   /*/ socket.emit('drawing', {
      x0: x0 / w ,
      y0: y0 / h ,
      x1: x1 / w ,
      y1: y1 / h ,
      color: color,
      action:"line"
    });/*/

    socket.emit('drawing', {
      x0: x0 / w ,
      y0: y0 / h ,
      x1: x1 / w ,
      y1: y1 / h ,
      color: color,
      action:"line"
    })
}

/*
    //alert("err!")
   /* $("#whiteboard-loading").html(`        
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" class="text-danger bi bi-x-circle-fill" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
  </svg>
  <p></p>
<span class=text-danger >同步資料失敗</span>
<p></p>
<span class=text-danger>錯誤碼:${err}</span>
<p></p><span class=text-primary>建議作法:<br>
<ul>
<li>伺服器可能暫時忙碌中，請稍等</li>
<li>檢查網路狀態/重新同步</li>

</ul>
<p></p>
<button class="btn btn-primary" onclick="socket.emit('getData','p');reload_ui()">重新同步</button>
</span>`)
$(".whiteboard").hide()
$("#whiteboard-loading").show()
$("#infoText").text("發生錯誤")*/


 

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
  }

  function onMouseMove(e){
    if (!drawing) { return; }

    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

$("#color-picker").on("blur",function(){
  current.color = $("#color-picker").val()
})
  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  function onResize() {
    canvas.width = window.innerWidth -50;
    canvas.height = window.innerHeight -150;
    $("#whiteboard-loading").css("width",window.innerWidth -50)
    $("#whiteboard-loading").css("height",window.innerHeight -150)
    $("#whiteboard-loading").html(`        <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">正在同步資料...</span>
  </div>
  <p></p>
<span>正在同步資料...</span>`)
    $("#whiteboard-loading").show()
    $(".whiteboard").hide()
    socket.emit('getData','p') 
  $("#infoText").text("正在同步...")
  }


  
window.onblur = function () { 
  if(socket.connected){
  $("#browser-icon").attr('href',"/icon/icon-black.png")
  }
}

window.onfocus = function () { 
  if(socket.connected){
  $("#browser-icon").attr('href',"/icon/icon-white.png")
   } }

   window.onload = function () {
    socket.emit('getData','p')
    $("#whiteboard-loading").show()
    $("#infoText").text("正在同步...")
   }





function anysc_delay(n) {
  return new Promise(function (resolve) {
    setTimeout(resolve, n * 1000);
  });
}

async function delay(n,callback) {
  await anysc_delay(n);
  eval(callback)
}