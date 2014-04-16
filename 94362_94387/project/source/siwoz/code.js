var mode = "RECTANGLE";

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

function addBox(x,y,l) {
	var rect = new Kinetic.Rect({
		x: x,
		y: y,
		width: 100, 
		height: 20,
		fill: 'green',
		stroke: 'black',
		strokeWidth: 4,
		draggable: true
	});
	l.add(rect);
	l.draw();
}

function addCircle(x,y,l) {
      var circle = new Kinetic.Circle({
        x: x,
        y: y,
        radius: 5,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 2
      });
	l.add(circle);
	l.draw();
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
	l.draw();
}


function loadSampleImage() {
	var imageObj = new Image();
      imageObj.onload = function() {
        var img = new Kinetic.Image({
          x: 0,
          y: 0,
          image: imageObj,
          width: 1000,
          height: 500
        });
        imageLayer.add(img);
        imageLayer.draw();
      };
      imageObj.src = 'sampleimage.jpg';
}


$('#container').on('click', function(e) {
	var posX = e.clientX - $(this).offset().left;
	var posY = e.clientY - $(this).offset().top;
	
	if(mode == "RECTANGLE")
		addBox(posX, posY, layer);
	if(mode == "POINT")
		addCircle(posX, posY, layer);
	if(mode == "TEXT")
		addTooltip(posX, posY, layer, "Idzie grzes przez wies");

});

$('#rectangle').on('click', function(e) {
	mode = "RECTANGLE";
});

$('#point').on('click', function(e) {
	mode = "POINT";
});

$('#text').on('click', function(e) {
	mode = "TEXT";
});

$('#loadImage').on('click', function(e) {
	loadSampleImage();	
});



rect.on('mouseover', function() {
document.body.style.cursor = 'pointer';
});
rect.on('mouseout', function() {
document.body.style.cursor = 'default';
});

layer.add(rect);
stage.add(imageLayer);
stage.add(layer);