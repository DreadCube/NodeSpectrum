// audio object
var AudioObject = {
	freqData: {},
	Mode: 'Local',
	subtitle: null,

	Init: function() {
		AudioObject[this.Mode].Init();

	},
	cleanup: function() {
		switch(this.Mode)
		{
			case 'Local':
			AudioObject.Local.AudioStream.pause();
			break;
			case 'Mic':
			AudioObject.Mic.audioStream.getTracks()[0].stop();
			break;
		}
	},
	Local: {
		Data: null,		
		AudioStream: null,
		Init: function() {
			this.loadData(false);
			this.AudioStream = new Audio();

			setInterval(function() {
				if(AudioObject.Mode === 'Local') {
					AudioObject.Local.loadData(true, function() {
						UI.setAudioInformation(AudioObject.Local.Data, false);
					});
				}
			}, 1000);

			this.AudioStream.onended = function(event) {
				for(var i = 0; i < UI.selectTrack.children.length; i++) {
					if(UI.selectTrack.children[i].selected) {

						if(i === 0) {
							UI.selectTrack.selectedIndex = (UI.selectTrack.children.length > 1 ? 1 : 0);
						} else if(i === UI.selectTrack.children.length - 1) {
							UI.selectTrack.selectedIndex = 0;
						} else {
							UI.selectTrack.selectedIndex = UI.selectTrack.selectedIndex + 1;
						}
						AudioObject.Local.playTrack(UI.selectTrack.value);
						return;
					}
				}
			};

			this.AudioStream.AudioInterval = setInterval(function(){
				var timestamp = AudioObject.Local.AudioStream.currentTime * 1000;
				for(var i = 0; i < AudioObject.Local.Data[UI.selectPlaylist.value].length; i++) {
					
					if(AudioObject.Local.Data[UI.selectPlaylist.value][i].src == UI.selectTrack.value){
						
						current = AudioObject.Local.Data[UI.selectPlaylist.value][i];

						if(current.subtitle.length !== 0){
							for(var j = 0; j < current.subtitle.length; j++) {
								if(current.subtitle[j].start <= timestamp && current.subtitle[j].end >= timestamp){
									AudioObject.subtitle = current.subtitle[j].content;
									return;
								}
							}
						}
						return;
					}
				}
				AudioObject.subtitle = '';
				//AudioObject.subtitle = null;
			}, 50);
			UI.setAudioInformation(this.Data, true);	
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
		},

		prepareFrequencyData: function() {
			var ctx = new AudioContext();
			this.analyser = ctx.createAnalyser();
	  		this.analyser.smoothingTimeConstant = 0.8;
			this.source = ctx.createMediaElementSource(this.AudioStream);
			this.source.connect(this.analyser);
			this.analyser.connect(ctx.destination);

			this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
			AudioObject.analyser = this.analyser;
			AudioObject.render();
		},

		playTrack: function(src) {
			this.AudioStream.src = src;
			this.AudioStream.play();
			this.prepareFrequencyData();
		},

		setVolume: function(volume) {
			this.AudioStream.volume = volume;
		}
	},
	Mic: {
		Init: function() {
		
   			if (!navigator.getUserMedia)
            	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                         			  navigator.mozGetUserMedia || navigator.msGetUserMedia;

		    if (navigator.getUserMedia) {

		        navigator.getUserMedia({audio: true}, 
		          	function(stream) {
		          		AudioObject.Mic.audioStream = stream;
		          		var audioContext = new AudioContext;
		          		AudioObject.Mic.gainNode = audioContext.createGain();
		          		AudioObject.Mic.gainNode.connect(audioContext.destination);
		          		var BUFF_SIZE = 16384;
		          		microphoneStream = audioContext.createMediaStreamSource(AudioObject.Mic.audioStream);
		          		microphoneStream.connect(AudioObject.Mic.gainNode);

		          		scriptProcessorNode = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
		          		scriptProcessorNode.onaudioprocess = this.processMicrophoneBuffer;

		          		microphoneStream.connect(scriptProcessorNode);

		    			scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1);
		    			scriptProcessorNode.connect(AudioObject.Mic.gainNode);

		    			analyserNode = audioContext.createAnalyser();
		    			analyserNode.smoothingTimeConstant = 0.9;
		    			analyserNode.fftSize = 2048;

		    			microphoneStream.connect(analyserNode);
		    			analyserNode.connect(scriptProcessorNode);

		    			AudioObject.analyser = analyserNode;
		    			AudioObject.render(analyserNode);
		          	},
		          function(e) {
		            alert('Error capturing audio.');
		          }
		        );

		    	} else { 
		    		console.log('getUserMedia not supported in this browser.');
		    	}
		},
		setVolume: function(volume) {
			this.gainNode.gain.value = volume;
		}
	},

	render: function() {
		requestAnimationFrame(this.render.bind(this));
		Socket.StreamData();
	}
};