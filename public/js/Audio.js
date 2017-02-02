// audio object
var AudioObject = {
	freqData: {},
	Mode: 'Local',
	AudioStream: null,

	Init: function() {
		AudioObject[this.Mode].Init();

		AudioObject.AudioStream.onended = function(event) {
			for(var i = 0; i < UI.selectTrack.children.length; i++) {
				if(UI.selectTrack.children[i].selected) {

					if(i === 0) {
						UI.selectTrack.selectedIndex = (UI.selectTrack.children.length > 1 ? 1 : 0);
					} else if(i === UI.selectTrack.children.length - 1) {
						UI.selectTrack.selectedIndex = 0;
					} else {
						UI.selectTrack.selectedIndex = UI.selectTrack.selectedIndex + 1;
					}
					AudioObject[AudioObject.Mode].playTrack(UI.selectTrack.value);
					return;
				}
			}
		};
		UI.setAudioInformation(AudioObject[this.Mode].Data, true);
	},

	prepareFrequencyData: function() {
		this.ctx = new AudioContext();
		this.analyser = this.ctx.createAnalyser();

		this.source = this.ctx.createMediaElementSource(this.AudioStream);
		this.source.connect(this.analyser);
		this.analyser.connect(this.ctx.destination);

		this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

		this.render();
	},

	playTrack: function(src) {
		this[AudioObject.Mode].playTrack(src);
		this.prepareFrequencyData();
	},

	render: function() {
		requestAnimationFrame(this.render.bind(this));
		if(Socket.status === 'Joined' && Socket.hostData !== null) {
			this.freqData = Socket.hostData;
		} else {
			fbc_array = new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.getByteFrequencyData(fbc_array);
			this.freqData = fbc_array;
			if(Socket.status === 'Hosting')
			{
				Socket.socket.emit('HostData', JSON.stringify(fbc_array));
			}
		}
	},

	Local: {
		Data: null,
		Init: function() {
			this.loadData(false);
			AudioObject.AudioStream = new Audio();

			setInterval(function() {
				if(AudioObject.Mode === 'Local') {
					AudioObject.Local.loadData(true, function() {
						UI.setAudioInformation(AudioObject.Local.Data, false);
					});
				}
			}, 1000);
		},

		playTrack: function(src) {
			AudioObject.AudioStream.src = src;
			AudioObject.AudioStream.play();
		},

		loadData: function(async, callback) {
			$.ajax({
				async: async,
				url: '../audio/tracks.js',
				dataType: 'script',
				success: function()
				{
					if(JSON.stringify(AudioObject.Local.Data) !== JSON.stringify(globalLocalTracks))
					{
						AudioObject.Local.Data = globalLocalTracks;
						if(callback)
						{
							callback();
						}
					}
				}
			});	
		}
	}
};