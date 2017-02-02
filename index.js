var express = require("express");
var app = express();
var http = require('http').Server(app);
var fs = require("fs");
var path = require('path');
var io = require('socket.io')(http);
var Array = require('node-array');

io.on('connection', function(socket) {
    var rooms = io.sockets.adapter.rooms;
    socket.emit('ConnectionReady', JSON.stringify(rooms));

    socket.on('Host', function() {
        this.join(this.id);
        socket.emit('HostReady');
    });

    socket.on('HostData', function(data) {
        io.to(this.id).emit('HostDataReady', data);
    });

    socket.on('Join', function(room) {
        this.join(room);
        socket.emit('JoinReady');
    });
});

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file));
    });
}

function loadTracks(){

    var playlists = getDirectories(__dirname + '/public/audio/');
    playlists.splice(playlists.indexOf('tracks.js'), 1);

    var data = {};

    for(var i = 0; i < playlists.length; i++) {

        data[playlists[i]] = [];
    	var dir = getDirectories(__dirname + '/public/audio/'+ playlists[i]);

        for(var j = 0; j < dir.length; j++) {
            data[playlists[i]].push({src: '../audio/'+playlists[i]+'/'+dir[j], name: dir[j]});
        }
    }

    fs.writeFile(__dirname + '/public/audio/tracks.js', 'var globalLocalTracks = '+JSON.stringify(data)+';', function(err) {
        if(err) {
        	console.log('Error: Could not prepare local audio files!');
        }
    });
}

setInterval(function() {
    loadTracks();
}, 1000);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text) {
        res.send(text);
    });
});
http.listen(3000, function() {
    console.log('Server running on *:3000');
});