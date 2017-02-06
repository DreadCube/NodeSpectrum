// socket object
var Socket = {

    Init: function() {
    	this.socket = io();
        this.status = null;
        this.room = null;
        this.hostData = {};
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
            Socket.status = 'Join';
    	});

    	this.socket.on('JoinReady', function() {
    		Socket.status = 'Joined';

           var checkboxLabel = newElement('label', {innerText: 'Freq Data', id: 'freqData'}); 
            Socket.checkBoxFreqData = newElement('input', {type: 'checkbox', value: 'FreqData'});
            checkboxLabel.appendChild(Socket.checkBoxFreqData);
            UI.ConnectionDiv.appendChild(checkboxLabel);

            checkboxLabel = newElement('label', {innerText: 'Design Data', id: 'designData'}); 
            Socket.checkBoxDesignData = newElement('input', {type: 'checkbox', value: 'designData'});
            checkboxLabel.appendChild(Socket.checkBoxDesignData);
            UI.ConnectionDiv.appendChild(checkboxLabel);

            // todo: disabling content of stream type
            /*$('.box.boxLeft select').each(function(i, elem)
            {
                $('#'+elem.id).attr('disabled', true);
            });*/
    	});
    },
    Disconnect: function() {
        if(this.socket) {
            this.socket.disconnect();
            if(this.status === 'Hosting') {
                UI.ConnectionDiv.removeChild(UI.ConnectionDiv.lastElementChild);
            }
            if(this.status === 'Join' || this.status === 'Joined') {
                $('#freqData').remove();
                $('#designData').remove();
                UI.ConnectionDiv.removeChild(UI.ConnectionDiv.lastElementChild);
                UI.ConnectionDiv.removeChild(UI.ConnectionDiv.lastElementChild);
            }

            this.socket = null;
            this.status = null;
            this.room = null;
            this.hostData = {};
        }
    },
    previousDesignData : '',
    StreamData: function() {

        fbc_array = new Uint8Array(AudioObject.analyser.frequencyBinCount);
        AudioObject.analyser.getByteFrequencyData(fbc_array);
        AudioObject.freqData = fbc_array;

        if(Socket.status === 'Joined' && Socket.hostData !== null) {
           
            if(this.checkBoxFreqData.checked) {
                AudioObject.freqData = Socket.hostData.freqData;
            }
            if(this.checkBoxDesignData.checked) {
                if(this.previousDesignData !== Socket.hostData.designData) {
                    this.previousDesignData = Socket.hostData.designData;
                    UI.loadTemplate(Socket.hostData.designData);
                }
            }
        } else {

            if(Socket.status === 'Hosting')
            {
                Socket.socket.emit('HostData', JSON.stringify({freqData: fbc_array, designData: UI.currentDesignToJson()}));
            }
        }
    }
};