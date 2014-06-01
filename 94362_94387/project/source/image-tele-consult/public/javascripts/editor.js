var mode = "RECTANGLE";
var imageObj = null;
var img = null;
var lastMouseDownX = null;
var lastMouseDownY = null;
var actionStack = [];
var tmpRect = null;
var actionCounter = 0;
var globalBrightness = 0;


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

function addBox(x,y,w,h,l) {
	var rect = new Kinetic.Rect({
		x: x,
		y: y,
		width: w, 
		height: h,
		fill: 'green',
		stroke: 'black',
		strokeWidth: 4,
		draggable: true
	});
	l.add(rect);
  actionStack.push(rect);
	l.draw();
}

function addCircle(x,y,l) {
      var circle = new Kinetic.Circle({
        x: x,
        y: y,
        radius: 5,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 2,
        draggable: true
      });
      circle.on('dragend', function() {
        var data = { mode: "update", x: circle.x(), y: circle.y(), id: actionCounter};
        //$.post( "server.php", data);
        console.log("POST request sent with data: ");
        console.log(data);
      });
	l.add(circle);
  actionStack.push(circle);
  actionCounter += 1
	l.draw();

  var data = { type: "circle", mode: "create", radius: 5, x: x, y: y, id: actionCounter};
  //$.post( "server.php", data);
  console.log("POST request sent with data: ");
  console.log(data);
}

function addTooltip(x,y,l, text) {
    var tooltip = new Kinetic.Label({
       x: x,
       y: y,
       opacity: 0.75
    });

    tooltip.add(new Kinetic.Tag({
        fill: 'red',
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
	l.add(tooltip);
  actionStack.push(tooltip);
	l.draw();
  actionStack += 1;
  var data = { type: "tooltip", mode: "create", text: text, x: x, y: y, id: actionCounter};
  //$.post( "server.php", data);
  console.log("POST request sent with data: ");
  console.log(data);
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
      imageObj.src = 'sampleimage.jpg';
}

function invertImage() {
  img.cache();
  img.filters([Kinetic.Filters.Invert]);
  imageLayer.draw(); 
}

function grayscaleImage() {
  img.cache();
  img.filters([Kinetic.Filters.Grayscale]);
  imageLayer.draw(); 
}

function brightenImage() {
  img.cache();
  img.filters([Kinetic.Filters.Grayscale]);
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

$('#container').on('mousedown', function(e) {
  if(mode != "RECTANGLE")
    return;
  lastMouseDownX = e.clientX - $(this).offset().left;
  lastMouseDownY = e.clientY - $(this).offset().top;

  var rect = new Kinetic.Rect({
    x: lastMouseDownX,
    y: lastMouseDownY,
    width: 1, 
    height: 1,
    fill: 'green',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true
  });

  rect.on('dragend', function() {
    var data = { mode: "update", x: rect.x(), y: rect.y(), id: actionCounter};
    //$.post( "server.php", data);
    console.log("POST request sent with data: ");
    console.log(data);
  });

  layer.add(rect);
  actionStack.push(rect);
  tmpRect = rect;
  layer.draw();

});

$('#container').on('mouseup', function(e) {
  if(mode == "RECTANGLE") {
    actionCounter += 1;
    var data = { type: "rectangle", mode: "create", width: tmpRect.width(), height: tmpRect.height(), x: tmpRect.x(), y: tmpRect.y(), id: actionCounter};
    //$.post( "server.php", data);
    console.log("POST request sent with data: ");
    console.log(data);
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

$('#undo').on('click', function(e) {
  var item = actionStack.pop();
  if(item != null) {
    var data = { mode: "delete",  id: actionCounter};
    actionCounter -= 1;
    //$.post( "server.php", data);
    console.log("POST request sent with data: ");
    console.log(data);
    item.remove();
    layer.draw();
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