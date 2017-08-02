$(function() {
  var url_params = new URLSearchParams(window.location.search);
  var viz = url_params.get('viz') || 'stream';
  // options: 
  //   bin: 2d bin-packing of the text
  //   stream: skim formatting (update terms by frequency, not stopwords)
  
  var words = {};
  
  // TODO: this is not the greatest regex .
  var pttn = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
  
  $("#stream").css('visibility', 'visible');
  $("canvas").css('visibility', 'hidden');
  
  if (viz == 'bin') {
    // init the canvas
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 800;

    var max_font = 48;
    var max_width = 120;

    var area = new binpacking.Rect(400,400,canvas.width,canvas.height);
    
    $("#stream").css('visibility', 'hidden');
    $("canvas").css('visibility', 'visible');
  }
  
  // pick your color scheme, this is one of the
  // colorbrewer2 schemes.
  var colors = chroma.brewer.YlGnBu;
  
  // streams the new text to the div. plain caption rendering of cspan.
  var socket = io();
  
  // socket.on('sentiment', function(data) {
  //   console.log('SENTIMENT!');
  //   console.log(data);
  // })
  
  socket.on('word', function(data) {
    // tidy up our word
    var word = data.data.body;
    word = word.replace(pttn, '');
    if (word != '') {
      words[word] = words[word] + 1 || 1;
    }

    if (viz === 'stream') {
      var term = stopwords.includes(word.toLowerCase()) ? word+'&nbsp;' :'<span data-term="'+word+'">' +word+ '</span> &nbsp;';
      
      $("#stream").append(term);
      
      // update the mark colors
      var updated = [];
      for (var entry of Object.entries(words)) {
        var w = entry[0];
        var pop = entry[1];
        if (updated.includes(w)) {
          continue;
        }
        var color = pop < colors.length ? colors[pop] : '#eee'
        $('[data-term="'+w+'"]').css('color', color);

        updated.push(w);
      }
      
      
    } else if (viz === 'bin') {
      // the 2d text bin packing

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
        // the boxes, if you'd like to view those
        // for (var i = 0; i < rects.length; i++) {
        //   rects[i].draw(context);
        // }

        // Fade all the previous drawings to show that they are just the initial positions
        context.globalAlpha = .9;
        context.fillStyle = "#fff";
        context.fillRect(0,0,canvas.width, canvas.height);

        var placedRects = binpacking.pack(area, rects, 1);

        // Draw the rects in their final position
        context.globalAlpha = 1;
        // for (var i = 0; i < placedRects.length;i++){
        // 	placedRects[i].draw(context);
        // }

        // Draw the text into each rect
        context.fillStyle = "#000";
        for (var i = 0;i < placedRects.length;i++){
          var fontsize = placedRects[i].getProperty("fontsize");
          context.font = fontsize + "px Arial";
          context.fillText(placedRects[i].getProperty("text"), placedRects[i].x, placedRects[i].y + fontsize/4);
        }

      }
      
    } else {
      console.log('nope!');
    }
  
  });
});

var stopwords = [
  'i',
'me',
'my',
'myself',
'we',
'our',
'ours',
'ourselves',
'you',
'your',
'yours',
'yourself',
'yourselves',
'he',
'him',
'his',
'himself',
'she',
'her',
'hers',
'herself',
'it',
'its',
'itself',
'they',
'them',
'their',
'theirs',
'themselves',
'what',
'which',
'who',
'whom',
'this',
'that',
'these',
'those',
'am',
'is',
'are',
'was',
'were',
'be',
'been',
'being',
'have',
'has',
'had',
'having',
'do',
'does',
'did',
'doing',
'a',
'an',
'the',
'and',
'but',
'if',
'or',
'because',
'as',
'until',
'while',
'of',
'at',
'by',
'for',
'with',
'about',
'against',
'between',
'into',
'through',
'during',
'before',
'after',
'above',
'below',
'to',
'from',
'up',
'down',
'in',
'out',
'on',
'off',
'over',
'under',
'again',
'further',
'then',
'once',
'here',
'there',
'when',
'where',
'why',
'how',
'all',
'any',
'both',
'each',
'few',
'more',
'most',
'other',
'some',
'such',
'no',
'nor',
'not',
'only',
'own',
'same',
'so',
'than',
'too',
'very',
's',
't',
'can',
'will',
'just',
'don',
'should',
'now'
];
