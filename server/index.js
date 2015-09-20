var morgan = require('morgan');
var twilio = require('twilio');
var twclient = twilio('ACb8f9a1eea7e6769f925bf2dab0879822', '3639e77e024315b49ebca0b6bb0ac0fa');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

// Websocket stuff
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(morgan('dev'));
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/incoming', function (req, res) {
    console.log('Received Incoming')
    var body = req.body['Body'];
    var from = req.body['From'];
    io.emit('twilioincoming', {'body': body, 'from': from});
    res.send('');
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('twiliooutgoing', function (data) {
        console.log(data);

        //Send an SMS text message
        twclient.sendMessage({

            to: data['to'], // Any number Twilio can deliver to
            from: '+16204494106', // A number you bought from Twilio and can use for outbound communication
            body: data['body'] // body of the SMS message

        }, function(err, responseData) { //this function is executed when a response is received from Twilio

            if (!err) { // "err" is an error received during the request, if any
                console.log('Sent ' + responseData.body + ' to ' + responseData.from);
            }
        });
    });
});

var server = http.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});