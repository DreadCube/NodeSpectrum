var controller = 
{
	Init: function()
	{
		this.UI.Init();
		this.Canvas.Init();
		this.Audio.Init();
	},

	UI:
	{
		setAudioInformation: function(data, playTrack)
		{
			this.selectPlaylist.innerHTML = '';
			this.selectTrack.innerHTML = '';
			for(var playlist in data)
			{
				var optionPlaylist = newElement('option', { value: playlist, innerText: playlist });
				this.selectPlaylist.appendChild(optionPlaylist);
			}

			var tracks = data[this.selectPlaylist.children[0].value];
			for(var i = 0; i < tracks.length; i++)
			{
				var optionTrack = newElement('option', {value: tracks[i]['src'], innerText: tracks[i]['name']});
				this.selectTrack.appendChild(optionTrack);
			}
			if(playTrack)
			{
				controller.Audio.playTrack(tracks[0]['src']);
			}
		},

		initBasicConnectionControls: function()
		{
			var that = this;

			this.ConnectionDiv = newElement('div', {className: 'box boxBottom'});
			this.ConnectionDiv.appendChild(newElement('span', {className: 'text textBorder', innerText: 'Socket'}));
		
			var modeSpan = newElement('span', {innerText: 'Mode', className: 'text'});
			var selectMode = newElement('select', {onchange: function(event)
			{
                switch(selectMode.children[selectMode.selectedIndex].value)
                {
                    case 'Host':  controller.Socket.Host(); break;
                    case 'Join':  controller.Socket.Join(); break;
                    default: controller.Socket.Leave();
                }
            }});
			selectMode.appendChild(newElement('option', {value: 'None', innerText: 'None'}));
			selectMode.appendChild(newElement('option', {value: 'Host', innerText: 'Host'}));
			selectMode.appendChild(newElement('option', {value: 'Join', innerText: 'Join'}));
			modeSpan.appendChild(selectMode);
			this.ConnectionDiv.appendChild(modeSpan);

			document.body.appendChild(this.ConnectionDiv);
		},

		initBasicAudioControls: function()
		{
			var that = this;
			this.AudioDiv = newElement('div', {className: 'box'});
			this.AudioDiv.appendChild(newElement('span', {className: 'text textBorder', innerText: 'Audio'}));
			
			var modeSpan = newElement('span', {innerText: 'Mode', className: 'text'});
			var selectMode = newElement('select');
			var opt = newElement('option', {value: 'Local', innerText: 'Local'});
			selectMode.appendChild(opt);
			modeSpan.appendChild(selectMode);
			this.AudioDiv.appendChild(modeSpan);

			var spanPlaylist = newElement('span', {innerText: 'Playlist', className: 'text'});
			this.selectPlaylist = newElement('select', {id: 'selectPlaylist', onchange: function(event)
			{
				var data = controller.Audio[controller.Audio.Mode].Data;
				var tracks = data[event.target.value];
				that.selectTrack.innerHTML = '';
				for(var i = 0; i < tracks.length; i++)
				{
					var optionTrack = newElement('option', {value: tracks[i]['src'], innerText: tracks[i]['name']});
					that.selectTrack.appendChild(optionTrack);
				}
				controller.Audio[controller.Audio.Mode].playTrack(tracks[0]['src']);
			}});
			spanPlaylist.appendChild(this.selectPlaylist);
			this.AudioDiv.appendChild(spanPlaylist);

			var spanTrack = newElement('span', {innerText: 'Track', className: 'text'});
			this.selectTrack = newElement('select', {id: 'selectTrack', onchange: function(event)
			{
				controller.Audio[controller.Audio.Mode].playTrack(event.target.value);
			}});
			spanTrack.appendChild(this.selectTrack);
			this.AudioDiv.appendChild(spanTrack);

			document.body.appendChild(this.AudioDiv);
		},

		initBasicCanvasControls: function()
		{
			var can = document.getElementsByTagName('canvas')[0];
			if(can)
			{
				can.remove();
			}
			if(this.mainDiv)
			{
				this.mainDiv.remove();
			}
			
			//Spektrum UI Container
			this.mainDiv = newElement('div', {className: 'box boxRight'});
			document.body.appendChild(this.mainDiv);

			var mainSpan = newElement('span', {className: 'text textBorder'});
			mainSpan.appendChild(document.createTextNode('Spektrum'));
			this.mainDiv.appendChild(mainSpan);

			//Spektrum UI Mode
			var modeSpan = newElement('span', {className: 'text', innerHTML: 'Mode'});
			this.mainDiv.appendChild(modeSpan);

			var selectMode = newElement('select', {id: 'spektrumModeSelect', value: controller.Canvas.Mode, onchange: function(event)
			{
				controller.Canvas.Mode = event.target.value;
				//controller.UI.Init();
				controller.UI.initBasicCanvasControls();
				controller.UI.initModeCanvasControls();
				controller.Canvas.Init();
			}});
			modeSpan.appendChild(selectMode);

			var optionMode = newElement('option', {value: 'Bars', innerText: 'Bars'});
			selectMode.appendChild(optionMode);

			var optionMode = newElement('option', {value: 'BassBox', innerText: 'Suupa BassBox'});
			selectMode.appendChild(optionMode);

			var childs = document.getElementById('spektrumModeSelect').children;
			for(var i = 0; i < childs.length; i++)
			{
				if(childs[i].value === controller.Canvas.Mode)
				{
					childs[i].selected = true;
				}
			}
			var that = this;

			//Spektrum UI Load Template
			var templateSpan = newElement('span', {className: 'text', innerHTML: 'Use Template'});
			this.mainDiv.appendChild(templateSpan);

			var selectTemplate = newElement('select', {id: 'selectTemplateInput', onchange: function(event)
			{
				that.loadTemplate(event.target.value);
			}});

			var templateOption = newElement('option', {id: 'none', innerHTML: 'none'});
			selectTemplate.appendChild(templateOption);

			for(var key in localStorage)
			{
				if(key.substring(0, ('template.'+controller.Canvas.Mode+'.').length) === 'template.'+controller.Canvas.Mode+'.')
				{
					var templateOption = newElement('option', {id: key.replace('template.'+controller.Canvas.Mode+'.', ''), innerHTML: key.replace('template.'+controller.Canvas.Mode+'.', '')});
					selectTemplate.appendChild(templateOption);
				}
			}
			templateSpan.appendChild(selectTemplate);

			//Spektrum UI Save Template
			var templateSpan = newElement('span', {className: 'text', innerHTML: 'Save Template'});
			this.mainDiv.appendChild(templateSpan);

			var templateInput = newElement('input', {type: 'text', id: 'SaveTemplateInput'});
			templateSpan.appendChild(templateInput);

			var templateButton = newElement('button', {innerHTML: 'Save', onclick: function()
			{
				that.saveTemplate(templateInput.value);
				templateInput.value = '';
			}});

			templateSpan.appendChild(templateButton);

			//Anzeige Keydown Event
			var active = true;
			document.body.onkeydown = function(event)
			{
				if(event.keyCode === 32)
				{
					if(active === true)
					{
						controller.UI.mainDiv.className = 'box boxRight animated fadeOut';
						controller.UI.AudioDiv.className = 'box animated fadeOut';
						controller.UI.ConnectionDiv.className = 'box boxBottom animated fadeOut';
						active = false;
					}
					else
					{
						controller.UI.mainDiv.className = 'box boxRight animated fadeIn';
						controller.UI.AudioDiv.className = 'box animated fadeIn';				
						controller.UI.ConnectionDiv.className = 'box boxBottom animated fadeIn';
						active = true;
					}
				}
			}
		},

		initModeCanvasControls: function()
		{
			if(this.ModeDiv)
			{
				this.ModeDiv.remove();
			}
			this.ModeDiv = newElement('div', {id: 'ModeDiv'});
			this.mainDiv.appendChild(this.ModeDiv);
			for(var control in window['controller']['Canvas'][controller.Canvas.Mode]['Controls'])
			{
				var controlSpan = newElement('span', {className: 'text', innerHTML: window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][control]['label']});
				this.ModeDiv.appendChild(controlSpan);

				var controlInput = null;
				if(window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][control].type === 'select')
				{
					controlInput = newElement('select');

					var options = window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][control]['options'];
					for(var i = 0; i < options.length; i++)
					{
						selectInput = newElement('option', {value: options[i].value, innerHTML: options[i].label});
						controlInput.appendChild(selectInput);
					}
				}
				else
				{
					controlInput = newElement('input');
				}
				controlInput.className = 'control';
				controlInput.id = control;

				for(var property in window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][control])
				{
					controlInput[property] = window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][control][property];
				}
				if(controlInput.type === 'checkbox')
				{
					controlInput['checked'] = (controlInput['value'] === 'true' ? true : false);
				}
				controlInput['alt'] = controlInput['value'];

				var that = this;
				controlInput.oninput = function(event, attr)
				{
					that.onInputChange(event, attr);
				};

				controlInput.onchange = function(event, attr)
				{
					that.onInputChange(event, attr);
				};

				if(controlInput.type == 'range')
				{
					var rangeValue = newElement('span', { innerHTML: controlInput.value }, {display: 'block', fontSize: 15, textShadow: 'none'});
					controlSpan.appendChild(rangeValue);
				}
				controlSpan.appendChild(controlInput);
			}

			//Color Picker Haxxx
			$('input[type="color"]').each(function(index, elem)
			{
			   $(elem).spectrum(
			   {
			        color: elem.value,
			        flat: true,
			        allowEmpty: true,
			        showPalette: true,
			        showButtons: false
			    });

			    $(elem).on('move.spectrum', function(e, tinycolor)
			    {
			    	e.target.value = tinycolor.toHexString();
					$('#'+e.target.id).trigger('change');
			    });
			});
		},

		onInputChange: function(event, attr)
		{
			if(typeof attr === 'undefined')
			{
				if(event.target.type === 'range')
				{
					event.target.previousElementSibling.innerHTML = event.target.value;
				}
				window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][event.target.id]['value'] = (event.target.type === 'checkbox' ? event.target.checked : event.target.value);
				event.target.alt = event.target.value;
				if(window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][event.target.id]['changeEvent'] && window['controller']['Canvas'][controller.Canvas.Mode]['onControlChange'])
				{
					window['controller']['Canvas'][controller.Canvas.Mode].onControlChange(event);
				}
			}
		},

		loadTemplate: function(templateId)
		{
			var templateData = JSON.parse(localStorage.getItem('template.'+controller.Canvas.Mode+'.'+templateId));
			var controls = document.getElementsByClassName('control');

			for(var control in templateData)
			{
				if(typeof(templateData[control]) !== 'boolean')
				{
					if(!isNaN(templateData[control]))
					{
						templateData[control] = Number(templateData[control]);
					}
				}
				window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][control]['value'] = templateData[control];

				if(window['controller']['Canvas'][controller.Canvas.Mode]['Controls'][control]['changeEvent'] && window['controller']['Canvas'][controller.Canvas.Mode]['onControlChange'])
				{
					var ev = {target: document.getElementById(control)};
					window['controller']['Canvas'][controller.Canvas.Mode].onControlChange(ev);
				}
			}
			this.initModeCanvasControls();

		},

		saveTemplate: function(templateId)
		{
			if(templateId === '')
			{
				return false;
			}
			var templateData = {};
			var controls = document.getElementsByClassName('control');

			for(var i = 0; i < controls.length; i++)
			{
				var value = (controls[i].type === 'color' ? controls[i].alt : controls[i].value);
				templateData[controls[i].id] = (controls[i].type === 'checkbox' ? controls[i].checked : value);
			}
			localStorage.setItem('template.'+controller.Canvas.Mode+'.'+templateId, JSON.stringify(templateData));
			var optionTemplate = document.createElement('option');
			optionTemplate.id = templateId;
			optionTemplate.innerHTML = templateId;
			optionTemplate.selected = true;
			var opt = document.querySelectorAll('select[id=selectTemplateInput] > option[id='+templateId+']')[0];
			if(opt)
			{
				document.getElementById('selectTemplateInput').removeChild(opt);
			}
			document.getElementById('selectTemplateInput').appendChild(optionTemplate);
		},

		Init: function()
		{
			this.initBasicCanvasControls();
			this.initModeCanvasControls();
			this.initBasicAudioControls();
			this.initBasicConnectionControls();
		}
	},

	Canvas:
	{
		Mode: 'Bars',

		Init: function()
		{
			if(this.RequestId)
			{
				window.cancelAnimationFrame(this.RequestId);
			}

			addEventListener( 'resize', this.onWindowResize, false );

			this.Scene = null;
			this.Camera = null;
			this.Renderer = null;
			this.RequestId = null;

			window['controller']['Canvas'][this.Mode].startup();
		},

		onWindowResize: function()
		{
			controller.Canvas.Camera.aspect = window.innerWidth / window.innerHeight;
			controller.Canvas.Camera.updateProjectionMatrix();
			controller.Canvas.Renderer.setSize( window.innerWidth, window.innerHeight );
		},

		Bars:
		{
			Controls:
			{
				barsNumber:
				{
					type: 'range',
					min: 1,
					max: 1000,
					value: 74,
					label: 'Number',
					changeEvent: true
				},
				barsBreite:
				{
					type: 'range',
					min: 0,
					max: 100,
					value: 1,
					label: 'Breite',
					changeEvent: true
				},
				barsHoehe:
				{
					type: 'range',
					min: 1,
					max: 50,
					value: 8,
					label: 'Hoehe',
					changeEvent: true
				},
				barsSpace:
				{
					type: 'range',
					min: 1,
					max: 100,
					value: 2,
					label: 'Space',
					changeEvent: true
				},
				barsColor:
				{
					type: 'color',
					value: '#00FF00',
					label: 'Color'
				},

				barsBackgroundColor:
				{
					type: 'color',
					value: '#000000',
					label: 'Background'
				},

				rotSpeedX:
				{
					type: 'range',
					min: -100,
					max: 100,
					value: 0,
					label: 'Rot. Speed X'
				},

				rotSpeedY:
				{
					type: 'range',
					min: -100,
					max: 100,
					value: 0,
					label: 'Rot. Speed Y'
				},

				rotSpeedZ:
				{
					type: 'range',
					min: -100,
					max: 100,
					value: 0,
					label: 'Rot. Speed Z'
				},

				cameraX:
				{
					type: 'range',
					min: -10000,
					max: 10000,
					value: 100,
					label: 'Camera Pos. X'
				},

				cameraY:
				{
					type: 'range',
					min: -1000,
					max: 1000,
					value: 0,
					label: 'Camera Pos. Y'
				},

				cameraZ:
				{
					type: 'range',
					min: -1000,
					max: 1000,
					value: 100,
					label: 'Camera Pos. Z'
				},

				wireframe:
				{
					type:'checkbox',
					value: false,
					label: 'Wireframe',
					changeEvent: true
				}
			},

			startup: function()
			{
				controller.Canvas.Scene = new THREE.Scene();
				controller.Canvas.Camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

				controller.Canvas.Renderer = new THREE.WebGLRenderer();
				controller.Canvas.Renderer.setSize( window.innerWidth, window.innerHeight );

				document.body.appendChild( controller.Canvas.Renderer.domElement );

				this.createObjects();
				this.render();
			},

			onControlChange: function(event)
			{
				this.createObjects();
			},

			createObjects: function()
			{
				controller.Canvas.Scene = new THREE.Scene();
				var lastElementPositionX = 0;

				var breite = this.Controls.barsBreite.value;
				var hoehe = this.Controls.barsHoehe.value;

			    for(var i = 0; i < this.Controls.barsNumber.value; i++)
				{
					var geometry = new THREE.BoxGeometry(breite,hoehe,breite);
					var material = new THREE.MeshBasicMaterial( { color: this.Controls.barsColor.value, wireframe: this.Controls.wireframe.value } );
				
					obj = new THREE.Mesh(geometry, material);
					obj.name = 'bar'+[i];
					obj.position.x = Number(lastElementPositionX) + Number(breite) + Number(this.Controls.barsSpace.value);
					lastElementPositionX = obj.position.x;
					controller.Canvas.Scene.add(obj);

				}
			},

			render: function()
			{
				controller.Canvas.RequestId = requestAnimationFrame(this.render.bind(this));

				var childs = controller.Canvas.Scene.children;
				for(var i = 0; i < childs.length; i++)
				{
					// Rotation
					childs[i].rotation.x = childs[i].rotation.x + (this.Controls.rotSpeedX.value / 1000);
					childs[i].rotation.y = childs[i].rotation.y + (this.Controls.rotSpeedY.value / 1000);
					childs[i].rotation.z = childs[i].rotation.z + (this.Controls.rotSpeedZ.value / 1000);

					//childs[i].scale.y = (this.Controls.barsHoehe.value / 200) * (controller.Audio.freqData[i] / 2);
					childs[i].scale.y = (-controller.Audio.freqData[i] * this.Controls.barsHoehe.value / 100);

					//Bars Color
					childs[i].material.color.set(this.Controls.barsColor.value);
				}

				
				document.body.style.backgroundColor = this.Controls.barsBackgroundColor.value;
				controller.Canvas.Scene.background = new THREE.Color(this.Controls.barsBackgroundColor.value);

				//Camera
				controller.Canvas.Camera.position.x = this.Controls.cameraX.value;
				controller.Canvas.Camera.position.y = this.Controls.cameraY.value;
				controller.Canvas.Camera.position.z = this.Controls.cameraZ.value;
				
				controller.Canvas.Renderer.render(controller.Canvas.Scene, controller.Canvas.Camera);
			}
		},

		BassBox:
		{
			Controls:
			{
				backgroundColor:
				{
					type: 'color',
					value: '#000000',
					label: 'Background'
				},

				image:
				{
					type: 'select',
					options:
					[
						{
							label: 'Genci',
							value: 'genc.png'
						},
						{
							label: 'Dres',
							value: 'dres.png'
						},
						{
							label: 'Pede',
							value: 'pede.png'
						},
						{
							label: 'All',
							value: 'All'
						}
					],
					value: 'dres.png',
					label: 'Image',
					changeEvent: true
				},
				BassIndex:
				{
					type: 'range',
					label: 'Bass Index',
					min: 1,
					max: 255,
					value: 2
				},
				BassOffset:
				{
					type: 'range',
					label: 'Bass Offset',
					min: 1,
					max: 255,
					value: 100
				},
				ShakeIndex:
				{
					type: 'range',
					label: 'Shake Index',
					min: 1,
					max: 255,
					value: 3
				},
				ShakeOffset:
				{
					type: 'range',
					label: 'Shake Offset',
					min: 1,
					max: 255,
					value: 230
				},
				ShakeWeight:
				{
					type: 'range',
					label: 'Shake Weight',
					min: 1,
					max: 100,
					value: 5
				}
			},
			direction: 'left',
			startup: function()
			{
				controller.Canvas.Scene = new THREE.Scene();
				controller.Canvas.Camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

				controller.Canvas.Renderer = new THREE.WebGLRenderer();
				controller.Canvas.Renderer.setSize( window.innerWidth, window.innerHeight );
		
				document.body.appendChild( controller.Canvas.Renderer.domElement );
				this.createObjects();
				this.render();		
			},

			createObjects: function()
			{
				controller.Canvas.Scene = new THREE.Scene();
				oObjects = [];
				if(this.Controls.image.value === 'All')
				{
					for(var i = 0; i < this.Controls.image.options.length - 1; i++)
					{
						var texture = new THREE.TextureLoader().load( '../img/'+ this.Controls.image.options[i].value);
						var geometry = new THREE.BoxGeometry( 2, 2, 0 );
						var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
						var object = new THREE.Mesh( geometry, material );


						oObjects.push(object);
						controller.Canvas.Scene.add( oObjects[oObjects.length - 1] );

						if(i == 0)
						{
							oObjects[i].position.x = -3.5;
							oObjects[i].position.z = -4;
						}
						if(i == 2)
						{
							oObjects[i].position.x = 3.5;
							oObjects[i].position.z = -4;
						}
					}
				}
				else
				{
					var texture = new THREE.TextureLoader().load( '../img/'+this.Controls.image.value);
					var geometry = new THREE.BoxGeometry( 2, 2, 0 );
					var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
					var object = new THREE.Mesh( geometry, material );
					oObjects.push(object);
					controller.Canvas.Scene.add( oObjects[oObjects.length - 1] );
				}
				this.render();

				controller.Canvas.Camera.position.z = 5;

			},

			onControlChange: function(event)
			{
				if(event.target.localName === 'select')
				{
					this.createObjects();
				}
			},

			render: function()
			{
				controller.Canvas.RequestId = requestAnimationFrame(this.render.bind(this));
				document.body.style.backgroundColor = this.Controls.backgroundColor.value;
				controller.Canvas.Scene.background = new THREE.Color(this.Controls.backgroundColor.value);

				if(controller.Audio.freqData[this.Controls.BassIndex.value] > this.Controls.BassOffset.value)
				{
					var randomShake = Math.floor((Math.random() * 2) + 1);
					for(var i = 0; i < oObjects.length; i++)
					{
						oObjects[i].position.z = controller.Audio.freqData[2] / 90;
						if(this.Controls.image.value === 'All')
						{
							if(oObjects.length > 1 && i != 1)
							{
								oObjects[i].position.z = oObjects[i].position.z - 5;
								if(i === 0)
								{
									oObjects[i].position.x = -3.5 - (controller.Audio.freqData[1] / 60);
								}
								if(i === 2)
								{
									oObjects[i].position.x = 3.5 + (controller.Audio.freqData[1] / 60);
								}
							}	
						}
						if(controller.Audio.freqData[this.Controls.ShakeIndex.value] > this.Controls.ShakeOffset.value)
						{
							if(randomShake === 1)
							{
								oObjects[i].rotation.z = (this.Controls.ShakeWeight.value / 100);
							}
							else
							{
								oObjects[i].rotation.z = -(this.Controls.ShakeWeight.value / 100);
							}
						}
						else
						{
							oObjects[i].rotation.z = 0;
						}
					}
				}
				controller.Canvas.Renderer.render(controller.Canvas.Scene, controller.Canvas.Camera);
			}
		}
	},

	Audio:
	{
		freqData: {},
		Mode: 'Local',
		AudioStream: null,

		Init: function()
		{
			controller.Audio[this.Mode].Init();

			controller.Audio.AudioStream.onended = function(event)
			{
				for(var i = 0; i < controller.UI.selectTrack.children.length; i++)
				{
					if(controller.UI.selectTrack.children[i].selected)
					{

						if(i === 0)
						{
							controller.UI.selectTrack.selectedIndex = (controller.UI.selectTrack.children.length > 1 ? 1 : 0);
						}
						else if(i === controller.UI.selectTrack.children.length - 1)
						{
							controller.UI.selectTrack.selectedIndex = 0;
						}
						else
						{
							controller.UI.selectTrack.selectedIndex = controller.UI.selectTrack.selectedIndex + 1;
						}
						controller.Audio[controller.Audio.Mode].playTrack(controller.UI.selectTrack.value);
						return;
					}
				}
			};
			controller.UI.setAudioInformation(controller.Audio[this.Mode].Data, true);
		},

		prepareFrequencyData: function()
		{
			this.ctx = new AudioContext();
			this.analyser = this.ctx.createAnalyser();

			this.source = this.ctx.createMediaElementSource(this.AudioStream);
			this.source.connect(this.analyser);
			this.analyser.connect(this.ctx.destination);

			this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

			this.render();
		},

		playTrack: function(src)
		{
			this[controller.Audio.Mode].playTrack(src);
			this.prepareFrequencyData();
		},

		render: function()
		{
			requestAnimationFrame(this.render.bind(this));
			if(controller.Socket.status === 'Joined' && controller.Socket.hostData !== null)
			{
				this.freqData = controller.Socket.hostData;
			}
			else
			{
				fbc_array = new Uint8Array(this.analyser.frequencyBinCount);
				this.analyser.getByteFrequencyData(fbc_array);
				this.freqData = fbc_array;
				if(controller.Socket.status === 'Hosting')
				{
					controller.Socket.socket.emit('HostData', JSON.stringify(fbc_array));
				}
			}
		},

		Local:
		{
			Data: null,
			Init: function()
			{
				this.loadData(false);

				controller.Audio.AudioStream = new Audio();

				setInterval(function()
				{
					if(controller.Audio.Mode === 'Local')
					{
						controller.Audio.Local.loadData(true, function()
						{
							controller.UI.setAudioInformation(controller.Audio.Local.Data, false);
						});
					}
				}, 1000);
			},

			playTrack: function(src)
			{
				controller.Audio.AudioStream.src = src;
				controller.Audio.AudioStream.play();
			},

			loadData: function(async, callback)
			{
				$.ajax({
					async: async,
					url: '../audio/tracks.js',
					dataType: 'script',
					success: function()
					{
						if(JSON.stringify(controller.Audio.Local.Data) !== JSON.stringify(globalLocalTracks))
						{
							controller.Audio.Local.Data = globalLocalTracks;
							if(callback)
							{
								callback();
							}
						}
					}
				});
				
			}
		}
	},
    Socket:
    {
    	socket: null,
    	status: null,
    	room: null,
    	hostData: null,

        Init: function()
        {
        	this.socket = io();
        },
        Host: function()
        {
        	this.Init();
        	this.socket.on('ConnectionReady', function()
        	{
        		controller.Socket.socket.emit('Host');
        	});
        	this.socket.on('HostReady', function()
        	{
        		controller.Socket.status = 'Hosting';
        		controller.UI.ConnectionDiv.appendChild(newElement('span', {innerText: 'Hosting on Channel: '+controller.Socket.socket.id}));
        	});
        },
        Join: function()
        {
        	this.Init();
        	this.socket.on('HostDataReady', function(data)
        	{
        		controller.Socket.hostData = JSON.parse(data);
        	});
        	this.socket.on('ConnectionReady', function(data)
        	{
        		var rooms = JSON.parse(data);
        		var JoinSpan = newElement('span', {innerText: 'Channel:'});
        		var JoinSelect = newElement('select', {onchange: function()
    			{
    				controller.Socket.room = JoinSelect.children[JoinSelect.selectedIndex].value;
    				controller.Socket.socket.emit('Join', controller.Socket.room);
    			}});
        		JoinSelect.appendChild(newElement('option', {value: '-----', innerHTML: '-----'}));
        		for(room in rooms)
        		{
        			// Own (public) room
        			if(room == controller.Socket.socket.id)
        			{
        				continue;
        			}
        			JoinSelect.appendChild(newElement('option', {value: room, innerHTML: room}));
        		}
        		controller.UI.ConnectionDiv.appendChild(JoinSpan);
        		controller.UI.ConnectionDiv.appendChild(JoinSelect);
        	});
        	this.socket.on('JoinReady', function()
        	{
        		controller.Socket.status = 'Joined';
        	})
        }
    }
}

function Init()
{
	controller.Init();
}

function newElement(type, options, styleOptions)
{
	var elem = document.createElement(type);
	for(option in options)
	{
		elem[option] = options[option];
	}
	for(styleOption in styleOptions)
	{
		elem.style[styleOption] = styleOptions[styleOption];
	}
	return elem;
}