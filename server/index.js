var morgan = require('morgan');

var express = require('express');
var app = express();

// Websocket stuff
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(morgan('dev'));

app.use(express.static('static'));

app.get('/incoming', function (req, res) {
	console.log('Received Incoming')
	io.emit('twilioincoming', 'Hello World');
	res.send('');
});

io.on('connection', function(socket){
	console.log('a user connected');
});

var server = http.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});