// audio object
var AudioObject = {
	freqData: {},
	Mode: 'Local',
	AudioStream: null,

	Init: function() {
		AudioObject[this.Mode].Init();

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
						AudioObject.Local.playTrack(UI.selectTrack.value);
						return;
					}
				}
			};
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
			this.ctx = new AudioContext();
			this.analyser = this.ctx.createAnalyser();
	  		//analyserNode.smoothingTimeConstant = 0;
	   		///   analyserNode.fftSize = 2048;
			this.source = this.ctx.createMediaElementSource(AudioObject.AudioStream);
			this.source.connect(this.analyser);
			this.analyser.connect(this.ctx.destination);

			this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
			AudioObject.analyser = this.analyser;
			AudioObject.render();
		},

		playTrack: function(src) {
			AudioObject.AudioStream.src = src;
			AudioObject.AudioStream.play();
			this.prepareFrequencyData();
		}
	},
	Mic: {
		Init: function() {
			AudioObject.AudioStream.pause();
   			if (!navigator.getUserMedia)
            	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                         			  navigator.mozGetUserMedia || navigator.msGetUserMedia;

		    if (navigator.getUserMedia) {

		        navigator.getUserMedia({audio:true}, 
		          	function(stream) {
		          		var audioContext = new AudioContext;
		          		gainNode = audioContext.createGain();
		          		gainNode.connect(audioContext.destination);
		          		var BUFF_SIZE = 16384;
		          		microphoneStream = audioContext.createMediaStreamSource(stream);
		          		microphoneStream.connect(gainNode);

		          		scriptProcessorNode = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
		          		scriptProcessorNode.onaudioprocess = this.processMicrophoneBuffer;

		          		microphoneStream.connect(scriptProcessorNode);

		    			scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1);
		    			scriptProcessorNode.connect(gainNode);

		    			analyserNode = audioContext.createAnalyser();
		    			analyserNode.smoothingTimeConstant = 0.9;
		    			analyserNode.fftSize = 2048;

		    			microphoneStream.connect(analyserNode);
		    			analyserNode.connect(scriptProcessorNode);

		    			scriptProcessorNode.onaudioprocess = function(){/*console.log('hier');
		    				var array = new Uint8Array(analyserNode.frequencyBinCount);
		    				analyserNode.getByteFrequencyData(fbc_array);
		    				AudioObject.freqData = fbc_array;
		    				*/
		    				AudioObject.analyser = analyserNode;
		    				AudioObject.render(analyserNode);
		    			}
		          	},
		          function(e) {
		            alert('Error capturing audio.');
		          }
		        );

		    	} else { alert('getUserMedia not supported in this browser.'); }
		},

		processMicrophoneBuffer: function() {

		}
	},

	render: function() {
		requestAnimationFrame(this.render.bind(this));
		if(Socket.status === 'Joined' && Socket.hostData !== null) {
			this.freqData = Socket.hostData;
		} else {
			fbc_array = new Uint8Array(AudioObject.analyser.frequencyBinCount);
			AudioObject.analyser.getByteFrequencyData(fbc_array);
			AudioObject.freqData = fbc_array;
			if(Socket.status === 'Hosting')
			{
				Socket.socket.emit('HostData', JSON.stringify(fbc_array));
			}
		}
	}
};