'use strict';
app.controller('sequencerCtrl', function($scope, $location, AuthFactory) {

  $scope.title = "Sequencer";

  /********************************************************************
                          VARIABLES
  ********************************************************************/

  let context,
    compressor,
    masterGainNode,
    effectLevelNode,
    lowPassFilterNode,
    noteTime,
    startTime,
    lastDrawTime = -1,
    LOOP_LENGTH = 16,
    rhythmIndex = 0,
    timeoutId,
    testBuffer = null,
    currentKit = null,
    reverbImpulseResponse = null,
    tempo = 120,
    TEMPO_MAX = 300,
    TEMPO_MIN = 20,
    TEMPO_STEP = 1,
    TEMPO_STEP_5 = 5;

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
    this.SAMPLE_BASE_PATH = "sounds/drum-samples/";
    this.name = name;
    this.startedLoading = false;
    this.isLoaded = false;
    this.instrumentLoadCount = 0;
  };

  $scope.Kit.prototype.pathName = function() {
    return this.SAMPLE_BASE_PATH + this.name + "/";
  };



  /********************************************************************
                        LOADING SOUNDS
      ********************************************************************/

  $scope.Kit.prototype.load = function() {
    if (this.startedLoading) {
      return;
    }
    this.startedLoading = true;
    let pathName = this.pathName();

    // kicks
    let kickPath = pathName + "kick.mp3",
      kick01Path = pathName + "808-kick-01.wav",
      kick02Path = pathName + "808-kick-02.wav",
      kick03Path = pathName + "808-kick-03.wav";

    // snares
    let snarePath = pathName + "snare.mp3",
      snare01Path = pathName + "808-snare-01.wav";

    // cymbals
    let hihatPath = pathName + "hihat.mp3",
      hihat01Path = pathName + "808-hihat-01.wav",
      hihat02Path = pathName + "808-hihat-02.wav",
      cymPath = pathName + "cym.mp3";

    // others
    let tom01Path = pathName + "808-tom-01.wav";

    // piano
    let piano_aPath = pathName + "piano_a.mp3",
      piano_ashPath = pathName + "piano_ash.mp3",
      piano_bPath = pathName + "piano_b.mp3",
      piano_cPath = pathName + "piano_c.mp3",
      piano_cshPath = pathName + "piano_csh.mp3",
      piano_dPath = pathName + "piano_d.mp3",
      piano_dshPath = pathName + "piano_dsh.mp3",
      piano_ePath = pathName + "piano_e.mp3",
      piano_fPath = pathName + "piano_f.mp3",
      piano_fshPath = pathName + "piano_fsh.mp3",
      piano_gPath = pathName + "piano_g.mp3",
      piano_gshPath = pathName + "piano_gsh.mp3";


    // kicks
    this.loadSample(kickPath, "kick");
    this.loadSample(kick01Path, "808-kick-01");
    this.loadSample(kick02Path, "808-kick-02");
    this.loadSample(kick03Path, "808-kick-03");

    // snares
    this.loadSample(snarePath, "snare");
    this.loadSample(snare01Path, "808-snare-01");

    // cymbals
    this.loadSample(hihatPath, "hihat");
    this.loadSample(hihat01Path, "808-hihat-01");
    this.loadSample(hihat02Path, "808-hihat-02");
    this.loadSample(cymPath, "cym");

    // others
    this.loadSample(tom01Path, "808-tom-01");

    // piano
    this.loadSample(piano_aPath, "piano_a");
    this.loadSample(piano_ashPath, "piano_ash");
    this.loadSample(piano_bPath, "piano_b");
    this.loadSample(piano_cPath, "piano_c");
    this.loadSample(piano_cshPath, "piano_csh");
    this.loadSample(piano_dPath, "piano_d");
    this.loadSample(piano_dshPath, "piano_dsh");
    this.loadSample(piano_ePath, "piano_e");
    this.loadSample(piano_fPath, "piano_f");
    this.loadSample(piano_fshPath, "piano_fsh");
    this.loadSample(piano_gPath, "piano_g");
    this.loadSample(piano_gshPath, "piano_gsh");

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

            case "piano_a":
              kit.pianoaBuffer = buffer;
              break;
            case "piano_ash":
              kit.pianoashBuffer = buffer;
              break;
            case "piano_b":
              kit.pianobBuffer = buffer;
              break;
            case "piano_c":
              kit.pianocBuffer = buffer;
              break;
            case "piano_csh":
              kit.pianocshBuffer = buffer;
              break;
            case "piano_d":
              kit.pianodBuffer = buffer;
              break;
            case "piano_dsh":
              kit.pianodshBuffer = buffer;
              break;
            case "piano_e":
              kit.pianoeBuffer = buffer;
              break;
            case "piano_f":
              kit.pianofBuffer = buffer;
              break;
            case "piano_fsh":
              kit.pianofshBuffer = buffer;
              break;
            case "piano_g":
              kit.pianogBuffer = buffer;
              break;
            case "piano_gsh":
              kit.pianogshBuffer = buffer;
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



  /********************************************************************
                          SEQUENCER
  ********************************************************************/

  // sequencer
  $scope.playPauseListener = function() {
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

    // master volume control
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
    let kit = new $scope.Kit("TR808");
    kit.load();
    currentKit = kit;
  };

  $scope.playNote = function(buffer, noteTime) {
    let voice = context.createBufferSource();
    voice.buffer = buffer;

    let currentLastNode = masterGainNode;

    voice.connect(currentLastNode);
    voice.start(noteTime);
  };

  $scope.schedule = function() {
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

            case "piano_a":
              $scope.playNote(currentKit.pianoaBuffer, contextPlayTime);
              break;
            case "piano_ash":
              $scope.playNote(currentKit.pianoashBuffer, contextPlayTime);
              break;
            case "piano_b":
              $scope.playNote(currentKit.pianobBuffer, contextPlayTime);
              break;
            case "piano_c":
              $scope.playNote(currentKit.pianocBuffer, contextPlayTime);
              break;
            case "piano_csh":
              $scope.playNote(currentKit.pianocshBuffer, contextPlayTime);
              break;
            case "piano_d":
              $scope.playNote(currentKit.pianodBuffer, contextPlayTime);
              break;
            case "piano_dsh":
              $scope.playNote(currentKit.pianodshBuffer, contextPlayTime);
              break;
            case "piano_e":
              $scope.playNote(currentKit.pianodBuffer, contextPlayTime);
              break;
            case "piano_f":
              $scope.playNote(currentKit.pianofBuffer, contextPlayTime);
              break;
            case "piano_fsh":
              $scope.playNote(currentKit.pianofshBuffer, contextPlayTime);
              break;
            case "piano_g":
              $scope.playNote(currentKit.pianogBuffer, contextPlayTime);
              break;
            case "piano_gsh":
              $scope.playNote(currentKit.pianogshBuffer, contextPlayTime);
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
    let lastIndex = (xindex + LOOP_LENGTH - 1) % LOOP_LENGTH;

    //can change this to class selector to select a column
    let $newRows = $('.column_' + xindex);
    let $oldRows = $('.column_' + lastIndex);

    $newRows.addClass("playing");
    $oldRows.removeClass("playing");
  };

  $scope.advanceNote = function() {
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

  };
  $scope.handlePlay = function(event) {
    // function handlePlay(event) {
    rhythmIndex = 0;
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    $scope.schedule();
  };

  $scope.handleStop = function(event) {
    cancelAnimationFrame(timeoutId);
    $(".pad").removeClass("playing");
  };

  /********************************************************************
                          TEMPO CONTROLS
  ********************************************************************/
  $scope.initializeTempo = function() {
    $("#tempo-input").val(tempo);
  };


  $scope.changeTempoListener = function() {
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
    $("#increase-tempo-by-five").click(function() {
      if (tempo < TEMPO_MAX) {
        tempo += TEMPO_STEP_5;
        $("#tempo-input").val(tempo);
      }
    });

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
