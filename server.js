
var express = require('express'),
  OpenedCaptions = require('opened-captions');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

server.listen(8080);

var oc = new OpenedCaptions({
  io: io
});

oc.addStream('server', {
  host: 'https://openedcaptions.com',
  port: 443,
  description: "CSPAN"
});

// TODO: add the socket on? maybe in here for a request?
//       to do more than just dump it to html.