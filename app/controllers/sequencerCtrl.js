'use strict';


app.controller('sequencerCtrl', function($scope, $location, AuthFactory) {

  $scope.title = "Sequencer";



  //audio node variables
  var context;
  var compressor;
  var masterGainNode;
  var effectLevelNode;
  var lowPassFilterNode;

  var noteTime;
  var startTime;
  var lastDrawTime = -1;
  var LOOP_LENGTH = 16;
  var rhythmIndex = 0;
  var timeoutId;
  var testBuffer = null;

  var currentKit = null;
  var reverbImpulseResponse = null;

  var tempo = 120;
  var TEMPO_MAX = 300;
  var TEMPO_MIN = 20;
  var TEMPO_STEP = 1;
  var TEMPO_STEP_5 = 5;

  window.webkitAudioContext = AudioContext;


  $(function() {
    init();
    toggleSelectedListener();
    playPauseListener();
    // lowPassFilterListener();
    // reverbListener();
    // createLowPassFilterSliders();
    initializeTempo();
    changeTempoListener();
    changeTempoListenerByFive();
  });



  // DRUM KIT CODE

  var NUM_INSTRUMENTS = 2;

  function Kit(name) {
    this.SAMPLE_BASE_PATH = "sounds/drum-samples/";
    this.name = name;

    this.kickBuffer = null;
    this.snareBuffer = null;
    this.hihatBuffer = null;

    this.startedLoading = false;
    this.isLoaded = false;
    this.instrumentLoadCount = 0;
  }

  Kit.prototype.pathName = function() {
    return this.SAMPLE_BASE_PATH + this.name + "/";
  };

  Kit.prototype.load = function() {
    if (this.startedLoading) {
      return;
    }

    this.startedLoading = true;

    var pathName = this.pathName();

    //don't want to have set number of instruments
    var kickPath = pathName + "kick.mp3";
    var snarePath = pathName + "snare.mp3";
    var hihatPath = pathName + "hihat.mp3";

    this.loadSample(kickPath, "kick");
    this.loadSample(snarePath, "snare");
    this.loadSample(hihatPath, "hihat");
  };

  Kit.prototype.loadSample = function(url, instrumentName) {
    //need 2 load asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var kit = this;

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

  function playPauseListener() {
    $('#play-pause').click(function() {
      var $span = $(this).children("span");
      if ($span.hasClass('glyphicon-play')) {
        $span.removeClass('glyphicon-play');
        $span.addClass('glyphicon-pause');
        handlePlay();
      } else {
        $span.addClass('glyphicon-play');
        $span.removeClass('glyphicon-pause');
        handleStop();
      }
    });
  }

  function toggleSelectedListener() {
    $('.pad').click(function() {
      $(this).toggleClass("selected");
    });
  }

  function init() {
    initializeAudioNodes();
    loadKits();
  }

  function initializeAudioNodes() {
    context = new window.webkitAudioContext();
    var finalMixNode;
    if (context.createDynamicsCompressor) {
      compressor = context.createDynamicsCompressor();
      compressor.connect(context.destination);
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
  }

  function loadKits() {
    //name must be same as path
    var kit = new Kit("TR808");
    kit.load();
    currentKit = kit;
  }



  function playNote(buffer, noteTime) {
    var voice = context.createBufferSource();
    voice.buffer = buffer;

    var currentLastNode = masterGainNode;

    voice.connect(currentLastNode);
    voice.start(noteTime);
  }

  function schedule() {
    var currentTime = context.currentTime;

    // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
      var contextPlayTime = noteTime + startTime;
      var $currentPads = $(".column_" + rhythmIndex);
      $currentPads.each(function() {
        if ($(this).hasClass("selected")) {
          var instrumentName = $(this).parents().data("instrument");
          switch (instrumentName) {
            case "kick":
              playNote(currentKit.kickBuffer, contextPlayTime);
              break;
            case "snare":
              playNote(currentKit.snareBuffer, contextPlayTime);
              break;
            case "hihat":
              playNote(currentKit.hihatBuffer, contextPlayTime);
              break;
          }

        }
      });
      if (noteTime != lastDrawTime) {
        lastDrawTime = noteTime;
        drawPlayhead(rhythmIndex);
      }
      advanceNote();
    }

    timeoutId = requestAnimationFrame(schedule);
  }

  function drawPlayhead(xindex) {
    var lastIndex = (xindex + LOOP_LENGTH - 1) % LOOP_LENGTH;

    //can change this to class selector to select a column
    var $newRows = $('.column_' + xindex);
    var $oldRows = $('.column_' + lastIndex);

    $newRows.addClass("playing");
    $oldRows.removeClass("playing");
  }

  function advanceNote() {
    // Advance time by a 16th note...
    // var secondsPerBeat = 60.0 / theBeat.tempo;
    //TODO CHANGE TEMPO HERE, convert to float
    tempo = Number($("#tempo-input").val());
    var secondsPerBeat = 60.0 / tempo;
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

  }

  function handlePlay(event) {
    rhythmIndex = 0;
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    schedule();
  }

  function handleStop(event) {
    cancelAnimationFrame(timeoutId);
    $(".pad").removeClass("playing");
  }

  function initializeTempo() {
    $("#tempo-input").val(tempo);
  }

  function changeTempoListener() {
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
  }


  function changeTempoListenerByFive() {
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
  }






});
