$(function() {
  var words = {};
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  
  canvas.width = 800;
  canvas.height = 800;
  
  var max_font = 48;
  var max_width = 120;
  
  // var area = new binpacking.Rect(300,300,550,550);
  var area = new binpacking.Rect(400,400,canvas.width,canvas.height);
  
  var pttn = /([!-\/:-@\[-^`{-~].,+><)|\s+/g;
  
  // streams the new text to the div. plain caption rendering of cspan.
  var socket = io();
  socket.on('word', function (data) {
    // $("#stream").append(data.data.body + " ");
    
    var word = data.data.body;
    word = word.replace(pttn, (m, g) => g);
    
    if (word != '') {
      words[word] = words[word] + 1 || 1;
    }
    
    if (Object.keys(words).length % 20 == 0 && Object.keys(words).length >= 40) {
      console.log(Object.keys(words).length);
      // do a vis thing?
      var rects = [];
      for (var entry of Object.entries(words)) {
        var w = entry[0];
        var pop = entry[1];
        
        var fontsize = pop > 1 ? 12 + Math.floor(Math.pow((Object.keys(words).length-pop)/Object.keys(words).length, 4)*max_font) : 12;
        context.font = fontsize + "px Arial";
        context.textAlign = "center";
        var wordwidth = context.measureText(w).width;
        var rect = new binpacking.Rect(Math.random() * canvas.width,Math.random() * canvas.width,wordwidth+5,fontsize+5);
        rect.addProperty("fontsize", fontsize);
        rect.addProperty("text", w);
        rects.push(rect);
      }
      
      area.draw(context);
      for (var i = 0; i < rects.length; i++) {
        rects[i].draw(context);
      }
      
      // Fade all the previous drawings to show that they are just the initial positions
		context.globalAlpha = .9;
		context.fillStyle = "#fff";
		context.fillRect(0,0,canvas.width, canvas.height);

		var placedRects = binpacking.pack(area, rects, 1);

		// Draw the rects in their final position
		context.globalAlpha = 1;
		for (var i = 0; i < placedRects.length;i++){
			placedRects[i].draw(context);
		}

		// Draw the text into each rect
		context.fillStyle = "#000";
		for (var i = 0;i < placedRects.length;i++){
			var fontsize = placedRects[i].getProperty("fontsize");
			context.font = fontsize + "px Arial";
			context.fillText(placedRects[i].getProperty("text"), placedRects[i].x, placedRects[i].y + fontsize/4);
		}
      
    }
  });
});
