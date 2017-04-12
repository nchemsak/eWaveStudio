'use strict';

app.controller('liveInputCtrl', function($scope) {
  $scope.title = "Live Input";
  $scope.Math = window.Math;
  $scope.dropdown = { value: '' };
  $scope.dropdown2 = { value: '' };
  $scope.ngControls = { value: '' };
  // effect mix control
  $scope.slider = { value: 0 };
  // Delay Controls
  $scope.slider2 = { value: 0.5 };
  $scope.slider3 = { value: 0.5 };
  // LFO CONTROLS
  $scope.lfoDropdown = { value: 'sine' };
  $scope.lfoSlider1 = { value: 3.0 };
  $scope.lfoSlider2 = { value: 1.0 };

  $scope.pause = { value: '' };
  $scope.play = { value: '' };
  // stereo FLANGER CONTROLS
  // $scope.stFlangeSlider1 = { value: 0.01 };
  // $scope.stFlangeSlider2 = { value: 0.003 };
  // $scope.stFlangeSlider3 = { value: 0.005 };
  // $scope.stFlangeSlider4 = { value: 0.9 };
  // $scope.check = { value: 'checked' };

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioContext = new AudioContext();
  let audioInput = null,
    realAudioInput = null,
    useFeedbackReduction = true,
    lpInputFilter = null,
    outputMix = null,
    dryGain = null,
    wetGain = null,
    effectInput = null,
    currentEffectNode = null,
    dtime = null,
    dregen = null,
    reverbBuffer = null,
    lfo = null,
    lfotype = null,
    lfodepth = null,
    sflldelay = null,
    sflrdelay = null,
    sflspeed = null,
    sflldepth = null,
    sflrdepth = null,
    sfllfb = null,
    sflrfb = null,
    dest = audioContext.createMediaStreamDestination();

  let constraints = {
    audio: {
      optional: [{
        echoCancellation: false
      }]
    }
  };

  $(function() {
    $scope.recordStop();
    $scope.pausePlay();
    $scope.midiSampler();
  });

  // // // Deprecated below.  Left for reference only
  // // // MediaStreamTrack.getSources(gotSources);


  // number of samples per second
  console.log("sample rate:", audioContext.sampleRate);

  /*****************************************************************
              CONVERT TO MONO
  *****************************************************************/
  $scope.convertToMono = function(input) {
    let splitter = audioContext.createChannelSplitter(2);
    let merger = audioContext.createChannelMerger(2);
    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
  };

  /*****************************************************************
               gotStream function
  *****************************************************************/
  $scope.gotStream = function(stream) {
    realAudioInput = audioContext.createMediaStreamSource(stream);
    let input = audioContext.createMediaStreamSource(stream);
    audioInput = $scope.convertToMono(input);
    let vol = audioContext.createGain();
    let volControl = document.getElementById("liveVolume");
    vol.gain.value = volControl.value;
    vol.connect(audioContext.destination);
    volControl.addEventListener("input", function() {
      vol.gain.value = volControl.value;
    });

    /*****************************************************************
                       Gain Mix Modes
    *****************************************************************/
    outputMix = audioContext.createGain();
    dryGain = audioContext.createGain();
    wetGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(dryGain);
    audioInput.connect(effectInput);
    dryGain.connect(outputMix);
    wetGain.connect(outputMix);
    dryGain.connect(dest);
    wetGain.connect(dest);
    outputMix.connect(vol);
    $scope.crossfade(1.0);
    $scope.changeEffect();
  };

  /*****************************************************************
     This selects the items from the dropdown  GET USER MEDIA API
  *****************************************************************/
  $scope.changeInput = function() {
    let audioSource = $scope.dropdown.index;
    constraints.audio.optional.push({ sourceId: audioSource });
    navigator.getUserMedia(constraints, $scope.gotStream, function(e) {
      console.log(e);
    });
  };

  /*****************************************************************
         Produce the drop down list of inputs
  *****************************************************************/

  navigator.mediaDevices.enumerateDevices().then(getAudioInputs).catch(error);
  const audioSelect = document.getElementById('audioinput');

  function getAudioInputs(device) {
    for (let i = 0; i !== device.length; i++) {
      let deviceInfo = device[i];
      let option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label ||
          'microphone ' + (audioSelect.length + 1);
        audioSelect.appendChild(option);
      }
    }
  }

  function error(error) {
    console.log('error: ', error);
  }

  /*****************************************************************
        CROSSFADE changes the amount of the effect relative
        to volume (dry gain and wet gain)
  *****************************************************************/
  $scope.crossfade = function() {
    let gain1 = Math.cos($scope.slider.value * 0.5 * Math.PI);
    dryGain.gain.value = gain1;
    let gain2 = Math.cos((1.0 - $scope.slider.value) * 0.5 * Math.PI);
    wetGain.gain.value = gain2;
  };
  let lastEffect = -1;

  /*****************************************************************
           Handles changing effects with a switch statement
  *****************************************************************/
  $scope.changeEffect = function() {
    dtime = null;
    dregen = null;
    lfo = null;
    lfotype = null;
    lfodepth = null;
    sflldelay = null;
    sflrdelay = null;
    sflspeed = null;
    sflldepth = null;
    sflrdepth = null;
    sfllfb = null;
    sflrfb = null;

    if (currentEffectNode)
      currentEffectNode.disconnect();
    if (effectInput)
      effectInput.disconnect();

    let effect = document.getElementById("effect").selectedIndex;
    // let effect2 = $scope.dropdown2.index;
    let effectControls = document.getElementById("controls");

    // Show and hide individual effects options
    if (lastEffect > -1)
      effectControls.children[lastEffect].classList.remove("display");
    lastEffect = effect;
    effectControls.children[effect].classList.add("display");

    switch (effect) {
      case 0: // Delay
        currentEffectNode = $scope.createdDelay();
        break;
      case 1: // lfo
        currentEffectNode = $scope.lfo();
        break;
      case 2: // Flanger
        currentEffectNode = $scope.flanger();
        break;
      case 3: //Telephone EQ
        currentEffectNode = $scope.telephoneEQ();
        break;
      default:
        break;
    }
    audioInput.connect(currentEffectNode);
  };

  /*****************************************************************
  //                    EFFECT FUNCTIONS
  *****************************************************************/
  $scope.createdDelay = function() {
    let delayNode = audioContext.createDelay();
    delayNode.delayTime.value = parseFloat($scope.slider2.value);
    dtime = delayNode;
    let gainNode = audioContext.createGain();
    gainNode.gain.value = parseFloat($scope.slider3.value);
    dregen = gainNode;
    gainNode.connect(delayNode);
    delayNode.connect(gainNode);
    delayNode.connect(wetGain);
    return delayNode;
  };

  $scope.lfo = function() {
    let osc = audioContext.createOscillator();
    let gain = audioContext.createGain();
    let depth = audioContext.createGain();
    osc.type = $scope.lfoDropdown.value;
    osc.frequency.value = parseFloat($scope.lfoSlider1.value);
    gain.gain.value = 1.0;
    depth.gain.value = 1.0;
    osc.connect(depth);
    depth.connect(gain.gain);
    gain.connect(wetGain);
    lfo = osc;
    lfotype = osc;
    lfodepth = depth;
    osc.start(0);
    return gain;
  };

  $scope.telephoneEQ = function() {
    let lp1 = audioContext.createBiquadFilter();
    lp1.type = "lowpass";
    lp1.frequency.value = 2000.0;
    let lp2 = audioContext.createBiquadFilter();
    lp2.type = "lowpass";
    lp2.frequency.value = 2000.0;
    let hpf1 = audioContext.createBiquadFilter();
    hpf1.type = "highpass";
    hpf1.frequency.value = 400.0;
    let hpf2 = audioContext.createBiquadFilter();
    hpf2.type = "highpass";
    hpf2.frequency.value = 400.0;
    lp1.connect(lp2);
    lp2.connect(hpf1);
    hpf1.connect(hpf2);
    hpf2.connect(wetGain);
    currentEffectNode = lp1;
    return (lp1);
  };

  $scope.flanger = function() {
    let splitter = audioContext.createChannelSplitter(2);
    let merger = audioContext.createChannelMerger(2);
    let inputNode = audioContext.createGain();
    sfllfb = audioContext.createGain();
    sflrfb = audioContext.createGain();
    sflspeed = audioContext.createOscillator();
    sflldepth = audioContext.createGain();
    sflrdepth = audioContext.createGain();
    sflldelay = audioContext.createDelay();
    sflrdelay = audioContext.createDelay();

    sfllfb.gain.value = sflrfb.gain.value = parseFloat(document.getElementById("sflfb").value);

    inputNode.connect(splitter);
    inputNode.connect(wetGain);

    sflldelay.delayTime.value = parseFloat(document.getElementById("sfldelay").value);
    sflrdelay.delayTime.value = parseFloat(document.getElementById("sfldelay").value);

    splitter.connect(sflldelay, 0);
    splitter.connect(sflrdelay, 1);
    sflldelay.connect(sfllfb);
    sflrdelay.connect(sflrfb);
    sfllfb.connect(sflrdelay);
    sflrfb.connect(sflldelay);

    sflldepth.gain.value = parseFloat(document.getElementById("sfldepth").value); // depth of change to the delay:
    sflrdepth.gain.value = -parseFloat(document.getElementById("sfldepth").value); // depth of change to the delay:

    sflspeed.type = 'triangle';
    sflspeed.frequency.value = parseFloat(document.getElementById("sflspeed").value);

    sflspeed.connect(sflldepth);
    sflspeed.connect(sflrdepth);

    sflldepth.connect(sflldelay.delayTime);
    sflrdepth.connect(sflrdelay.delayTime);

    sflldelay.connect(merger, 0, 0);
    sflrdelay.connect(merger, 0, 1);
    merger.connect(wetGain);

    sflspeed.start(0);

    return inputNode;
  };


  /*******************************************************************************
                              MEDIA RECORDER
  /******************************************************************************/

  $scope.recordStop = function() {
    $('#recordStop').click(function() {
      let $span = $(this).children("span");
      if ($span.hasClass('glyphicon-record')) {
        $span.removeClass('glyphicon-record');
        $span.addClass('glyphicon-stop animated infinite pulse');
        $scope.startRecording();
      } else {
        pause();
        $span.addClass('glyphicon-record');
        $span.removeClass('glyphicon-stop animated infinite pulse');
        playButton.disabled = false;
        downloadButton.disabled = false;
      }
    });
  };

  $scope.pausePlay = function() {
    $('#pausePlay').click(function() {
      let $span = $(this).children("span");
      if ($span.hasClass('glyphicon-play')) {
        $span.removeClass('glyphicon-play');
        $span.addClass('glyphicon-stop animated infinite pulse');
      } else {
        pause();
        $span.addClass('glyphicon-play');
        $span.removeClass('glyphicon-stop animated infinite pulse');
        playButton.disabled = false;
        downloadButton.disabled = false;
      }
    });
  };
  let mediaSource = new MediaSource();
  let mediaRecorder;
  let blobs;
  let liveVideo = document.getElementById('live');
  let recordedAudio = document.getElementById('recorded');
  let playButton = document.getElementById('pausePlay');
  playButton.onclick = play;
  let downloadButton = document.getElementById('downloadButton');
  downloadButton.onclick = download;

  // record audio and/or video
  let audioVideo = {
    audio: true,
    video: false
  };
  /*******************************************************************************
                                 LIVE STREAM
  /******************************************************************************/
  function handleSuccess(stream) {
    // recordButton.disabled = false;
    window.stream = stream;
    if (window.URL) {
      // liveVideo.src = window.URL.createObjectURL(stream);
    } else {
      liveVideo.src = stream;
    }
  }

  navigator.mediaDevices.getUserMedia(audioVideo).
  then(handleSuccess);

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      blobs.push(event.data);
    }
  }

  function handleStop(event) {
    // console.log('Recorder stopped: ', event);
  }

  $scope.startRecording = function() {
    blobs = [];
    mediaRecorder = new MediaRecorder(dest.stream);
    playButton.disabled = true;
    downloadButton.disabled = true;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    // mediaRecorder.start(10); this indicates 10ms of data per blob...not sure how that affects anything quite yet....
    mediaRecorder.start(10);
  };

  function play() {
    let playBack = new Blob(blobs, {
      type: 'video/webm'
    });
    recordedAudio.src = window.URL.createObjectURL(playBack);
  }

  function pause() {
    let pausePlay = mediaRecorder.pause();
    recordedAudio.src = window.URL.pausePlay;
  }

  /*******************************************************************************
                               DOWNLOAD FUNCTION
  /******************************************************************************/
  function download() {
    let blob = new Blob(blobs, { type: 'video/webm' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'eWaveLoop.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  /*****************************************************************
    /*****************************************************************

                             MIDI SAMPLER

    *****************************************************************
    *****************************************************************/

  $scope.midiSampler = function() {
    let keyData = document.getElementById('key_data');
    let deviceInfoInputs = document.getElementById('inputs');
    let deviceInfoOutputs = document.getElementById('outputs'),
      midi;

    let data, cmd, channel, type, note, velocity;

    // request MIDI access
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({
        sysex: false
      }).then(onMIDISuccess);
    }

    // midi functions
    function onMIDISuccess(midiAccess) {
      midi = midiAccess;
      let inputs = midi.inputs.values();
      // loop through inputs
      for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = $scope.onMIDIMessage;
      }
      // listen for connect/disconnect message
      midi.onstatechange = $scope.onStateChange;
    }

    $scope.onMIDIMessage = function(event) {
      data = event.data,
        type = data[0] & 0xf0,
        note = data[1],
        velocity = data[2];
      console.log('MIDI data', data);
      switch (note) {
        case 59:
          $scope.midiRecord();
          break;
        case 60:
          $scope.midiRecord();
          break;
        case 62:
          $scope.stopMidiRecord();
          break;
        case 63:
          $scope.stopMidiRecord();
          break;
      }
    };

    // this console.logs when midi is plugged in or taken out
    $scope.onStateChange = function(event) {
      let port = event.port,
        state = port.state,
        name = port.name,
        type = port.type;
      if (type == "input")
        console.log("name", name, "port", port, "state", state);
    };

    $scope.midiRecord = function() {
      let $span = $('#recordStop').children("span");
      if ($span.hasClass('glyphicon-record')) {
        $span.removeClass('glyphicon-record');
        $span.addClass('glyphicon-stop animated infinite pulse');
        $scope.startRecording();
      }
    };

    $scope.stopMidiRecord = function() {
      let $span = $('#recordStop').children("span");
      pause();
      $span.addClass('glyphicon-record');
      $span.removeClass('glyphicon-stop animated infinite pulse');
      playButton.disabled = false;
      downloadButton.disabled = false;
    };

    function addAudioProperties(object) {
      object.source = object.dataset.sound;
      object.play = function(volume) {
        let s = audioContext.createBufferSource();
        s.buffer = object.buffer;
        s.connect(audioContext.destination);
        s.start();
      };
    }
  };
});
