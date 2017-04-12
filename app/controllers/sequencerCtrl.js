'use strict';
app.controller('sequencerCtrl', function($scope, $location, AuthFactory) {
  $scope.title = "Sequencer";

  /********************************************************************
                          VARIABLES
  ********************************************************************/
  let context,
    compress,
    masterGain,
    lowPassFilter,
    divTime,
    beginTime,
    lastDraw = -1,
    lengthLoop = 16,
    rhythm = 0,
    timeOut,
    drumKit = null,
    tempo = 100,
    maxTempo = 300,
    minTempo = 20,
    stepTempo = 1,
    stepTempo5 = 5;

  window.webkitAudioContext = AudioContext;

  $(function() {
    $scope.init();
    $scope.toggleSelectedListener();
    $scope.playPause();
    $scope.initTempo();
    $scope.tempoChange();
    $scope.tempoChangeBy5();
    $scope.recordStop();
    $scope.pausePlay();
    $scope.midiSampler();
  });

  // DRUM KIT
  let NUM_INSTRUMENTS = 2;
  $scope.Kit = function(name) {
    this.basePath = "audio/";
    this.name = name;
    this.startLoad = false;
    this.Loaded = false;
    this.instrLoad = 0;
  };

  $scope.Kit.prototype.path = function() {
    return this.basePath + this.name + "/";
  };

  /********************************************************************
                        LOADING SOUNDS
  ********************************************************************/

  $scope.Kit.prototype.load = function() {
    if (this.startLoad) {
      return;
    }
    this.startLoad = true;
    let path = this.path();

    // kicks
    let kickPath = path + "kick.mp3",
      kick01Path = path + "808-kick-01.wav",
      kick02Path = path + "808-kick-02.wav",
      kick03Path = path + "808-kick-03.wav",
      kick05Path = path + "kick05.wav",
      kick06Path = path + "kick06.wav";

    // snares
    let snarePath = path + "snare.mp3",
      snare01Path = path + "808-snare-01.wav",
      snare03Path = path + "snare03.wav",
      snare04Path = path + "snare04.wav";

    // cymbals
    let hihatPath = path + "hihat.mp3",
      hihat01Path = path + "808-hihat-01.wav",
      hihat02Path = path + "808-hihat-02.wav",
      cymPath = path + "crash01.wav",
      cym02Path = path + "crash02.wav",
      cym03Path = path + "crash03.wav",
      ride01Path = path + "ride01.wav";

    // toms
    let tom01Path = path + "808-tom-01.wav",
      tom03Path = path + "tom03.wav",
      tom04Path = path + "tom04.wav";

    //others
    let loop01Path = path + "drumloop100bpm.wav",
      loop02Path = path + "drumloop120bpm.wav",
      loop03Path = path + "drumloop140bpm.wav",
      loop04Path = path + "drumloop1.wav",
      loop05Path = path + "drumloop2.wav";

    // kicks
    this.loadSample(kickPath, "kick");
    this.loadSample(kick01Path, "808-kick-01");
    this.loadSample(kick02Path, "808-kick-02");
    this.loadSample(kick03Path, "808-kick-03");
    this.loadSample(kick05Path, "kick05");
    this.loadSample(kick06Path, "kick06");

    // snares
    this.loadSample(snarePath, "snare");
    this.loadSample(snare01Path, "808-snare-01");
    this.loadSample(snare03Path, "snare03");
    this.loadSample(snare04Path, "snare04");

    // cymbals
    this.loadSample(hihatPath, "hihat");
    this.loadSample(hihat01Path, "808-hihat-01");
    this.loadSample(hihat02Path, "808-hihat-02");
    this.loadSample(cymPath, "cym");
    this.loadSample(cym02Path, "cym02");
    this.loadSample(cym03Path, "cym03");
    this.loadSample(ride01Path, "ride01");

    // toms
    this.loadSample(tom01Path, "808-tom-01");
    this.loadSample(tom03Path, "tom03");
    this.loadSample(tom04Path, "tom04");

    //others
    this.loadSample(loop01Path, "drumloop100bpm");
    this.loadSample(loop02Path, "drumloop120bpm");
    this.loadSample(loop03Path, "drumloop140bpm");
    this.loadSample(loop04Path, "drumloop1");
    this.loadSample(loop05Path, "drumloop2");
  };

  $scope.Kit.prototype.loadSample = function(url, instrumentName) {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    let kit = this;

    request.onload = function() {
      context.decodeAudioData(
        request.response,
        function(buffer) {
          switch (instrumentName) {
            // kicks
            case "kick":
              kit.kickBuffer = buffer;
              break;
            case "808-kick-01":
              kit.kick01Buffer = buffer;
              break;
            case "808-kick-02":
              kit.kick02Buffer = buffer;
              break;
            case "808-kick-03":
              kit.kick03Buffer = buffer;
              break;
            case "kick05":
              kit.kick05Buffer = buffer;
              break;
            case "kick06":
              kit.kick06Buffer = buffer;
              break;
              // snares
            case "snare":
              kit.snareBuffer = buffer;
              break;
            case "808-snare-01":
              kit.snare01Buffer = buffer;
              break;
            case "snare03":
              kit.snare03Buffer = buffer;
              break;
            case "snare04":
              kit.snare04Buffer = buffer;
              break;
              // cymbals
            case "hihat":
              kit.hihatBuffer = buffer;
              break;
            case "cym":
              kit.cymBuffer = buffer;
              break;
            case "cym02":
              kit.cym02Buffer = buffer;
              break;
            case "cym03":
              kit.cym03Buffer = buffer;
              break;
            case "808-hihat-01":
              kit.hihat01Buffer = buffer;
              break;
            case "808-hihat-02":
              kit.hihat02Buffer = buffer;
              break;
            case "ride01":
              kit.ride01Buffer = buffer;
              break;
              // toms
            case "808-tom-01":
              kit.tom01Buffer = buffer;
              break;
            case "tom03":
              kit.tom03Buffer = buffer;
              break;
            case "tom04":
              kit.tom04Buffer = buffer;
              break;
              //others
            case "drumloop100bpm":
              kit.loop01Buffer = buffer;
              break;
            case "drumloop120bpm":
              kit.loop02Buffer = buffer;
              break;
            case "drumloop140bpm":
              kit.loop03Buffer = buffer;
              break;
            case "drumloop1":
              kit.loop04Buffer = buffer;
              break;
            case "drumloop2":
              break;
          }
          kit.instLoad++;
          if (kit.instLoad === NUM_INSTRUMENTS) {
            kit.Loaded = true;
          }
        },
        function(buffer) {
          console.log("Error decoding drum samples!");
        }
      );
    };
    request.send();
  };

  /********************************************************************
                          SEQUENCER
  ********************************************************************/
  $scope.playPause = function() {
    $('#play-pause').click(function() {
      let $span = $(this).children("span");
      if ($span.hasClass('glyphicon-play')) {
        $span.removeClass('glyphicon-play');
        $span.addClass('glyphicon-stop');
        $scope.handlePlay();
      } else {
        $span.addClass('glyphicon-play');
        $span.removeClass('glyphicon-stop');
        $scope.stop();
      }
    });
  };

  $scope.toggleSelectedListener = function() {
    $('.pad').click(function() {
      $(this).toggleClass("selected");
    });
  };

  $scope.init = function() {
    $scope.audioNodeInit();
    $scope.loadKits();
  };

  $scope.audioNodeInit = function() {
    context = new window.webkitAudioContext();
    let vol = context.createGain();
    let volControl = document.getElementById("seqVolume");
    vol.gain.value = volControl.value;
    vol.connect(context.destination);
    volControl.addEventListener("input", function() {
      vol.gain.value = volControl.value;
    });

    let completeMix;
    if (context.createDynamicsCompressor) {
      compress = context.createDynamicsCompressor();
      compress.connect(vol);
      completeMix = compress;
    } else {
      completeMix = context.destination;
    }

    // master volume
    masterGain = context.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(completeMix);
  };

  $scope.loadKits = function() {
    let kit = new $scope.Kit("Drums");
    kit.load();
    drumKit = kit;
  };

  $scope.playNote = function(buffer, divTime) {
    let voice = context.createBufferSource();
    voice.buffer = buffer;
    let currentLastNode = masterGain;
    voice.connect(currentLastNode);
    voice.start(divTime);
  };

  $scope.schedule = function() {
    let currentTime = context.currentTime;

    // The sequence begins at beginTime, set currentTime so it's 0 at the start of sequence.
    currentTime -= beginTime;

    while (divTime < currentTime + 0.200) {
      let contextPlayTime = divTime + beginTime;
      let currentPads = $(".column_" + rhythm);
      currentPads.each(function() {
        if ($(this).hasClass("selected")) {
          let instrumentName = $(this).parents().data("instrument");
          switch (instrumentName) {
            // kicks
            case "kick":
              $scope.playNote(drumKit.kickBuffer, contextPlayTime);
              // console.log("kick played: ");
              break;
            case "808-kick-01":
              $scope.playNote(drumKit.kick01Buffer, contextPlayTime);
              break;
            case "808-kick-02":
              $scope.playNote(drumKit.kick02Buffer, contextPlayTime);
              break;
            case "808-kick-03":
              $scope.playNote(drumKit.kick03Buffer, contextPlayTime);
              break;
            case "kick05":
              $scope.playNote(drumKit.kick05Buffer, contextPlayTime);
              break;
            case "kick06":
              $scope.playNote(drumKit.kick06Buffer, contextPlayTime);
              break;
              // snares
            case "snare":
              $scope.playNote(drumKit.snareBuffer, contextPlayTime);
              break;
            case "808-snare-01":
              $scope.playNote(drumKit.snare01Buffer, contextPlayTime);
              break;
            case "snare03":
              $scope.playNote(drumKit.snare03Buffer, contextPlayTime);
              break;
            case "snare04":
              $scope.playNote(drumKit.snare04Buffer, contextPlayTime);
              break;
              // cymbals
            case "hihat":
              $scope.playNote(drumKit.hihatBuffer, contextPlayTime);
              break;
            case "cym":
              $scope.playNote(drumKit.cymBuffer, contextPlayTime);
              break;
            case "cym02":
              $scope.playNote(drumKit.cym02Buffer, contextPlayTime);
              break;
            case "cym03":
              $scope.playNote(drumKit.cym03Buffer, contextPlayTime);
              break;
            case "808-hihat-01":
              $scope.playNote(drumKit.hihat01Buffer, contextPlayTime);
              break;
            case "808-hihat-02":
              $scope.playNote(drumKit.hihat02Buffer, contextPlayTime);
              break;
            case "ride01":
              $scope.playNote(drumKit.ride01Buffer, contextPlayTime);
              break;
              // toms
            case "808-tom-01":
              $scope.playNote(drumKit.tom01Buffer, contextPlayTime);
              break;
            case "tom03":
              $scope.playNote(drumKit.tom03Buffer, contextPlayTime);
              break;
            case "tom04":
              $scope.playNote(drumKit.tom04Buffer, contextPlayTime);
              break;
              //others
            case "drumloop100bpm":
              // console.log("loop100");
              $scope.playNote(drumKit.loop01Buffer, contextPlayTime);
              break;
            case "drumloop120bpm":
              $scope.playNote(drumKit.loop02Buffer, contextPlayTime);
              break;
            case "drumloop140bpm":
              $scope.playNote(drumKit.loop03Buffer, contextPlayTime);
              break;
            case "drumloop1":
              $scope.playNote(drumKit.loop04Buffer, contextPlayTime);
              break;
            case "drumloop2":
              play();
              break;
          }
        }
      });
      if (divTime != lastDraw) {
        lastDraw = divTime;
        $scope.drawPlay(rhythm);
      }
      $scope.advanceNote();
    }
    timeOut = requestAnimationFrame($scope.schedule);
  };

  $scope.drawPlay = function(xindex) {
    let lastIndex = (xindex + lengthLoop - 1) % lengthLoop;
    let newRow = $('.column_' + xindex);
    let oldRow = $('.column_' + lastIndex);
    newRow.addClass("playing");
    oldRow.removeClass("playing");
  };

  $scope.advanceNote = function() {
    tempo = Number($("#tempo-input").val());
    let perBeatSeconds = 60.0 / tempo;
    rhythm++;
    if (rhythm === lengthLoop) {
      rhythm = 0;
    }

    //0.25 because each div is 16th note
    divTime += 0.25 * perBeatSeconds;

  };
  $scope.handlePlay = function(event) {
    rhythm = 0;
    divTime = 0.0;
    beginTime = context.currentTime + 0.005;
    $scope.schedule();
  };

  $scope.stop = function(event) {
    cancelAnimationFrame(timeOut);
    $(".pad").removeClass("playing");
  };

  /********************************************************************
                          TEMPO CONTROLS
  ********************************************************************/
  $scope.initTempo = function() {
    $("#tempo-input").val(tempo);
  };

  $scope.tempoChange = function() {
    $("#increase-tempo").click(function() {
      if (tempo < maxTempo) {
        tempo += stepTempo;
        $("#tempo-input").val(tempo);
      }
    });

    $("#decrease-tempo").click(function() {
      if (tempo > minTempo) {
        tempo -= stepTempo;
        $("#tempo-input").val(tempo);
      }
    });
  };

  $scope.tempoChangeBy5 = function() {
    $("#increase-tempo-by-five").click(function() {
      if (tempo < maxTempo) {
        tempo += stepTempo5;
        $("#tempo-input").val(tempo);
      }
    });

    $("#decrease-tempo-by-five").click(function() {
      if (tempo > minTempo) {
        tempo -= stepTempo5;
        $("#tempo-input").val(tempo);
      }
    });
  };

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
  let audioContext = new AudioContext(),
    audioInput = null,
    realAudioInput = null,
    useFeedbackReduction = true,
    lpInputFilter = null,
    output = null,
    dryGain = null,
    wetGain = null,
    effectInput = null,
    currentEffectNode = null,
    dtime = null,
    dregen = null,
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
    let volControl = document.getElementById("liveVolume2");
    vol.gain.value = volControl.value;
    vol.connect(audioContext.destination);
    volControl.addEventListener("input", function() {
      vol.gain.value = volControl.value;
    });

    /*****************************************************************
    // Gain Mix Modes
    *****************************************************************/
    output = audioContext.createGain();
    dryGain = audioContext.createGain();
    wetGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(dryGain);
    audioInput.connect(effectInput);
    dryGain.connect(output);
    wetGain.connect(output);
    dryGain.connect(dest);
    wetGain.connect(dest);
    output.connect(vol);
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
    let effectControls = document.getElementById("controls");

    // Show and hide effects options
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
        playBtn.disabled = false;
        downloadBtn.disabled = false;
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
        playBtn.disabled = false;
        downloadBtn.disabled = false;
      }
    });
  };

  let mediaSource = new MediaSource();
  let mediaRecorder;
  let blobs;
  let recordedAudio = document.getElementById('recorded');
  let playBtn = document.getElementById('pausePlay');
  playBtn.onclick = play;
  let downloadBtn = document.getElementById('downloadButton');
  downloadBtn.onclick = download;

  // record audio and/or video
  let audioVideo = {
    audio: true,
    video: false
  };
  /*******************************************************************************
                                 LIVE STREAM
  /******************************************************************************/
  // function handleSuccess(stream) {
  //   // console.log('stream: ', stream);
  //   window.stream = stream;
  //   if (window.URL) {
  //     // liveVideo.src = window.URL.createObjectURL(stream);
  //   } else {
  //     // liveVideo.src = stream;
  //   }
  // }

  // navigator.mediaDevices.getUserMedia(audioVideo)
  // then(handleSuccess);

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      blobs.push(event.data);
    }
  }

  $scope.startRecording = function() {
    blobs = [];
    mediaRecorder = new MediaRecorder(dest.stream);
    playBtn.disabled = true;
    downloadBtn.disabled = true;
    mediaRecorder.ondataavailable = handleDataAvailable;
    // mediaRecorder.start(10); this indicates 10ms of data per blob...not sure how that affects anything quite yet....
    mediaRecorder.start(10);
  };

  function play() {
    let playBack = new Blob(blobs, {
      type: 'audio/webm'
    });
    recordedAudio.src = window.URL.createObjectURL(playBack);
  }

  function pause() {
    let pausePlay = mediaRecorder.pause();
    // recordedAudio.src = window.URL.pausePlay;
  }


  /*******************************************************************************
                               DOWNLOAD FUNCTION
  /******************************************************************************/
  function download() {
    let blob = new Blob(blobs, { type: 'audio/webm' });
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
      // console.log('MIDI data', data);
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
      playBtn.disabled = false;
      downloadBtn.disabled = false;
    };

    function addAudioProperties(object) {
      object.source = object.dataset.sound;
      // console.log("object.source: ", object.source);
      object.play = function(volume) {
        let s = audioContext.createBufferSource();
        s.buffer = object.buffer;
        s.connect(audioContext.destination);
        s.start();
      };
    }
  };

});
