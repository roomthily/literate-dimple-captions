
var express = require('express'),
  OpenedCaptions = require('opened-captions'),
    retext = require('retext-sentiment'),
    english = require('retext-english'),
    unified = require('unified'),
    vfile = require('vfile'),
    inspect = require('unist-util-inspect'),
    visit = require('unist-util-visit');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var socket = require('socket.io-client')('https://literate-dimple.glitch.me');

app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

server.listen(8080);

var rolling_store = [];

// this data is passed through to the client
var oc = new OpenedCaptions({
  io: io
});

oc.addStream('server', {
  host: 'https://openedcaptions.com',
  port: 443,
  description: "CSPAN"
});


// do things, catching the opened-captions stream
// to do the basic, "streaming" sentiment analysis
socket.on('connect', function() {
  console.log('hi, server-side.');
});

// on the oc update
socket.on('word', function(data) {
  rolling_store.push(data.data.body);
  
  // every so often, do a rolling sentiment
  // analysis
  if (rolling_store.length == 20) {
    console.log('processing:', rolling_store.join(' '));
    var intermediate = process();
    
    // emit things! through the server
    oc.io.sockets.emit('sentiment', intermediate);
  }
});

function process() {
  // the sentiment analysis from retext
  // the chunk we're interested in:
  // RootNode[2m[[22m[33m1[39m[2m][22m (1:1-1:106, 0-105) [data={"polarity":0,"valence":"neutral"}]
  
  var processor = unified()
    .use(english)
    .use(retext);
  
  var content = rolling_store.join(' ');
  var file = vfile({
    path: "./.data/store.txt", 
    contents: content
  });
  var tree = processor.parse(file);
  processor.run(tree, file);
  
  // if you want to view the whole tree:
  // console.log(inspect(tree));
  
  var v;
  var p;
  
  // grab the polarity & valence details
  visit(tree, 'RootNode', function(node) {
    var data = node.data || {};
    console.log('valence: ', data.valence);
    console.log('polarity: ', data.polarity);
    
    v = data.valence;
    p = data.polarity;
  });
  
  // roll it over
  rolling_store = [];
  
  return {valence: v, polarity: p, chunk: content};
}

