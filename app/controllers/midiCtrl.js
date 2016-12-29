'use strict';

app.controller('midiCtrl', function($scope, $location, AuthFactory) {
  $scope.title = "MIDI";
  $scope.formData = { midiOscType: "square" };
  $scope.formData1 = { midiType: '' };
  $scope.ngControls2 = { value: '' };
  $scope.dropdown = { value: '' };
  $scope.dropdown2 = { value: '' };
  let currentEffectNode = null;
  let audioInput = null;

  /*****************************************************************
  /*****************************************************************

                            MIDI controller

  *****************************************************************
  *****************************************************************/

  $scope.midiKeyboard = function() {
    let notes = new Map();
    $scope.Note = function(number) {
      let velocity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      this.osc = ac.createOscillator();

      // Math.pow() function returns the base to the exponent power
      this.osc.frequency.value = 440 * Math.pow(2, (number - 69) / 12);

      let midiOscType = $scope.formData.midiOscType;
      console.log("midiOscType: ", midiOscType);
      this.osc.type = midiOscType;
      this.gain = ac.createGain();
      this.gain.gain.value = velocity;
      this.osc.connect(this.gain);
      this.gain.connect(volume);
      this.osc.start();
    };

    $scope.Note.prototype.stop = function stop() {
      this.osc.stop(ac.currentTime);
      this.gain.disconnect();
      this.osc.disconnect();
    };

    $scope.Instrument = function() {};

    $scope.Instrument.prototype.on = function on(number, velocity) {
      this.off(note);
      var note = new $scope.Note(number, Math.pow(velocity / 127, 1));
      notes.set(number, note);
    };

    $scope.Instrument.prototype.off = function off(number, velocity) {
      let note = notes.get(number, Math.pow(velocity / 127, 1));
      if (note) {
        note.stop();
        notes.delete(number, note);
      }
    };

    let ac = new AudioContext();
    let volume = ac.createGain();
    volume.connect(ac.destination);
    volume.gain.value = 0.25;
    let piano = new $scope.Instrument();
    let message = document.querySelector('.message');

    navigator.requestMIDIAccess().then(function(m) {
      m.inputs.forEach(function(input) {
        return input.removeEventListener('midimessage', $scope.midiMessage);
      });
      m.inputs.forEach(function(input) {
        return input.addEventListener('midimessage', $scope.midiMessage);
      });
    });

    $scope.midiMessage = function(event) {
      if (event.data[0] === 144)
        piano.on(event.data[1], event.data[2]);
      if (event.data[0] === 128)
        piano.off(event.data[1], event.data[2]);
    };
  };
  /*****************************************************************
  /*****************************************************************

                           MIDI SAMPLER

  *****************************************************************
  *****************************************************************/

  let context = new AudioContext();

  $scope.midiSampler = function() {
    let keyData = document.getElementById('key_data');
    let deviceInfoInputs = document.getElementById('inputs');
    let deviceInfoOutputs = document.getElementById('outputs'),
      midi;

    // let AudioContext = AudioContext;
    let activeNotes = [];
    let btnBox = document.getElementById('content'),
      btn = document.getElementsByClassName('button');
    let data, cmd, channel, type, note, velocity;

    // request MIDI access
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({
        sysex: false
      }).then(onMIDISuccess);
    }

    // add event listeners
    for (let i = 0; i < btn.length; i++) {
      btn[i].addEventListener('mousedown', $scope.clickPlayOn);
      btn[i].addEventListener('mouseup', $scope.clickPlayOff);
    }
    // prepare audio files
    for (let i = 0; i < btn.length; i++) {
      addAudioProperties(btn[i]);
    }

    let sampleMap = {
      key60: 1,
      key61: 2,
      key62: 3,
      key63: 4,
      key64: 5,
      key65: 6,
      key66: 7,
      key67: 8,
      key68: 9,
      key69: 10,
      key70: 11,
      key71: 12,
      key72: 13,
      key73: 14,
      key74: 15,
      key75: 16,
      key76: 17,
      key77: 18,
      key78: 19,
      key79: 20,
      key80: 21,
      key81: 22,
      key82: 23,
      key83: 24
    };

    // user interaction
    $scope.clickPlayOn = function(e) {
      // function clickPlayOn(e) {
      e.target.classList.add('active');
      e.target.play();
    };

    $scope.clickPlayOff = function(e) {
      // function clickPlayOff(e) {
      e.target.classList.remove('active');
    };

    // midi functions
    function onMIDISuccess(midiAccess) {
      midi = midiAccess;
      let inputs = midi.inputs.values();
      console.log("inputs: ", inputs);
      // loop through inputs
      for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = $scope.onMIDIMessage;
      }
      // listen for connect/disconnect message
      midi.onstatechange = $scope.onStateChange;
    }

    $scope.onMIDIMessage = function(event) {
      // function onMIDIMessage(event) {
      data = event.data,
        type = data[0] & 0xf0,
        note = data[1],
        velocity = data[2];
      console.log('MIDI data', data);
      switch (type) {
        case 144:
          $scope.noteOn(note, velocity);
          break;
        case 128:
          $scope.noteOff(note, velocity);
          break;
      }
      $scope.logger(keyData, 'key data', data);
    };


    // this console.logs when midi is plugged in or taken out
    $scope.onStateChange = function(event) {
      // function onStateChange(event) {
      // showMIDIPorts(midi);
      let port = event.port,
        state = port.state,
        name = port.name,
        type = port.type;
      if (type == "input")
        console.log("name", name, "port", port, "state", state);
    };

    // $scope.listInputs = function(inputs) {
    //   // function listInputs(inputs) {
    //   let input = inputs.value;
    //   console.log("Input port : [ type:'" + input.type + "' id: '" + input.id +
    //     "' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
    //     "' version: '" + input.version + "']");
    // };

    $scope.noteOn = function(midiNote, velocity) {
      // function noteOn(midiNote, velocity) {
      $scope.player(midiNote, velocity);
    };

    $scope.noteOff = function(midiNote, velocity) {
      // function noteOff(midiNote, velocity) {
      $scope.player(midiNote, velocity);
    };

    $scope.player = function(note, velocity) {
      // function player(note, velocity) {
      let sample = sampleMap['key' + note];
      console.log("sampleMap: ", sampleMap);
      console.log("sample: ", sample);
      if (sample) {
        if (type === (0x80 & 0xf0) || velocity === 0) {
          return;
        }
        btn[sample - 1].play(velocity);
      }
    };

    // audio functions
    function loadAudio(object, url) {
      let request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';
      request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
          object.buffer = buffer;
        });
      };
      request.send();
    }

    function addAudioProperties(object) {
      object.source = object.dataset.sound;
      console.log("object.source: ", object.source);
      loadAudio(object, object.source);
      object.play = function(volume) {
        let s = context.createBufferSource();
        s.buffer = object.buffer;
        s.connect(context.destination);
        s.start();
      };
    }

    // this is the info in the DOM about keypresses
    $scope.logger = function(container, label, data) {
      // function logger(container, label, data) {
      let messages = label + " note: " + data[1];
      container.textContent = messages;
    };
  };


  let lastEffect = -1;
  $scope.changeMidi = function() {
    let midiChange = document.getElementById("midiChange").selectedIndex;
    let effectControls = document.getElementById("controls2");
    // Show and hide individual effects options
    if (lastEffect > -1)
      effectControls.children[lastEffect].classList.remove("display");
    lastEffect = midiChange;
    effectControls.children[midiChange].classList.add("display");
    switch (midiChange) {
      case 0: // Delay
        currentEffectNode = $scope.midiKeyboard();
        break;
      case 1: // flanger
        currentEffectNode = $scope.midiSampler();
        break;
      case 2:
        console.log("this: ");
        break;
      default:
        break;
    }
    // audioInput.connect(currentEffectNode);
  };

});
