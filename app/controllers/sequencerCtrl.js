'use strict';
app.controller('sequencerCtrl', function($scope, $location, AuthFactory) {

  // $scope.vol = { value: 0 };

  $scope.title = "Sequencer";


  let context;
  let compressor;
  let masterGainNode;
  let effectLevelNode;
  let lowPassFilterNode;
  let noteTime;
  let startTime;
  let lastDrawTime = -1;
  let LOOP_LENGTH = 16;
  let rhythmIndex = 0;
  let timeoutId;
  let testBuffer = null;
  let currentKit = null;
  let reverbImpulseResponse = null;
  let tempo = 120;
  let TEMPO_MAX = 300;
  let TEMPO_MIN = 20;
  let TEMPO_STEP = 1;
  let TEMPO_STEP_5 = 5;

  window.webkitAudioContext = AudioContext;

  $(function() {
    $scope.init();
    $scope.toggleSelectedListener();
    $scope.playPauseListener();
    // lowPassFilterListener();
    // reverbListener();
    // createLowPassFilterSliders();
    $scope.initializeTempo();
    $scope.changeTempoListener();
    $scope.changeTempoListenerByFive();
  });

  // DRUM KIT

  let NUM_INSTRUMENTS = 2;
  $scope.Kit = function(name) {
    // function Kit(name) {
    this.SAMPLE_BASE_PATH = "sounds/drum-samples/";
    this.name = name;

    // this.kickBuffer = null;
    // this.snareBuffer = null;
    // this.hihatBuffer = null;
    // this.cymBuffer = null;
    // this.hihat01Buffer = null;
    // this.hihat02Buffer = null;
    // this.kick01Buffer = null;
    // this.kick02Buffer = null;
    // this.kick03Buffer = null;
    // this.snare01Buffer = null;
    // this.tom01Buffer = null;

    this.startedLoading = false;
    this.isLoaded = false;
    this.instrumentLoadCount = 0;
  };

  $scope.Kit.prototype.pathName = function() {
    return this.SAMPLE_BASE_PATH + this.name + "/";
  };

  $scope.Kit.prototype.load = function() {
    if (this.startedLoading) {
      return;
    }

    this.startedLoading = true;

    let pathName = this.pathName();
    let kickPath = pathName + "kick.mp3";
    let snarePath = pathName + "snare.mp3";
    let hihatPath = pathName + "hihat.mp3";
    let cymPath = pathName + "cym.mp3";
    let hihat01Path = pathName + "808-hihat-01.wav";
    let hihat02Path = pathName + "808-hihat-02.wav";
    let kick01Path = pathName + "808-kick-01.wav";
    let kick02Path = pathName + "808-kick-02.wav";
    let kick03Path = pathName + "808-kick-03.wav";
    let snare01Path = pathName + "808-snare-01.wav";
    let tom01Path = pathName + "808-tom-01.wav";

    this.loadSample(kickPath, "kick");
    this.loadSample(snarePath, "snare");
    this.loadSample(hihatPath, "hihat");
    this.loadSample(cymPath, "cym");
    this.loadSample(hihat01Path, "808-hihat-01");
    this.loadSample(hihat02Path, "808-hihat-02");
    this.loadSample(kick01Path, "808-kick-01");
    this.loadSample(kick02Path, "808-kick-02");
    this.loadSample(kick03Path, "808-kick-03");
    this.loadSample(snare01Path, "808-snare-01");
    this.loadSample(tom01Path, "808-tom-01");

  };

  $scope.Kit.prototype.loadSample = function(url, instrumentName) {
    //need 2 load asynchronously
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    let kit = this;

    request.onload = function() {
      context.decodeAudioData(
        request.response,
        function(buffer) {
          switch (instrumentName) {
            case "kick":
              kit.kickBuffer = buffer;
              break;
            case "snare":
              kit.snareBuffer = buffer;
              break;
            case "hihat":
              kit.hihatBuffer = buffer;
              break;
            case "cym":
              kit.cymBuffer = buffer;
              break;
            case "808-hihat-01":
              kit.hihat01Buffer = buffer;
              break;
            case "808-hihat-02":
              kit.hihat02Buffer = buffer;
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
            case "808-snare-01":
              kit.snare01Buffer = buffer;
              break;
            case "808-tom-01":
              kit.tom01Buffer = buffer;
              break;
          }
          kit.instrumentLoadCount++;
          if (kit.instrumentLoadCount === NUM_INSTRUMENTS) {
            kit.isLoaded = true;
          }
        },
        function(buffer) {
          console.log("Error decoding drum samples!");
        }
      );
    };
    request.send();
  };
  // end drum kit code


  // sequencer
  $scope.playPauseListener = function() {
    // function playPauseListener() {
    $('#play-pause').click(function() {
      let $span = $(this).children("span");
      if ($span.hasClass('glyphicon-play')) {
        $span.removeClass('glyphicon-play');
        $span.addClass('glyphicon-pause');
        $scope.handlePlay();
      } else {
        $span.addClass('glyphicon-play');
        $span.removeClass('glyphicon-pause');
        $scope.handleStop();
      }
    });
  };

  $scope.toggleSelectedListener = function() {
    // function toggleSelectedListener() {
    $('.pad').click(function() {
      $(this).toggleClass("selected");
    });
  };

  $scope.init = function() {
    // function init() {
    $scope.initializeAudioNodes();
    $scope.loadKits();
  };


  $scope.initializeAudioNodes = function() {
    // function initializeAudioNodes() {
    context = new window.webkitAudioContext();

    let vol = context.createGain();

    let volControl = document.getElementById("seqVolume");
    vol.gain.value = volControl.value;
    vol.connect(context.destination);
    volControl.addEventListener("input", function() {
      vol.gain.value = volControl.value;
    });

    let finalMixNode;
    if (context.createDynamicsCompressor) {
      compressor = context.createDynamicsCompressor();
      compressor.connect(vol);
      finalMixNode = compressor;
    } else {
      finalMixNode = context.destination;
    }

    // Create master volume.
    // for now, the master volume is static, but in the future there will be a slider





    masterGainNode = context.createGain();
    masterGainNode.gain.value = 0.7; // reduce overall volume to avoid clipping
    masterGainNode.connect(finalMixNode);

    //Create Low Pass Filter
    lowPassFilterNode = context.createBiquadFilter();
    //this is for backwards compatibility, the type used to be an integer
    lowPassFilterNode.type = (typeof lowPassFilterNode.type === 'string') ? 'lowpass' : 0; // LOWPASS
    //default value is max cutoff, or passing all frequencies
    lowPassFilterNode.frequency.value = context.sampleRate / 2;
    lowPassFilterNode.connect(masterGainNode);
    lowPassFilterNode.active = false;
  };

  $scope.loadKits = function() {
    // function loadKits() {
    //name must be same as path
    let kit = new $scope.Kit("TR808");
    kit.load();
    currentKit = kit;
  };

  $scope.playNote = function(buffer, noteTime) {
    // function playNote(buffer, noteTime) {
    let voice = context.createBufferSource();
    voice.buffer = buffer;

    let currentLastNode = masterGainNode;

    voice.connect(currentLastNode);
    voice.start(noteTime);
  };

  $scope.schedule = function() {
    // function schedule() {
    let currentTime = context.currentTime;

    // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
      let contextPlayTime = noteTime + startTime;
      let $currentPads = $(".column_" + rhythmIndex);
      $currentPads.each(function() {
        if ($(this).hasClass("selected")) {
          let instrumentName = $(this).parents().data("instrument");
          switch (instrumentName) {
            case "kick":
              $scope.playNote(currentKit.kickBuffer, contextPlayTime);
              break;
            case "snare":
              $scope.playNote(currentKit.snareBuffer, contextPlayTime);
              break;
            case "hihat":
              $scope.playNote(currentKit.hihatBuffer, contextPlayTime);
              break;
            case "cym":
              $scope.playNote(currentKit.cymBuffer, contextPlayTime);
              break;
            case "808-hihat-01":
              $scope.playNote(currentKit.hihat01Buffer, contextPlayTime);
              break;
            case "808-hihat-02":
              $scope.playNote(currentKit.hihat02Buffer, contextPlayTime);
              break;
            case "808-kick-01":
              $scope.playNote(currentKit.kick01Buffer, contextPlayTime);
              break;
            case "808-kick-02":
              $scope.playNote(currentKit.kick02Buffer, contextPlayTime);
              break;
            case "808-kick-03":
              $scope.playNote(currentKit.kick03Buffer, contextPlayTime);
              break;
            case "808-snare-01":
              $scope.playNote(currentKit.snare01Buffer, contextPlayTime);
              break;
            case "808-tom-01":
              $scope.playNote(currentKit.tom01Buffer, contextPlayTime);
              break;
          }

        }
      });
      if (noteTime != lastDrawTime) {
        lastDrawTime = noteTime;
        $scope.drawPlayhead(rhythmIndex);
      }
      $scope.advanceNote();
    }

    timeoutId = requestAnimationFrame($scope.schedule);
  };

  $scope.drawPlayhead = function(xindex) {
    // function drawPlayhead(xindex) {
    let lastIndex = (xindex + LOOP_LENGTH - 1) % LOOP_LENGTH;

    //can change this to class selector to select a column
    let $newRows = $('.column_' + xindex);
    let $oldRows = $('.column_' + lastIndex);

    $newRows.addClass("playing");
    $oldRows.removeClass("playing");
  };

  $scope.advanceNote = function() {
    // function advanceNote() {
    // Advance time by a 16th note...
    // let secondsPerBeat = 60.0 / theBeat.tempo;
    //TODO CHANGE TEMPO HERE, convert to float
    tempo = Number($("#tempo-input").val());
    let secondsPerBeat = 60.0 / tempo;
    rhythmIndex++;
    if (rhythmIndex === LOOP_LENGTH) {
      rhythmIndex = 0;
    }

    //0.25 because each square is a 16th note
    noteTime += 0.25 * secondsPerBeat;
    // if (rhythmIndex % 2) {
    //     noteTime += (0.25 + kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // } else {
    //     noteTime += (0.25 - kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // }
  };
  $scope.handlePlay = function(event) {
    // function handlePlay(event) {
    rhythmIndex = 0;
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    $scope.schedule();
  };

  $scope.handleStop = function(event) {
    // function handleStop(event) {
    cancelAnimationFrame(timeoutId);
    $(".pad").removeClass("playing");
  };

  $scope.initializeTempo = function() {
    // function initializeTempo() {
    $("#tempo-input").val(tempo);
  };

  $scope.changeTempoListener = function() {
    // function changeTempoListener() {
    $("#increase-tempo").click(function() {
      if (tempo < TEMPO_MAX) {
        tempo += TEMPO_STEP;
        $("#tempo-input").val(tempo);
      }
    });

    $("#decrease-tempo").click(function() {
      if (tempo > TEMPO_MIN) {
        tempo -= TEMPO_STEP;
        $("#tempo-input").val(tempo);
      }
    });
  };

  $scope.changeTempoListenerByFive = function() {
    // function changeTempoListenerByFive() {
    // $("#increase-tempo").click(function() {
    $("#increase-tempo-by-five").click(function() {
      if (tempo < TEMPO_MAX) {
        tempo += TEMPO_STEP_5;
        $("#tempo-input").val(tempo);
      }
    });

    // $("#decrease-tempo").click(function() {
    $("#decrease-tempo-by-five").click(function() {
      if (tempo > TEMPO_MIN) {
        tempo -= TEMPO_STEP_5;
        $("#tempo-input").val(tempo);
      }
    });
  };







  // /**********************************************************************
  //                                KICK DRUM
  // **********************************************************************/

  // the sound starts at a higher frequency — the ‘attack’ phase -
  // and then rapidly falls away to a lower frequency.
  // While this is happening, the volume of the sound also decreases.

  // $scope.Kick = function(audioContext) {
  //   this.audioContext = audioContext;
  // };

  // $scope.Kick.prototype.setup = function() {
  //   this.osc = this.audioContext.createOscillator();
  //   this.gain = this.audioContext.createGain();
  //   this.osc.connect(this.gain);
  //   this.gain.connect(this.audioContext.destination);
  // };

  // $scope.Kick.prototype.trigger = function(time) {
  //   this.setup();

  //   this.osc.frequency.setValueAtTime(150, time);
  //   // the “envelope” of the sound:
  //   this.gain.gain.setValueAtTime(1, time);

  //   // // drop the FREQUENCY of the oscillator rapidly after the initial attack.
  //   this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

  //   // // decrease the GAIN to close to zero over the next 0.5 seconds
  //   this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  //   this.osc.start(time);

  //   this.osc.stop(time + 0.5);
  // };




});
