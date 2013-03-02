ready = null;

STATUS_PLAY = 1;
STATUS_STOP = 2;

I_UNISON = 0;
I_MIN_2 = 1;
I_2 = 2;
I_MIN_3 = 3;
I_3 = 4;
I_4 = 5;
I_DIM_5 = 6;
I_5 = 7;
I_MIN_6 = 8;
I_6 = 9;
I_MIN_7 = 10;
I_7 = 11;
I_OCTAVE = 12;

function truncate(n) {
  return n | 0; // bitwise operators convert operands to 32-bit integers
}

function interval_name(interval) {
	names = {
		0: 'Unison',
		1: 'Minor 2nd',
		2: 'Major 2nd',
		3: 'Minor 3rd',
		4: 'Major 3rd',
		5: 'Perfect 4th',
		6: 'Dim 5th',
		7: 'Perfect 5th',
		8: 'Minor 6th',
		9: 'Major 6th',
		10: 'Minor 7th',
		11: 'Major 7th',
		12: 'Octave'
	}
	console.log(names);
	return names[Math.abs(interval)]
}

function note_name(note) {
	// midi note number to note name
	names = {
		0: 'C',
		1: 'Db',
		2: 'D',
		3: 'Eb',
		4: 'E',
	    5: 'F',
		6: 'Gb',
		7: 'G',
		8: 'Ab',
		9: 'A',
		10: 'Bb',
		11: 'B'
	};
	return names[note % 12] + (truncate(note/12)-5);
}

var ControlPanelView = Backbone.View.extend({
/*
.btn-start-stop -> start/stop animation
.btn-reset -> reset animation (time=0)
*/
  initialize: function(){
    this.status = STATUS_STOP;
    this.repeat_time = 5000;
	this.note = 50;  // start note
	this.min_note = 20;
	this.max_note = 100;
    this.intervals = {
    };
	this.intervals[I_MIN_2] = true;
	this.intervals[I_2] = true;
	this.intervals[I_MIN_3] = true;
	this.intervals[I_3] = true;
	this.intervals[I_4] = true;
	this.intervals[I_DIM_5] = true;
	this.intervals[I_5] = true;

	this.intervals[-I_MIN_2] = true;
	this.intervals[-I_2] = true;
	this.intervals[-I_MIN_3] = true;
	this.intervals[-I_3] = true;
	this.intervals[-I_4] = true;
	this.intervals[-I_DIM_5] = true;
	this.intervals[-I_5] = true;
	
	console.log(this.intervals);
  },
  events: {
    "click .btn-start-stop": "doStartStop",
    "click .btn-reset": "reset"
    },
  doStartStop: function() {
    if (this.status == STATUS_STOP) {
      console.log('play');
      this.status = STATUS_PLAY;
      this.$el.find("a.btn-start-stop i").removeClass("icon-play");
      this.$el.find("a.btn-start-stop i").addClass("icon-pause");
      this.$el.find("#html-start-stop").html("Pause");
      this.play_notes(this)();  // run it!!
    } else {
      console.log('stop');
      this.$el.find("a.btn-start-stop i").addClass("icon-play");
      this.$el.find("a.btn-start-stop i").removeClass("icon-pause");
      this.$el.find("#html-start-stop").html("Start");
      this.status = STATUS_STOP;
    }
  },
  reset: function() {
	
  },
  choose_interval: function() {
    var result;
    var count = 0;
    for (var prop in this.intervals)
        if (Math.random() < 1/++count)
           result = prop;
    return parseInt(result);
  },
  play_notes: function (me) {
    // Because we use callbacks, it is important to use 'me'.
    fun = function() {    
      if (me.status == STATUS_PLAY) {
		// pick new note
		var interval;
		interval = me.choose_interval();
        console.log('playing note: ' + note_name(me.note) + ', interval from last: ' + interval_name(interval));
        
        // most important part: interact with OpenLayers.
        play_note(me.note);
		setTimeout(function(){
			play_note(me.note + interval); 
			me.note += interval;  // set this as starting point as new root
		}, 1000);
        
		
      } else {
        return;  // Animation has stopped
      }
      setTimeout(me.play_notes(me), me.repeat_time); // Setting next step. animation speed in ms
    }
    return fun;
  }
});

function play_note(note) {
	if (ready === null) {
		console.log('error: MIDI not initialized yet.')
		return;
		}
	var delay = 0; // play one note every quarter second
	var note = note; // the MIDI note
	var velocity = 127; // how hard the note hits
	// play the note
	MIDI.setVolume(0, 127);
	MIDI.noteOn(0, note, velocity, delay);
	MIDI.noteOff(0, note, delay + 0.75);
	
}

function init() {
	console.log('Initializing MIDI.js...');
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		callback: function() {
			ready = true;
			console.log('Initialized!');
/*			var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75); */
		}
	});
};

function init_control_panel() {
  // Bind the control panel to the view.
  control_panel_view = new ControlPanelView({el: $('#controlpanel')});
  //control_panel_view = new ControlPanelView({el: $('#controlpanel2')});
}


$(document).ready(function() {
  init();
  init_control_panel();
});