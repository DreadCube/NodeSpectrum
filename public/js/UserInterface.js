// UI object (user interface)
var UI = {
	setAudioInformation: function(data, playTrack) {

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
			AudioObject.Local.playTrack(tracks[0]['src']);
		}
	},

	initBasicConnectionControls: function() {
		var that = this;

		this.ConnectionDiv = newElement('div', {className: 'box boxBottom'});
		this.ConnectionDiv.appendChild(newElement('span', {className: 'text textBorder', innerText: 'Socket'}));

		var modeSpan = newElement('span', {innerText: 'Mode', className: 'text'});
		var selectMode = newElement('select', {onchange: function(event)
		{
			Socket.Disconnect();
		    switch(selectMode.children[selectMode.selectedIndex].value)
		    {
		        case 'Host':  Socket.Host(); break;
		        case 'Join':  Socket.Join(); break;
		        default: break;
		    }
		}});
		selectMode.appendChild(newElement('option', {value: 'None', innerText: 'None'}));
		selectMode.appendChild(newElement('option', {value: 'Host', innerText: 'Host'}));
		selectMode.appendChild(newElement('option', {value: 'Join', innerText: 'Join'}));
		modeSpan.appendChild(selectMode);
		this.ConnectionDiv.appendChild(modeSpan);

		document.body.appendChild(this.ConnectionDiv);
	},

	initBasicAudioControls: function() {
		var that = this;
		this.AudioDiv = newElement('div', {className: 'box boxLeft'});
		this.AudioDiv.appendChild(newElement('span', {className: 'text textBorder', innerText: 'Audio'}));
		
		var modeSpan = newElement('span', {innerText: 'Mode', className: 'text'});
		var selectMode = newElement('select', {id: 'audioModeSelect', onchange: function() {
			that.cleanup(AudioObject.Mode);
			AudioObject.Mode = this.children[this.selectedIndex].value;
			switch(AudioObject.Mode) {
				case 'Local': that.initModeLocalControls(); break;
				case 'Mic': that.initModeMicrophoneControls(); break;
			}
			AudioObject.Init();
		}});
		selectMode.appendChild(newElement('option', {value: 'Local', innerText: 'Local'}));
		selectMode.appendChild(newElement('option', {value: 'Mic', innerText: 'Mic'}));
		modeSpan.appendChild(selectMode);
		this.AudioDiv.appendChild(modeSpan);

        var spanVolume = newElement('span', {innerText:'Volume', className: 'text'});
        var rangeVolume = newElement('input', {type: 'range', min: 0, max: 1.0, step: 0.05, defaultValue: 1, onchange: function(event)
        {
            AudioObject.AudioStream.volume = event.target.value;
        }, oninput: function(event) {
            AudioObject.AudioStream.volume = event.target.value;
        }});
        spanVolume.appendChild(rangeVolume);
        this.AudioDiv.appendChild(spanVolume);

		document.body.appendChild(this.AudioDiv);
		this.initModeLocalControls();
		AudioObject.Init();
	},

	initModeLocalControls: function() {
		var that = this;
		var spanPlaylist = newElement('span', {innerText: 'Playlist', className: 'text'});
		this.selectPlaylist = newElement('select', {id: 'selectPlaylist', onchange: function(event)
		{
			var data = AudioObject[AudioObject.Mode].Data;
			var tracks = data[event.target.value];
			that.selectTrack.innerHTML = '';
			for(var i = 0; i < tracks.length; i++)
			{
				var optionTrack = newElement('option', {value: tracks[i]['src'], innerText: tracks[i]['name']});
				that.selectTrack.appendChild(optionTrack);
			}
			AudioObject[AudioObject.Mode].playTrack(tracks[0]['src']);
		}});
		spanPlaylist.appendChild(this.selectPlaylist);
		this.AudioDiv.appendChild(spanPlaylist);

		var spanTrack = newElement('span', {innerText: 'Track', className: 'text'});
		this.selectTrack = newElement('select', {id: 'selectTrack', onchange: function(event)
		{
			AudioObject[AudioObject.Mode].playTrack(event.target.value);
		}});
		spanTrack.appendChild(this.selectTrack);
		this.AudioDiv.appendChild(spanTrack);
	},

	initModeMicrophoneControls: function()
	{

	},
	
	cleanup: function(target)
	{
		switch(target)
		{
			case 'Local':
				$('#selectPlaylist').parent().remove();
				$('#selectTrack').parent().remove();
			break;
		}
	},

	initBasicCanvasControls: function() {
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

		var selectMode = newElement('select', {id: 'spektrumModeSelect', value: Canvas.Mode, onchange: function(event)
		{
			Canvas.Mode = event.target.value;
			UI.initBasicCanvasControls();
			UI.initModeCanvasControls();
			Canvas.Init();
		}});
		modeSpan.appendChild(selectMode);

		var optionMode = newElement('option', {value: 'Bars', innerText: 'Bars'});
		selectMode.appendChild(optionMode);

		var optionMode = newElement('option', {value: 'BassBox', innerText: 'Suupa BassBox'});
		selectMode.appendChild(optionMode);

		var childs = document.getElementById('spektrumModeSelect').children;
		for(var i = 0; i < childs.length; i++)
		{
			if(childs[i].value === Canvas.Mode)
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
			that.loadTemplateByTemplateId(event.target.value);
		}});

		var templateOption = newElement('option', {id: 'none', innerHTML: 'none'});
		selectTemplate.appendChild(templateOption);

		for(var key in localStorage)
		{
			if(key.substring(0, ('template.'+Canvas.Mode+'.').length) === 'template.'+Canvas.Mode+'.')
			{
				var templateOption = newElement('option', {id: key.replace('template.'+Canvas.Mode+'.', ''), innerHTML: key.replace('template.'+Canvas.Mode+'.', '')});
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

		var active = true;
		document.body.onkeydown = function(event) {
			if(event.keyCode === 32) {
				if(active === true) {
					UI.mainDiv.className = 'box boxRight animated fadeOut';
					UI.AudioDiv.className = 'box boxLeft animated fadeOut';
					UI.ConnectionDiv.className = 'box boxBottom animated fadeOut';
					active = false;
				} else {
					UI.mainDiv.className = 'box boxRight animated fadeIn';
					UI.AudioDiv.className = 'box boxLeft animated fadeIn';				
					UI.ConnectionDiv.className = 'box boxBottom animated fadeIn';
					active = true;
				}
			}
		}
	},

	initModeCanvasControls: function() {
		if(this.ModeDiv) {
			this.ModeDiv.remove();
		}
		this.ModeDiv = newElement('div', {id: 'ModeDiv'});
		this.mainDiv.appendChild(this.ModeDiv);
		for(var control in window['Canvas'][Canvas.Mode]['Controls']) {
			var controlSpan = newElement('span', {className: 'text', innerHTML: window['Canvas'][Canvas.Mode]['Controls'][control]['label']});
			this.ModeDiv.appendChild(controlSpan);

			var controlInput = null;
			if(window['Canvas'][Canvas.Mode]['Controls'][control].type === 'select') {
				controlInput = newElement('select');
				var options = window['Canvas'][Canvas.Mode]['Controls'][control]['options'];
				for(var i = 0; i < options.length; i++) {
					selectInput = newElement('option', {value: options[i].value, innerHTML: options[i].label});
					controlInput.appendChild(selectInput);
				}
			} else {
				controlInput = newElement('input');
			}
			controlInput.className = 'control';
			controlInput.id = control;

			for(var property in window['Canvas'][Canvas.Mode]['Controls'][control]) {
				controlInput[property] = window['Canvas'][Canvas.Mode]['Controls'][control][property];
			}
			if(controlInput.type === 'checkbox') {
				controlInput['checked'] = (controlInput['value'] === 'true' ? true : false);
			}
			controlInput['alt'] = controlInput['value'];
			var that = this;

			controlInput.oninput = function(event, attr) {
				that.onInputChange(event, attr);
			};

			controlInput.onchange = function(event, attr) {
				that.onInputChange(event, attr);
			};

			if(controlInput.type == 'range') {
				var rangeValue = newElement('span', { innerHTML: controlInput.value }, {display: 'block', fontSize: 15, textShadow: 'none'});
				controlSpan.appendChild(rangeValue);
			}
			controlSpan.appendChild(controlInput);
		}

		//Color Picker Haxxx
		$('input[type="color"]').each(function(index, elem) {
		   $(elem).spectrum({
		        color: elem.value,
		        flat: true,
		        allowEmpty: true,
		        showPalette: true,
		        showButtons: false
		    });

		    $(elem).on('move.spectrum', function(e, tinycolor) {
		    	e.target.value = tinycolor.toHexString();
				$('#'+e.target.id).trigger('change');
		    });
		});
	},

	onInputChange: function(event, attr) {
		if(typeof attr === 'undefined') {
			if(event.target.type === 'range') {
				event.target.previousElementSibling.innerHTML = event.target.value;
			}
			window['Canvas'][Canvas.Mode]['Controls'][event.target.id]['value'] = (event.target.type === 'checkbox' ? event.target.checked : event.target.value);
			event.target.alt = event.target.value;
			if(window['Canvas'][Canvas.Mode]['Controls'][event.target.id]['changeEvent'] && window['Canvas'][Canvas.Mode]['onControlChange']) {
				window['Canvas'][Canvas.Mode].onControlChange(event);
			}
		}
	},

	loadTemplateByTemplateId: function(templateId) {
		this.loadTemplate(localStorage.getItem('template.'+Canvas.Mode+'.'+templateId));
	},

	loadTemplate: function(templateData) {
		var templateData = JSON.parse(templateData);
		var controls = document.getElementsByClassName('control');
		for(var control in templateData) {
			if(typeof(templateData[control]) !== 'boolean') {
				if(!isNaN(templateData[control])) {
					templateData[control] = Number(templateData[control]);
				}
			}
			window['Canvas'][Canvas.Mode]['Controls'][control]['value'] = templateData[control];

			if(window['Canvas'][Canvas.Mode]['Controls'][control]['changeEvent'] && window['Canvas'][Canvas.Mode]['onControlChange']) {
				var ev = {target: document.getElementById(control)};
				window['Canvas'][Canvas.Mode].onControlChange(ev);
			}
		}
		this.initModeCanvasControls();
	},

	currentDesignToJson: function() {
		var templateData = {};
		var controls = document.getElementsByClassName('control');

		for(var i = 0; i < controls.length; i++) {
			var value = (controls[i].type === 'color' ? controls[i].alt : controls[i].value);
			templateData[controls[i].id] = (controls[i].type === 'checkbox' ? controls[i].checked : value);
		}
		return JSON.stringify(templateData);
	},

	saveTemplate: function(templateId) {
		if(templateId === '') {
			return false;
		}

		localStorage.setItem('template.'+Canvas.Mode+'.'+templateId, this.currentDesignToJson());
		var optionTemplate = document.createElement('option');
		optionTemplate.id = templateId;
		optionTemplate.innerHTML = templateId;
		optionTemplate.selected = true;
		var opt = document.querySelectorAll('select[id=selectTemplateInput] > option[id='+templateId+']')[0];
		if(opt) {
			document.getElementById('selectTemplateInput').removeChild(opt);
		}
		document.getElementById('selectTemplateInput').appendChild(optionTemplate);
	},

	Init: function() {
		this.initBasicCanvasControls();
		this.initModeCanvasControls();
		this.initBasicAudioControls();
		this.initBasicConnectionControls();
	}
};

function newElement(type, options, styleOptions) {
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