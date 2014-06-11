var socket = io.connect();
var imageID = null
var userData = null

var mode = "RECTANGLE";
var imageObj = null;
var img = null;
var lastMouseDownX = null;
var lastMouseDownY = null;
var objectStack = [];
var eventStack = [];
var tmpRect = null;
var actionCounter = 0;
var currentObjectID = 0;
var globalBrightness = 0;
var users = ['0'];

function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

function getColor(index) {
 var oneTwenties = index % 3;
 var offsetIterations = Math.floor(index / 3);
 var offset = 0;
 var currentPartOffset = 60;

 if(offsetIterations > 0) {
   while(offsetIterations>0) {
      console.log("Iteration!")
     offset += currentPartOffset;
     currentPartOffset /= 2;
      offsetIterations -= 1;
   }
 }
 return hsvToRgb((oneTwenties*120 + offset) % 360 / 360, 1, 1);
}


var joinToRoom = function(imageID) {
  socket.emit("joinToRoom", imageID);
}


var prepareDataToSend = function(data) {
  data = $.extend({}, data, {
    "imageID":imageID,
    "userID": userData.id,
  })

  return {data: data, email:userData.email};
}

$('#chat-form').submit(function(){
    var msg = $('#message-to-send').val()
    var data = prepareDataToSend({"msg":msg});
    socket.emit('message', data);
    $('#messages').append($('<li class="alert alert-info">').text(msg));
    $(".chat-wrapper").scrollTop($(".chat-wrapper")[0].scrollHeight);
    $('#message-to-send').val('');
    return false;
});
$('#send-chat-form').click(function(){
    $('#chat-form').submit()
    return false;
});
socket.on('message-from-others', function(data){
    var email = data.email
    var msg = data.data.msg
    $('#messages').append($('<li class="alert alert-info">').text(msg.toString()));
    $(".chat-wrapper").scrollTop($(".chat-wrapper")[0].scrollHeight);
});


function getObjectByID(id) {
  for(var i = 0; i<objectStack.length; i++) {
    if(objectStack[i].hasOwnProperty('orderID')) {
      if(objectStack[i].orderID == id) {
        return objectStack[i];
      }
    }
  }
  return null;
}


function addSimpleCircle(x,y,l, objectID, userID) {
      var index = 0;
      if(users.indexOf(userID) == -1) {
        users.push(userID);
        index = users.length -1;
      } else {
        index = users.indexOf(userID);
      }
      var rgb = getColor(index);
      var circle = new Kinetic.Circle({
        x: x,
        y: y,
        radius: 5,
        fill: 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')',
        stroke: 'black',
        strokeWidth: 2,
        draggable: true
      });
      circle.orderID = objectID;
      circle.on('dragend', function() {
        actionCounter += 1; 
        var data = { mode: "update", x: circle.x(), y: circle.y(), objectID: circle.orderID };
        eventStack.push(data);
        data = prepareDataToSend(data);
        socket.emit('draw', data);

        //$.post( "server.php", data);
        $('#historyitems').append("<li>"+ data.mode + ", objID: " + data.objectID + "</li>");

        console.log("POST request sent with data: ");
        console.log(data);
      });
  l.add(circle);
  objectStack.push(circle);
  l.draw();

  $('#historyitems').append("<li>create, objID: " + objectID + "</li>");
}



function addSimpleTooltip(x,y,l, text, objectID, userID) {
      var index = 0;
      if(users.indexOf(userID) == -1) {
        users.push(userID);
        index = users.length -1;
      } else {
        index = users.indexOf(userID);
      }
      var rgb = getColor(index);

    var tooltip = new Kinetic.Label({
       x: x,
       y: y,
       opacity: 0.75
    });

    tooltip.add(new Kinetic.Tag({
        fill: 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')',
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: {x:10,y:20},
        shadowOpacity: 0.5
      }));
      
      tooltip.add(new Kinetic.Text({
        text: text,
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'white'
      }));
  tooltip.orderID = objectID;
  l.add(tooltip);
  objectStack.push(tooltip);
  l.draw();
  $('#historyitems').append("<li>create, objID: " + objectID + "</li>");
}


function addSimpleRectangle(x, y, width, height, layer, objectID, userID) {
  var index = 0;
      if(users.indexOf(userID) == -1) {
        users.push(userID);
        index = users.length -1;
      } else {
        index = users.indexOf(userID);
      }
      var rgb = getColor(index);

  var rect = new Kinetic.Rect({
    x: x,
    y: y,
    width: width, 
    height: height,
    fill: 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true,
    opacity: 0.4
  });
  rect.orderID = objectID;

  rect.on('dragend', function() {
    actionCounter +=1;
    var data = { mode: "update", x: rect.x(), y: rect.y(), objectID: rect.orderID};
    eventStack.push(data);
    //$.post( "server.php", data);
    data = prepareDataToSend(data);
    socket.emit('draw', data);
    $('#historyitems').append("<li>"+ data.mode + ", objID: " + data.objectID + "</li>");
    console.log("POST request sent with data: ");
    console.log(data);
  });
  layer.add(rect);
  objectStack.push(rect);
  layer.draw();
}

var performAction = function(obj) {
  if(obj.mode == "create") {
       if(obj.type == "circle") {
      actionCounter += 1;
      addSimpleCircle(obj.x, obj.y, layer, obj.objectID, obj.userID);
      currentObjectID = obj.objectID + 1;
    }  else if(obj.type == "tooltip") {
      actionCounter += 1;
      addSimpleTooltip(obj.x, obj.y, layer, obj.content, obj.objectID, obj.userID);
      currentObjectID = obj.objectID + 1;
    } else if(obj.type == "rectangle") {
      actionCounter += 1;
      addSimpleRectangle(obj.x, obj.y, obj.width, obj.height, layer, obj.objectID, obj.userID);
      currentObjectID = obj.objectID + 1;
    }
  } else if(obj.mode == "update") {
    actionCounter += 1;
    eventStack.push(obj);
    var o = getObjectByID(obj.objectID);
          o.x(obj.x);
          o.y(obj.y);

          layer.draw();
  } else if(obj.mode == "delete") {
    actionCounter += 1;
    eventStack.push(obj);
    var o = getObjectByID(obj.objectID);
    if(o != null) {
      o.remove();
            layer.draw();
    }
  }
}

//ACTION OF OTHER USERS
socket.on('draw', function(obj){ 
  var email = obj.email
  console.log(email)
  
  obj = obj.data  
  console.log(obj)
  performAction(obj)
  
});


var stage = new Kinetic.Stage({
	container: 'container',
	width: 1024,
	height: 768
});

var layer = new Kinetic.Layer();
var imageLayer = new Kinetic.Layer();

var rect = new Kinetic.Rect({
	x: 239,
	y: 75,
	width: 100, 
	height: 20,
	fill: 'green',
	stroke: 'black',
	strokeWidth: 4,
	draggable: true
});


function addCircle(x,y,l) {
      var rgb = getColor(0);
      var circle = new Kinetic.Circle({
        x: x,
        y: y,
        radius: 5,
        fill: 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')',
        stroke: 'black',
        strokeWidth: 2,
        draggable: true
      });
      circle.on('dragend', function() {
        actionCounter += 1; 
        var data = { mode: "update", x: circle.x(), y: circle.y(), objectID: circle.orderID };
        eventStack.push(data);
        dataToSend = prepareDataToSend(data);
        socket.emit('draw', dataToSend);

        //$.post( "server.php", data);
        $('#historyitems').append("<li>"+ data.data.mode + ", objID: " + data.data.objectID + "</li>");

        console.log("POST request sent with data: ");
        console.log(data.data);
      });
  circle.orderID = currentObjectID;
  currentObjectID += 1;
	l.add(circle);
  objectStack.push(circle);
  actionCounter += 1
	l.draw();

  var data = { type: "circle", mode: "create", x: x, y: y, objectID: circle.orderID};
  eventStack.push(data);
  data = prepareDataToSend(data);
  socket.emit('draw', data);
  //$.post( "server.php", data);
  
  $('#historyitems').append("<li>"+ data.data.mode + ", objID: " + data.data.objectID + "</li>");
  console.log("POST request sent with data: ");
  console.log(data.data);
}


function addTooltip(x,y,l, text) {
    var rgb = getColor(0);
    var tooltip = new Kinetic.Label({
       x: x,
       y: y,
       opacity: 0.75
    });

    tooltip.add(new Kinetic.Tag({
        fill: 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')',
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: {x:10,y:20},
        shadowOpacity: 0.5
      }));
      
      tooltip.add(new Kinetic.Text({
        text: text,
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'white'
      }));
  tooltip.orderID = currentObjectID;
  currentObjectID += 1;
	l.add(tooltip);
  objectStack.push(tooltip);
	l.draw();
  actionCounter += 1;
  var data = { type: "tooltip", mode: "create", content: text, x: x, y: y, objectID: tooltip.orderID };
  //$.post( "server.php", data);
  data = prepareDataToSend(data);
  socket.emit('draw', data);
  $('#historyitems').append("<li>"+ data.data.mode + ", objID: " + data.data.objectID + "</li>");
  eventStack.push(data.data);
  console.log("POST request sent with data: ");
  console.log(data.data);
}


function loadSampleImage() {
	imageObj = new Image();
    imageObj.onload = function() {
      img = new Kinetic.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: 1000,
        height: 500
      });
      //img.cache();
      img.filters([Kinetic.Filters.Brighten]); 
      imageLayer.add(img);
      imageLayer.draw();
    };
    //imageObj.src = 'sampleimage.jpg';
	//console.log($('#editor-panel .image-buffer img').attr('src'));
      imageObj.src = $('#editor-panel .image-buffer img').attr('src');
}

function loadImage() {
  imageObj = new Image();
  imageObj.onload = function() {
    img = new Kinetic.Image({
      x: 0,
      y: 0,
      image: imageObj,
      width: 1000,
      height: 500
    });
    //img.cache();
    img.filters([Kinetic.Filters.Brighten]); 
    imageLayer.add(img);
    imageLayer.draw();
  };

  imageID =$('#editor-panel .image-buffer')[0].getAttribute("data-id").toString()
  $.getJSON('/api/actions/' + imageID, function(data){
    if (data.status && data.status == "OK") {
      var actions = data.actions
      $.each( actions, function( key, val ) {
        if (val.userID == userData.id) {
          $('#historyitems').append("<li>"+ val.mode + ", objID: " + val.objectID + "</li>");
        }
        performAction(val)
      });

    }
  })
  joinToRoom(imageID)
  imageObj.src = $('#editor-panel .image-buffer img').attr('src');
 // console.log($('#editor-panel .image-buffer img').attr('src'));
}

function invertImage() {
  img.cache();
  img.filters([Kinetic.Filters.Invert, Kinetic.Filters.Brighten]);
  imageLayer.draw(); 
}

function grayscaleImage() {
  img.cache();
  img.filters([Kinetic.Filters.Grayscale, Kinetic.Filters.Brighten]);
  imageLayer.draw(); 
}

function brightenImage() {
  img.cache();
  img.filters([Kinetic.Filters.Grayscale, Kinetic.Filters.Brighten]);
  imageLayer.draw(); 
}


$('#container').on('click', function(e) {
	var posX = e.clientX - $(this).offset().left;
	var posY = e.clientY - $(this).offset().top;
	
	if(mode == "POINT")
		addCircle(posX, posY, layer);
	if(mode == "TEXT") {
    var text = prompt("Please enter your text", "");
    if(text != null)
		  addTooltip(posX, posY, layer, text);
  }

});

$(document).ready( function() {
	loadImage();
  userData = JSON.parse(sessionStorage.getItem('user'))
  $(".back-to-images-button").click(function(){
    socket.emit("leaveRoom", imageID)
  })
});



$('#container').on('mousedown', function(e) {
  if(mode != "RECTANGLE")
    return;
  lastMouseDownX = e.clientX - $(this).offset().left;
  lastMouseDownY = e.clientY - $(this).offset().top;
var rgb = getColor(0);
  var rect = new Kinetic.Rect({
    x: lastMouseDownX,
    y: lastMouseDownY,
    width: 1, 
    height: 1,
    fill: 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true,
    opacity: 0.4
  });

  rect.on('dragend', function() {
    actionCounter +=1;
    var data = { mode: "update", x: rect.x(), y: rect.y(), objectID: rect.orderID};
    eventStack.push(data);
    //$.post( "server.php", data);
    data = prepareDataToSend(data);
    socket.emit('draw', data);
    $('#historyitems').append("<li>"+ data.data.mode + ", objID: " + data.data.objectID + "</li>");
    console.log("POST request sent with data: ");
    console.log(data.data);
  });

  rect.orderID = currentObjectID;
  currentObjectID += 1;
  layer.add(rect);
  objectStack.push(rect);
  tmpRect = rect;
  layer.draw();

});

$('#container').on('mouseup', function(e) {
  if(mode == "RECTANGLE") {
    actionCounter += 1;
    var data = { type: "rectangle", mode: "create", width: tmpRect.width(), height: tmpRect.height(), x: tmpRect.x(), y: tmpRect.y(), objectID: tmpRect.orderID};
    eventStack.push(data);
    //$.post( "server.php", data);
    data = prepareDataToSend(data);
    socket.emit('draw', data);
    $('#historyitems').append("<li>"+ data.data.mode + ", objID: " + data.data.objectID + "</li>");
    console.log("POST request sent with data: ");
    console.log(data.data);
    tmpRect = null;
  }
});

$('#container').on('mousemove', function(e) {
  var posX = e.clientX - $(this).offset().left;
  var posY = e.clientY - $(this).offset().top;

  if(mode == "RECTANGLE" && tmpRect != null) {
    tmpRect.width(Math.abs(posX - lastMouseDownX));
    tmpRect.height(Math.abs(posY - lastMouseDownY));
    layer.draw();
  }
});


$('#rectangle').on('click', function(e) {
  $('#modes').children('button').each(function () {
    $(this).css('font-weight', 'normal');
  });
  $(this).css('font-weight', 'bolder');
	mode = "RECTANGLE";
});

$('#point').on('click', function(e) {
  $('#modes').children('button').each(function () {
    $(this).css('font-weight', 'normal');
  });
  $(this).css('font-weight', 'bolder');
	mode = "POINT";
});

$('#text').on('click', function(e) {
  $('#modes').children('button').each(function () {
    $(this).css('font-weight', 'normal');
  });
  $(this).css('font-weight', 'bolder');
	mode = "TEXT";
});

$('#none').on('click', function(e) {
  $('#modes').children('button').each(function () {
    $(this).css('font-weight', 'normal');
  });
  $(this).css('font-weight', 'bolder');
  mode = "NONE";
});

$('#loadImage').on('click', function(e) {
	loadSampleImage();	
});

$('#invertFilter').on('click', function(e) {
  invertImage();  
});

$('#grayscaleFilter').on('click', function(e) {
  grayscaleImage();  
});

$('#brightenFilterUP').on('click', function(e) {
  img.cache();
  globalBrightness += 0.1;
  img.brightness(globalBrightness);
  imageLayer.batchDraw();    
});


$('#brightenFilterDOWN').on('click', function(e) {
  img.cache();
  globalBrightness -= 0.1;
  img.brightness(globalBrightness);
  imageLayer.batchDraw();    
});


$('#download').on('click', function(e) {
  /*var canvasData = stage.toDataURL("image/jpeg");
  var ajax = new XMLHttpRequest();
  ajax.open("POST","/api/images/" + imageID + "/download",false);
  ajax.setRequestHeader('Content-Type', 'application/upload');
  ajax.send(canvasData);
  */

  stage.toDataURL({
    mimeType: "image/jpeg",
    quality: 1.0,
    callback: function(dataUrl) {
      var formData = new FormData(); 
      formData.append('images', dataUrl);
      console.log("start")
      $.ajax({
        type: "POST",
        url: '/api/images/' + imageID + '/download',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
          if (data.status == "OK") {
            data = JSON.parse(sessionStorage.getItem('user'));
            window.location = "/api/images/" + imageID+ "/download?token=" + data.token
          }
        }
      });

      //window.open(dataUrl);
    }
  });
});

$('#undo').on('click', function(e) {
  var lastEvent = eventStack.pop();
  
  if(lastEvent != null) {
    if(lastEvent.mode == "create") {
      var item = objectStack.pop();
      if(item != null) {
        actionCounter +=1;
        var data = { mode: "delete", objectID: item.orderID};
        //$.post( "server.php", data);
        data = prepareDataToSend(data);
        socket.emit('draw', data);
        $('#historyitems').append("<li>"+ data.data.mode + ", objID: " + data.data.objectID + "</li>");
        console.log("POST request sent with data: ");
        console.log(data.data);
        item.remove();
        layer.draw();
      }    
    } 
    else if(lastEvent.mode == "update") {
      actionCounter += 1;
      var id = lastEvent.objectID;
      for(var i = eventStack.length -1; i >= 0; i--) {
        if((eventStack[i].mode == "create" || eventStack[i].mode == "update") && eventStack[i].objectID == id) {
          var obj = getObjectByID(id);
          obj.x(eventStack[i].x);
          obj.y(eventStack[i].y);

          layer.draw();
          actionCounter +=1;
          
          $('#historyitems').append("<li>"+ data.mode + ", objID: " + data.objectID + "</li>");
          var data = { mode: "update", x: obj.x(), y: obj.y(), objectID: obj.orderID};
          //$.post( "server.php", data);
          data = prepareDataToSend(data);
          socket.emit('draw', data);
          break;
        }
      }
    }
  }
});

rect.on('mouseover', function() {
document.body.style.cursor = 'pointer';
});
rect.on('mouseout', function() {
document.body.style.cursor = 'default';
});

stage.add(imageLayer);
stage.add(layer);
