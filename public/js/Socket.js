// socket object
var Socket = {
	socket: null,
	status: null,
	room: null,
	hostData: null,

    Init: function() {
    	this.socket = io();
    },
    Host: function() {

    	this.Init();

    	this.socket.on('ConnectionReady', function() {
    		Socket.socket.emit('Host');
    	});
    	
        this.socket.on('HostReady', function() {
    		Socket.status = 'Hosting';
    		UI.ConnectionDiv.appendChild(newElement('span', {innerText: 'Hosting on Channel: '+Socket.socket.id}));
    	});
    },
    Join: function() {

    	this.Init();

    	this.socket.on('HostDataReady', function(data) {
    		Socket.hostData = JSON.parse(data);
    	});

    	this.socket.on('ConnectionReady', function(data) {
    		var rooms = JSON.parse(data);
    		var JoinSpan = newElement('span', {innerText: 'Channel:'});
    		var JoinSelect = newElement('select', {onchange: function() {
				Socket.room = JoinSelect.children[JoinSelect.selectedIndex].value;
				Socket.socket.emit('Join', Socket.room);
			}});
    		JoinSelect.appendChild(newElement('option', {value: '-----', innerHTML: '-----'}));
    		for(room in rooms) {
    			// Own (public) room
    			if(room == Socket.socket.id) {
    				continue;
    			}
    			JoinSelect.appendChild(newElement('option', {value: room, innerHTML: room}));
    		}
    		UI.ConnectionDiv.appendChild(JoinSpan);
    		UI.ConnectionDiv.appendChild(JoinSelect);
    	});

    	this.socket.on('JoinReady', function() {
    		Socket.status = 'Joined';
    	});
    }
};