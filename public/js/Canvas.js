// canvas object
var Canvas = {
	Mode: 'Bars',
	prevSubtitle: null,

	Init: function() {
		if(this.RequestId) {
			window.cancelAnimationFrame(this.RequestId);
		}

		addEventListener( 'resize', this.onWindowResize, false );

		this.Scene = null;
		this.Camera = null;
		this.Renderer = null;
		this.RequestId = null;

		window['Canvas'][this.Mode].startup();
	},

	onWindowResize: function() {
		Canvas.Camera.aspect = window.innerWidth / window.innerHeight;
		Canvas.Camera.updateProjectionMatrix();
		Canvas.Renderer.setSize( window.innerWidth, window.innerHeight );
	},

	createSubtitleObject: function(text, options, scene) {
		var loader = new THREE.FontLoader();

		var that = this;
		this.text = text;
		this.options = options;
		loader.load( 'css/fonts/'+this.options.font, function ( font ) {

			var text = that.text;
			that.options.textGeometry.font = font;
			var geometry = new THREE.TextGeometry(text, that.options.textGeometry);
			geometry.center();
			//THREE.GeometryUtils.geometry.center(geometry);
			geometry.computeBoundingBox();

				var material = new THREE.MultiMaterial( [
					new THREE.MeshBasicMaterial( { color: that.options.color, overdraw: 0.5 } ),
					new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
				] );

			var mesh = new THREE.Mesh(geometry, material);
			mesh.name = 'subtitles';
			mesh.position.x = Canvas.Camera.position.x,
			mesh.position.y = Canvas.Camera.position.y - 30;
			mesh.position.z = Canvas.Camera.position.z - 100;

			scene.add(mesh);
		});
	},

	Bars: {
		Controls: {
			barsNumber: {
				type: 'range',
				min: 1,
				max: 1000,
				value: 74,
				label: 'Number',
				changeEvent: true
			},
			barsBreite: {
				type: 'range',
				min: 0,
				max: 100,
				value: 1,
				label: 'Breite',
				changeEvent: true
			},
			barsHoehe: {
				type: 'range',
				min: 1,
				max: 50,
				value: 8,
				label: 'Hoehe',
				changeEvent: true
			},
			barsSpace: {
				type: 'range',
				min: 1,
				max: 100,
				value: 2,
				label: 'Space',
				changeEvent: true
			},
			barsColor: {
				type: 'color',
				value: '#00FF00',
				label: 'Color'
			},

			barsBackgroundColor: {
				type: 'color',
				value: '#000000',
				label: 'Background'
			},

			rotSpeedX: {
				type: 'range',
				min: -100,
				max: 100,
				value: 0,
				label: 'Rot. Speed X'
			},

			rotSpeedY: {
				type: 'range',
				min: -100,
				max: 100,
				value: 0,
				label: 'Rot. Speed Y'
			},

			rotSpeedZ: {
				type: 'range',
				min: -100,
				max: 100,
				value: 0,
				label: 'Rot. Speed Z'
			},

			cameraX: {
				type: 'range',
				min: -10000,
				max: 10000,
				value: 100,
				label: 'Camera Pos. X'
			},

			cameraY: {
				type: 'range',
				min: -1000,
				max: 1000,
				value: 0,
				label: 'Camera Pos. Y'
			},

			cameraZ: {
				type: 'range',
				min: -1000,
				max: 1000,
				value: 100,
				label: 'Camera Pos. Z'
			},

			wireframe: {
				type:'checkbox',
				value: false,
				label: 'Wireframe',
				changeEvent: true
			},

			subtitle: {
				type: 'checkbox',
				value: false,
				label: 'Subtitles',
				changeEvent: true
			},

			subtitleColor: {
				type: 'color',
				value: '#00FF00',
				label: 'Subtitle Color',
				changeEvent: true
			},

			subtitleFontSize: {
				type: 'range',
				min: 1,
				max: 20,
				value: 5,
				label: 'Subtitle Font Size',
				changeEvent: true
			}
		},

		startup: function() {
			Canvas.Scene = new THREE.Scene();
			Canvas.Camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

			Canvas.Renderer = new THREE.WebGLRenderer();
			Canvas.Renderer.setSize( window.innerWidth, window.innerHeight );

			document.body.appendChild( Canvas.Renderer.domElement );

			this.createObjects();
			this.render();
		},

		onControlChange: function(event) {
			this.createObjects();
		},

		createObjects: function() {
			Canvas.Scene = new THREE.Scene();
			var lastElementPositionX = 0;

			var breite = this.Controls.barsBreite.value;
			var hoehe = this.Controls.barsHoehe.value;

		    for(var i = 0; i < this.Controls.barsNumber.value; i++) {
				var geometry = new THREE.BoxGeometry(breite,hoehe,breite);
				var material = new THREE.MeshBasicMaterial( { color: this.Controls.barsColor.value, wireframe: this.Controls.wireframe.value } );
			
				obj = new THREE.Mesh(geometry, material);
				obj.name = 'bar'+[i];
				obj.position.x = Number(lastElementPositionX) + Number(breite) + Number(this.Controls.barsSpace.value);
				lastElementPositionX = obj.position.x;
				Canvas.Scene.add(obj);
			}
			Canvas.prevSubtitle = '';
			this.addSubtitleObject();
		},

		addSubtitleObject: function(){

			var childs = Canvas.Scene.children;
			for(var i = 0; i < childs.length; i++) {
				if(childs[i].name === 'subtitles') {
					if(AudioObject.subtitle !== Canvas.prevSubtitle) {
						Canvas.Scene.remove(childs[i]);
					}
					continue;
				}
			}

			if(AudioObject.subtitle && AudioObject.subtitle !== Canvas.prevSubtitle && this.Controls.subtitle.value){				
				var opt = {
					textGeometry: {
						size: this.Controls.subtitleFontSize.value,
						height: 1,
						curveSegments: 2
					},					
					font: 'Geomanist.json',
					color: this.Controls.subtitleColor.value
				};
				Canvas.createSubtitleObject(AudioObject.subtitle, opt, Canvas.Scene);
				Canvas.prevSubtitle = AudioObject.subtitle;
			}
		},
		render: function() {
			Canvas.RequestId = requestAnimationFrame(this.render.bind(this));

			var childs = Canvas.Scene.children;
			for(var i = 0; i < childs.length; i++) {
				if(childs[i].name === 'subtitles') {
					if(AudioObject.subtitle !== Canvas.prevSubtitle) {
						Canvas.Scene.remove(childs[i]);
					}
					continue;
				}
				// Rotation
				childs[i].rotation.x = childs[i].rotation.x + (this.Controls.rotSpeedX.value / 1000);
				childs[i].rotation.y = childs[i].rotation.y + (this.Controls.rotSpeedY.value / 1000);
				childs[i].rotation.z = childs[i].rotation.z + (this.Controls.rotSpeedZ.value / 1000);

				//childs[i].scale.y = (this.Controls.barsHoehe.value / 200) * (AudioObject.freqData[i] / 2);
				childs[i].scale.y = (-AudioObject.freqData[i] * this.Controls.barsHoehe.value / 100);

				//Bars Color
				childs[i].material.color.set(this.Controls.barsColor.value);
			}

			this.addSubtitleObject();
			document.body.style.backgroundColor = this.Controls.barsBackgroundColor.value;
			Canvas.Scene.background = new THREE.Color(this.Controls.barsBackgroundColor.value);

			Canvas.Camera.position.x = this.Controls.cameraX.value;
			Canvas.Camera.position.y = this.Controls.cameraY.value;
			Canvas.Camera.position.z = this.Controls.cameraZ.value;
			
			Canvas.Renderer.render(Canvas.Scene, Canvas.Camera);

		}
	},

	BassBox: {
		Controls: {
			backgroundColor: {
				type: 'color',
				value: '#000000',
				label: 'Background'
			},

			image: {
				type: 'select',
				options: [
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
			BassIndex: {
				type: 'range',
				label: 'Bass Index',
				min: 1,
				max: 255,
				value: 2
			},
			BassOffset: {
				type: 'range',
				label: 'Bass Offset',
				min: 1,
				max: 255,
				value: 100
			},
			ShakeIndex: {
				type: 'range',
				label: 'Shake Index',
				min: 1,
				max: 255,
				value: 3
			},
			ShakeOffset: {
				type: 'range',
				label: 'Shake Offset',
				min: 1,
				max: 255,
				value: 230
			},
			ShakeWeight: {
				type: 'range',
				label: 'Shake Weight',
				min: 1,
				max: 100,
				value: 5
			}
		},
		direction: 'left',
		startup: function() {
			Canvas.Scene = new THREE.Scene();
			Canvas.Camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

			Canvas.Renderer = new THREE.WebGLRenderer();
			Canvas.Renderer.setSize( window.innerWidth, window.innerHeight );
	
			document.body.appendChild( Canvas.Renderer.domElement );
			this.createObjects();
			this.render();		
		},

		createObjects: function() {
			Canvas.Scene = new THREE.Scene();
			oObjects = [];
			if(this.Controls.image.value === 'All') {
				for(var i = 0; i < this.Controls.image.options.length - 1; i++) {
					var texture = new THREE.TextureLoader().load( '../img/'+ this.Controls.image.options[i].value);
					var geometry = new THREE.BoxGeometry( 2, 2, 0 );
					var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
					var object = new THREE.Mesh( geometry, material );

					oObjects.push(object);
					Canvas.Scene.add( oObjects[oObjects.length - 1] );

					if(i == 0) {
						oObjects[i].position.x = -3.5;
						oObjects[i].position.z = -4;
					}
					
					if(i == 2) {
						oObjects[i].position.x = 3.5;
						oObjects[i].position.z = -4;
					}
				}
			} else {
				var texture = new THREE.TextureLoader().load( '../img/'+this.Controls.image.value);
				var geometry = new THREE.BoxGeometry( 2, 2, 0 );
				var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
				var object = new THREE.Mesh( geometry, material );
				oObjects.push(object);
				Canvas.Scene.add( oObjects[oObjects.length - 1] );
			}
			this.render();
			Canvas.Camera.position.z = 5;
		},

		onControlChange: function(event) {
			if(event.target.localName === 'select') {
				this.createObjects();
			}
		},

		render: function() {
			Canvas.RequestId = requestAnimationFrame(this.render.bind(this));
			document.body.style.backgroundColor = this.Controls.backgroundColor.value;
			Canvas.Scene.background = new THREE.Color(this.Controls.backgroundColor.value);

			if(AudioObject.freqData[this.Controls.BassIndex.value] > this.Controls.BassOffset.value) {
				var randomShake = Math.floor((Math.random() * 2) + 1);
				
				for(var i = 0; i < oObjects.length; i++) {
					oObjects[i].position.z = AudioObject.freqData[2] / 90;

					if(this.Controls.image.value === 'All') {

						if(oObjects.length > 1 && i != 1) {
							oObjects[i].position.z = oObjects[i].position.z - 5;

							if(i === 0) {
								oObjects[i].position.x = -3.5 - (AudioObject.freqData[1] / 60);
							}

							if(i === 2) {
								oObjects[i].position.x = 3.5 + (AudioObject.freqData[1] / 60);
							}
						}	
					}
					if(AudioObject.freqData[this.Controls.ShakeIndex.value] > this.Controls.ShakeOffset.value) {
						if(randomShake === 1) {
							oObjects[i].rotation.z = (this.Controls.ShakeWeight.value / 100);
						} else {
							oObjects[i].rotation.z = -(this.Controls.ShakeWeight.value / 100);
						}
					} else {
						oObjects[i].rotation.z = 0;
					}
				}
			}
			Canvas.Renderer.render(Canvas.Scene, Canvas.Camera);
		}
	}
};