'use strict';

app.controller('midiCtrl', function($scope, $location, AuthFactory) {

  $scope.title = "MIDI";

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var notes = new Map();
  var Note = function() {
    function Note(number) {
      var velocity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      _classCallCheck(this, Note);
      this.osc = ac.createOscillator();
      this.osc.frequency.value = 440 * Math.pow(2, (number - 69) / 12);
      this.osc.type = 'square';
      this.gain = ac.createGain();
      this.gain.gain.value = velocity;
      this.osc.connect(this.gain);
      this.gain.connect(volume);
      this.osc.start();
    }
    Note.prototype.stop = function stop() {
      this.osc.stop(ac.currentTime);
      this.gain.disconnect();
      this.osc.disconnect();
    };
    return Note;
  }();
  var Instrument = function() {
    function Instrument() {
      // _classCallCheck(this, Instrument);
    }
    Instrument.prototype.on = function on(number, velocity) {
      this.off(note);
      var note = new Note(number, Math.pow(velocity / 127, 1));
      notes.set(number, note);
    };
    Instrument.prototype.off = function off(number, velocity) {
      var note = notes.get(number, Math.pow(velocity / 127, 1));
      if (note) {
        note.stop();
        notes.delete(number, note);
      }
    };
    return Instrument;
  }();
  var ac = new AudioContext();
  var volume = ac.createGain();
  volume.connect(ac.destination);
  volume.gain.value = 0.25;
  var piano = new Instrument();
  var message = document.querySelector('.message');
  if (!navigator.requestMIDIAccess)
    message.innerHTML = 'Web MIDI API not supported.<br><a href=\'http://caniuse.com/#feat=midi\'>http://caniuse.com/#feat=midi</a>';
  navigator.requestMIDIAccess().then(function(m) {
    console.log("m.inputs.size: ", m.inputs.size);
    m.onstatechange = function(e) {
      reconnect();
    };
    reconnect();

    function reconnect() {
      m.inputs.forEach(function(input) {
        return input.removeEventListener('midimessage', midiMessage);
      });
      m.inputs.forEach(function(input) {
        return input.addEventListener('midimessage', midiMessage);
      });
    }
  });

  function midiMessage(event) {
    if (event.data[0] === 144)
      piano.on(event.data[1], event.data[2]);
    if (event.data[0] === 128)
      piano.off(event.data[1], event.data[2]);
  }



/*****************************************************************
            PIANO
  *****************************************************************/




  let keyboardContext = new AudioContext();
  // let keyboard = new QwertyHancock({
  //   id: 'keyboard',
  //   octaves: 2
  // });



  let oscType = "square"; //default wave type

  let F3 = 174.614,
    F3sh = 184.997,
    G3 = 195.998,
    G3sh = 207.652,
    A3 = 220,
    A3sh = 233.082,
    B3 = 246.942,
    C4 = 261.626,
    C4sh = 277.183,
    D4 = 293.665,
    D4sh = 311.127,
    E4 = 329.628,
    F4 = 349.228,
    F4sh = 369.994,
    G4 = 391.995,
    G4sh = 415.305,
    A4 = 440,
    A4sh = 466.164,
    B4 = 493.883,
    C5 = 523.251,
    C5sh = 554.365,
    D5 = 587.330,
    D5sh = 622.254,
    E5 = 659.255;


  /********************************************
        RADIO BUTTONS CHOOSING WAVE FORM
  **********************************************/

  $('input[type=radio]').click(function() {
    if (this.id === 'Sine') {
      oscType = "sine";
    } else if (this.id === 'Square') {
      oscType = "square";
    } else if (this.id === 'Saw') {
      oscType = "sawtooth";
    } else if (this.id === 'Triangle') {
      oscType = "triangle";
    }
    return oscType;
  });




  // var keyboardContext = new AudioContext(),
  //   masterVolume = keyboardContext.createGain();

  // masterVolume.gain.value = 0.3;
  // masterVolume.connect(keyboardContext.destination);



  // var oscillators = {};

  // keyboard.keyDown = function(note, frequency) {

  //   var osc = keyboardContext.createOscillator();
  //   // osc2 = keyboardContext.createOscillator();
  //   osc.type = oscType;
  //   osc.frequency.value = frequency;
  //   // osc.type = 'square';

  //   // osc2.frequency.value = frequency;
  //   // osc2.type = 'square';

  //   osc.connect(masterVolume);
  //   // osc2.connect(masterVolume);

  //   masterVolume.connect(keyboardContext.destination);

  //   // oscillators[frequency] = [osc, osc2];
  //   oscillators[frequency] = [osc];
  //   osc.start(keyboardContext.currentTime);
  //   // osc2.start(keyboardContext.currentTime);
  //   osc.detune.value = -10;
  //   // osc2.detune.value = 10;
  // };

  // keyboard.keyUp = function(note, frequency) {
  //   oscillators[frequency].forEach(function(oscillator) {
  //     oscillator.stop(keyboardContext.currentTime);
  //   });
  // };




  /********************************************
            Keyboard Event Listener SHARPS
  **********************************************/

  // addEventListener("keydown", function() {
  //   if (event.keyCode === 49) {
  //     $('#F3sh').addClass('nick2');
  //     keyPlay(F3sh);
  //   } else if (event.keyCode === 50) {
  //     $('#G3sh').addClass('nick2');
  //     keyPlay(G3sh);
  //   } else if (event.keyCode === 51) {
  //     $('#A3sh').addClass('nick2');
  //     keyPlay(A3sh);
  //   } else if (event.keyCode === 53) {
  //     $('#B3sh').addClass('nick2');
  //     keyPlay(C4sh);
  //   } else if (event.keyCode === 54) {
  //     $('#C4sh').addClass('nick2');
  //     keyPlay(D4sh);
  //   } else if (event.keyCode === 56) {
  //     $('#D4sh').addClass('nick2');
  //     keyPlay(F4sh);
  //   } else if (event.keyCode === 57) {
  //     $('#E4sh').addClass('nick2');
  //     keyPlay(G4sh);
  //   } else if (event.keyCode === 48) {
  //     $('#F4sh').addClass('nick2');
  //     keyPlay(A4sh);
  //   } else if (event.keyCode === 187) {
  //     $('#G4sh').addClass('nick2');
  //     keyPlay(C5sh);
  //   } else if (event.keyCode === 8) {
  //     $('#A4sh').addClass('nick2');
  //     keyPlay(D5sh);
  //   }
  // });

  /********************************************
            Keyboard Event Listener
  **********************************************/


  addEventListener("keydown", function() {
    if (event.keyCode === 9) {
      $('#F3').addClass('close4');
      keyPlay(F3);
    } else if (event.keyCode === 81) {
      $('#G3').addClass('nick');
      keyPlay(G3);
    } else if (event.keyCode === 87) {
      $('#A3').addClass('nick');
      keyPlay(A3);
    } else if (event.keyCode === 69) {
      $('#B3').addClass('nick');
      keyPlay(B3);
    } else if (event.keyCode === 82) {
      $('#C4').addClass('close5');
      keyPlay(C4);
    } else if (event.keyCode == 84) {
      $('#D4').addClass('nick');
      keyPlay(D4);
    } else if (event.keyCode === 89) {
      $('#E4').addClass('nick');
      keyPlay(E4);
    } else if (event.keyCode === 85) {
      $('#F4').addClass('close3');
      keyPlay(F4);
    } else if (event.keyCode === 73) {
      $('#G4').addClass('close1');
      keyPlay(G4);
    } else if (event.keyCode === 79) {
      $('#A4').addClass('close2');
      keyPlay(A4);
    } else if (event.keyCode === 80) {
      $('#B4').addClass('nick');
      keyPlay(B4);
    } else if (event.keyCode === 219) {
      $('#C5').addClass('nick');
      keyPlay(C5);
      // } else if (event.keyCode === 221) {
      //   $('#D5').addClass('nick');
      //   keyPlay(D5);
      // } else if (event.keyCode === 220) {
      //   $('#E5').addClass('nick');
      //   keyPlay(E5);
    }

  });



  /********************************************
  Keyboard play note and listen for Keyup to stop
  **********************************************/


  function keyPlay(frequency) {
    var oscillator = keyboardContext.createOscillator();
    oscillator.type = oscType;
    oscillator.frequency.value = frequency;


    var osc = keyboardContext.createOscillator();
    var vol = keyboardContext.createGain();
    var panner = keyboardContext.createStereoPanner();
    var freqGain = keyboardContext.createGain();
    var lfo = keyboardContext.createOscillator();
    var distortion = keyboardContext.createWaveShaper();


    // get html controls
    var volControl = document.getElementById("volume");
    var panControl = document.getElementById("panner");

    //PANNER
    panner.connect(keyboardContext.destination);

    // VOLUME
    vol.gain.value = volControl.value;
    vol.connect(panner);

    //distortion
    distortion.oversample = '4x';
    distortion.connect(vol);

    oscillator.connect(distortion);


    // LISTENERS
    volControl.addEventListener("input", function() {
      vol.gain.value = volControl.value;
    });

    panControl.addEventListener("input", function() {
      panner.pan.value = panControl.value;
    });



    oscillator.start();

    // var oscillators = {};

    // keyboard.keyDown = function(note, frequency) {

    //   var osc = keyboardContext.createOscillator();
    //   // osc2 = keyboardContext.createOscillator();
    //   osc.type = oscType;
    //   osc.frequency.value = frequency;
    //   // osc.type = 'square';

    //   // osc2.frequency.value = frequency;
    //   // osc2.type = 'square';

    //   osc.connect(masterVolume);
    //   // osc2.connect(masterVolume);

    //   masterVolume.connect(keyboardContext.destination);

    //   // oscillators[frequency] = [osc, osc2];
    //   oscillators[frequency] = [osc];
    //   osc.start(keyboardContext.currentTime);
    //   // osc2.start(keyboardContext.currentTime);
    //   osc.detune.value = -10;
    //   // osc2.detune.value = 10;
    // };

    // keyboard.keyUp = function(note, frequency) {
    //   oscillators[frequency].forEach(function(oscillator) {
    //     oscillator.stop(keyboardContext.currentTime);
    //   });
    // };


    addEventListener("keyup", function(event) {
      if (event.keyCode === 9) {
        $('#F3').removeClass('close4');
      } else if (event.keyCode === 81) {
        $('#G3').removeClass('nick');
      } else if (event.keyCode === 87) {
        $('#A3').removeClass('nick');
      } else if (event.keyCode === 69) {
        $('#B3').removeClass('nick');
      } else if (event.keyCode === 82) {
        $('#C4').removeClass('close5');
      } else if (event.keyCode === 84) {
        $('#D4').removeClass('nick');
      } else if (event.keyCode === 89) {
        $('#E4').removeClass('nick');
      } else if (event.keyCode === 85) {
        $('#F4').removeClass('close3');
      } else if (event.keyCode === 73) {
        $('#G4').removeClass('close1');
      } else if (event.keyCode === 79) {
        $('#A4').removeClass('close2');
      } else if (event.keyCode === 80) {
        $('#B4').removeClass('nick');
      } else if (event.keyCode === 219) {
        $('#C5').removeClass('nick');
      } else if (event.keyCode === 221) {
        $('#D5').removeClass('nick');
      } else if (event.keyCode === 220) {
        $('#E5').removeClass('nick');
      } else if (event.keyCode === 49) {
        $('#G3').removeClass('nick');
      } else if (event.keyCode === 50) {
        $('#A3').removeClass('nick');
      } else if (event.keyCode === 51) {
        $('#B3').removeClass('nick');
      } else if (event.keyCode === 53) {
        $('#C4').removeClass('nick');
      } else if (event.keyCode === 54) {
        $('#D4').removeClass('nick');
      } else if (event.keyCode === 56) {
        $('#E4').removeClass('nick');
      } else if (event.keyCode === 57) {
        $('#F4').removeClass('nick');
      } else if (event.keyCode === 48) {
        $('#G4').removeClass('nick');
      } else if (event.keyCode === 187) {
        $('#A4').removeClass('nick');
      } else if (event.keyCode === 8) {
        $('#A4').removeClass('nick');
      }
      oscillator.stop();


    });

  }


});
