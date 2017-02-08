var express = require("express");
var app = express();
var http = require('http').Server(app);
var fs = require("fs");
var path = require('path');
var io = require('socket.io')(http);
var Array = require('node-array');

var extensionRegex = /(?:\.([^.]+))?$/;

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

    socket.on('Leave', function(room)
    {
        this.leave(room);
        socket.emit('LeaveReady');
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
    playlists.splice(playlists.indexOf('.gitignore'), 1);

    var data = {};

    for(var i = 0; i < playlists.length; i++) {

        data[playlists[i]] = [];
    	var dir = getDirectories(__dirname + '/public/audio/'+ playlists[i]);

        for(var j = 0; j < dir.length; j++) {
            if(extensionRegex.exec(dir[j])[1] === 'mp3') {
                var subtitleContent = [];
                var subtitlePath = __dirname + '/public/audio/'+playlists[i]+'/'+dir[j].replace(extensionRegex.exec(dir[j])[1], 'srt');
                try {
                    subtitleContent = fs.readFileSync(subtitlePath);
                } catch(err) {
                    // No file
                }
                subtitleContent = subtitleToJson(subtitleContent);
                data[playlists[i]].push({src: '../audio/'+playlists[i]+'/'+dir[j], name: dir[j], subtitle: subtitleContent});
            }
        }
    }

    fs.writeFile(__dirname + '/public/audio/tracks.js', 'var globalLocalTracks = '+JSON.stringify(data)+';', function(err) {
        if(err) {
        	console.log('Error: Could not prepare local audio files!');
        }
    });
}


function rangeToMs(range) {
    rangeSplit = range.split(':');
    var hours = Number(rangeSplit[0]);
    var minutes = Number(rangeSplit[1]);
    var seconds = Number(rangeSplit[2].replace(',', '.'));

    if(hours > 0) {
        seconds = seconds + (hours * 3600);
    }
    if(minutes > 0) {
        seconds = seconds + (minutes * 60);
    }
    return seconds * 1000;
}

function subtitleToJson(content) {
    content = content.toString();
    var lines = content.split('\n');
    var output = [];
    var buffer = {
        content: ''
    };
    var that = this;
    lines.forEach(function(line) {

        line = line.replace('\r', '');
        if(!buffer.id) {
            buffer.id = line;
        } else if(!buffer.start) {
            var range = line.split(' -->');
            buffer.start = rangeToMs(range[0]);
            buffer.end = rangeToMs(range[1]);
        }
        else if(line !== '') {
            buffer.content = buffer.content + ' ' + line;
        }
        else {
            output.push(buffer);
            buffer = {content: '' };
        }
    });
    return output;
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