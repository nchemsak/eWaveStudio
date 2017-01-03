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
      kick03Path = pathName + "808-kick-03.wav",
      kick05Path = pathName + "kick05.wav",
      kick06Path = pathName + "kick06.wav";

    // snares
    let snarePath = pathName + "snare.mp3",
      snare01Path = pathName + "808-snare-01.wav",
      snare03Path = pathName + "snare03.wav",
      snare04Path = pathName + "snare04.wav";

    // cymbals
    let hihatPath = pathName + "hihat.mp3",
      hihat01Path = pathName + "808-hihat-01.wav",
      hihat02Path = pathName + "808-hihat-02.wav",
      cymPath = pathName + "crash01.wav",
      cym02Path = pathName + "crash02.wav",
      cym03Path = pathName + "crash03.wav",
      ride01Path = pathName + "ride01.wav";

    // toms
    let tom01Path = pathName + "808-tom-01.wav",
      tom03Path = pathName + "tom03.wav",
      tom04Path = pathName + "tom04.wav";

    //others
    let loop01Path = pathName + "drumloop100bpm.wav",
      loop02Path = pathName + "drumloop120bpm.wav",
      loop03Path = pathName + "drumloop140bpm.wav",
      loop04Path = pathName + "drumloop1.wav",
      loop05Path = pathName + "drumloop2.wav";



  // function play() {
  //   let playBack = new Blob(blobs, {
  //     type: 'video/webm'
  //   });
  //   recordedVideo.src = window.URL.createObjectURL(playBack);
  //   console.log("recordedVideo: ", recordedVideo);
  //   console.log("recordedVideo.src: ", recordedVideo.src);
  //   console.log("playBack: ", playBack);
  // }

  // function pause() {
  //   let pausePlay = mediaRecorder.pause();
  //   recordedVideo.src = window.URL.pausePlay;
  // }



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
              // kit.loop05Buffer = buffer;
              // play();
              break;

              // piano
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
        $span.addClass('glyphicon-stop');
        $scope.handlePlay();
      } else {
        $span.addClass('glyphicon-play');
        $span.removeClass('glyphicon-stop');
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
            // kicks
            case "kick":
              $scope.playNote(currentKit.kickBuffer, contextPlayTime);
              console.log("kick played: ");
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
            case "kick05":
              $scope.playNote(currentKit.kick05Buffer, contextPlayTime);
              break;
            case "kick06":
              $scope.playNote(currentKit.kick06Buffer, contextPlayTime);
              break;
              // snares
            case "snare":
              $scope.playNote(currentKit.snareBuffer, contextPlayTime);
              break;
            case "808-snare-01":
              $scope.playNote(currentKit.snare01Buffer, contextPlayTime);
              break;
            case "snare03":
              $scope.playNote(currentKit.snare03Buffer, contextPlayTime);
              break;
            case "snare04":
              $scope.playNote(currentKit.snare04Buffer, contextPlayTime);
              break;
              // cymbals
            case "hihat":
              $scope.playNote(currentKit.hihatBuffer, contextPlayTime);
              break;
            case "cym":
              $scope.playNote(currentKit.cymBuffer, contextPlayTime);
              break;
            case "cym02":
              $scope.playNote(currentKit.cym02Buffer, contextPlayTime);
              break;
            case "cym03":
              $scope.playNote(currentKit.cym03Buffer, contextPlayTime);
              break;
            case "808-hihat-01":
              $scope.playNote(currentKit.hihat01Buffer, contextPlayTime);
              break;
            case "808-hihat-02":
              $scope.playNote(currentKit.hihat02Buffer, contextPlayTime);
              break;
            case "ride01":
              $scope.playNote(currentKit.ride01Buffer, contextPlayTime);
              break;
              // toms
            case "808-tom-01":
              $scope.playNote(currentKit.tom01Buffer, contextPlayTime);
              break;
            case "tom03":
              $scope.playNote(currentKit.tom03Buffer, contextPlayTime);
              break;
            case "tom04":
              $scope.playNote(currentKit.tom04Buffer, contextPlayTime);
              break;
              //others
            case "drumloop100bpm":
              console.log("loop100");
              $scope.playNote(currentKit.loop01Buffer, contextPlayTime);
              break;
            case "drumloop120bpm":
              $scope.playNote(currentKit.loop02Buffer, contextPlayTime);
              break;
            case "drumloop140bpm":
              $scope.playNote(currentKit.loop03Buffer, contextPlayTime);
              break;
            case "drumloop1":
              $scope.playNote(currentKit.loop04Buffer, contextPlayTime);
              break;
            case "drumloop2":
              // $scope.playNote(currentKit.loop05Buffer, contextPlayTime);
              play();
              break;
              // piano
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


  var selectedFile;


  $("#audio_file").click(function(event) {
    $scope.selectedFile = event.target.files[0];
    console.log("$scope.selectedFile: ", $scope.selectedFile);
  });

  $scope.uploadFile = function() {
    // $scope.selectedFile = event.target.files[0];
    $scope.selectedFile = { value: '' };
    console.log("selectedFile: ", selectedFile);
    // Create a root reference
    console.log("you clicked to upload: ");
    var filename = $scope.selectedFile.name;
    var storageRef = firebase.storage().ref('/soundFiles/' + filename);
    var uploadTask = storageRef.put($scope.selectedFile);
    uploadTask.on('state_changed', function(snapshot) {

    }, function(error) {

    }, function() {
      var downloadURL = uploadTask.snapshot.downloadURL;
      console.log("downloadURL: ", downloadURL);
    });

  };




  // /*******************************************************************************
  //                             MEDIA RECORDER
  // /******************************************************************************/

  // /*******************************************************************************
  //                             VARIABLES
  // /******************************************************************************/
  // let mediaSource = new MediaSource();
  // // mediaSource.addEventListener('sourceopen', false);
  // let mediaRecorder;
  // let blobs;
  // let liveVideo = document.getElementById('live');
  // let recordedVideo = document.getElementById('recorded');

  // // Button Variables
  // let recordButton = document.getElementById('recordButton');
  // recordButton.onclick = toggleRecording;

  // let playButton = document.getElementById('playButton');
  // playButton.onclick = play;

  // let downloadButton = document.getElementById('downloadButton');
  // downloadButton.onclick = download;

  // // Indicate whether to record audio and/or video
  // let audioVideo = {
  //   audio: true,
  //   video: true
  // };
  // /*******************************************************************************
  //                                LIVE STREAM
  // /******************************************************************************/
  // function handleSuccess(stream) {
  //   recordButton.disabled = false;
  //   console.log('stream: ', stream);
  //   window.stream = stream;
  //   if (window.URL) {
  //     console.log("window.URL: ", window.URL);
  //     console.log("window: ", window);

  //     // The Window.URL property returns an object that provides static methods used for creating and managing object URLs. It can also be called as a constructor to construct URL objects.

  //     liveVideo.src = window.URL.createObjectURL(stream);
  //   } else {
  //     liveVideo.src = stream;
  //   }
  // }

  // navigator.mediaDevices.getUserMedia(audioVideo).
  // then(handleSuccess);

  // function handleDataAvailable(event) {
  //   if (event.data && event.data.size > 0) {
  //     blobs.push(event.data);
  //   }
  // }

  // function handleStop(event) {
  //   console.log('Recorder stopped: ', event);
  // }

  // ******************************************************************************
  //                              TOGGLE Recording (start/stop)
  // ****************************************************************************

  // function toggleRecording() {
  //   if (recordButton.textContent === 'Start Recording') {
  //     startRecording();
  //   } else {
  //     stopRecording();
  //     recordButton.textContent = 'Start Recording';
  //     playButton.disabled = false;
  //     downloadButton.disabled = false;
  //   }
  // }

  // /*******************************************************************************
  //                              Start Recording FUNCTION
  // /*****************************************************************************

  // function startRecording() {
  //   blobs = [];
  //   mediaRecorder = new MediaRecorder(window.stream);
  //   recordButton.textContent = 'STOP Recording';
  //   playButton.disabled = true;
  //   downloadButton.disabled = true;
  //   mediaRecorder.onstop = handleStop;
  //   mediaRecorder.ondataavailable = handleDataAvailable;
  //   // mediaRecorder.start(10); this indicates 10ms of data per blob...not sure how that affects anything quite yet....
  //   mediaRecorder.start(10);
  //   console.log('MediaRecorder start: ', mediaRecorder);
  // }

  // /*******************************************************************************
  //                             STOP RECORDING function
  // /******************************************************************************/

  // function stopRecording() {
  //   mediaRecorder.stop();
  //   console.log('blobs: ', blobs);
  //   recordedVideo.controls = true;
  // }

  // function play() {
  //   let playBack = new Blob(blobs, {
  //     type: 'video/webm'
  //   });
  //   recordedVideo.src = window.URL.createObjectURL(playBack);
  //   console.log("playBack: ", playBack);
  // }

  // /*******************************************************************************
  //                              DOWNLOAD FUNCTION
  // /******************************************************************************/
  // function download() {
  //   let blob = new Blob(blobs, { type: 'video/webm' });
  //   let url = window.URL.createObjectURL(blob);
  //   let a = document.createElement('a');
  //   a.style.display = 'none';
  //   a.href = url;
  //   a.download = 'test.webm';
  //   document.body.appendChild(a);
  //   a.click();
  //   setTimeout(function() {
  //     document.body.removeChild(a);
  //     window.URL.revokeObjectURL(url);
  //   }, 100);
  // }



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











// live input



// 'use strict';

// app.controller('liveInputCtrl', function($scope) {
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
  // FLANGER CONTROLS
  // $scope.flangeSlider1 = { value: 0.25 };
  // $scope.flangeSlider2 = { value: 0.005 };
  // $scope.flangeSlider3 = { value: 0.002 };
  // $scope.flangeSlider4 = { value: 0.5 };
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
    outputMix = null,
    dryGain = null,
    wetGain = null,
    effectInput = null,
    currentEffectNode = null,
    dtime = null,
    dregen = null,
    reverbBuffer = null,
    // fldelay = null,
    // flspeed = null,
    // fldepth = null,
    // flfb = null,
    mddelay = null,
    mddepth = null,
    mdspeed = null,
    mdtime = null,
    mdfeedback = null,
    awFollower = null,
    awDepth = null,
    awFilter = null,
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
  console.log("dest: ", dest);

  let constraints = {
    audio: {
      optional: [{
        echoCancellation: false
      }]
    }
  };

  $(function() {
    // $scope.toggleSelectedListener();
    $scope.recordStop();
    $scope.pausePlay();
    $scope.midiSampler();
  });

  MediaStreamTrack.getSources(gotSources);
  // sample rate is the number of samples per second
  console.log("sample rate:", audioContext.sampleRate);

  /*****************************************************************
  //        CONVERT TO MONO
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
  // feedback protection
  *****************************************************************/
  // $scope.createLPInputFilter = function(input) {
  //   lpInputFilter = audioContext.createBiquadFilter();
  //   lpInputFilter.frequency.value = 2048;
  //   console.log("hi feedback protection: ");
  //   return lpInputFilter;
  // };


  /*****************************************************************
  // gotStream function
  *****************************************************************/
  $scope.gotStream = function(stream) {
    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    let input = audioContext.createMediaStreamSource(stream);
    audioInput = $scope.convertToMono(input);

    // if (useFeedbackReduction) {
    //   audioInput.connect($scope.createLPInputFilter());
    //   audioInput = lpInputFilter;

    // }

  let vol = audioContext.createGain();

  let volControl = document.getElementById("liveVolume");
  vol.gain.value = volControl.value;
  vol.connect(audioContext.destination);
  volControl.addEventListener("input", function() {
    vol.gain.value = volControl.value;
  });

    /*****************************************************************
    // Gain Mix Modes
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
    // console.log("outputMix: ", outputMix);
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

  function gotSources(sourceInfos) {
    let audioSelect = document.getElementById("audioinput");
    for (let i = 0; i != sourceInfos.length; ++i) {
      let sourceInfo = sourceInfos[i];
      if (sourceInfo.kind === 'audio') {
        let option = document.createElement("option");
        option.value = sourceInfo.id;
        option.text = sourceInfo.label;
        audioSelect.appendChild(option);
      }
    }
    audioSelect.onchange = $scope.changeInput;
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
    // fldelay = null;
    // flspeed = null;
    // fldepth = null;
    // flfb = null;
    mddelay = null;
    mddepth = null;
    mdspeed = null;
    mdtime = null;
    mdfeedback = null;
    awFollower = null;
    awDepth = null;
    awFilter = null;
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
        // case 4: // AutoWah
        // currentEffectNode = $scope.createAutowah();
        // break;
        // case 5: // Flanger2
        // currentEffectNode = $scope.createFlange();
        // break;
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

  // $scope.createAutowah = function() {
  //   var inputNode = audioContext.createGain();
  //   var waveshaper = audioContext.createWaveShaper();
  //   awFollower = audioContext.createBiquadFilter();
  //   awFollower.type = "lowpass";
  //   awFollower.frequency.value = 10.0;

  //   var curve = new Float32Array(65536);
  //   for (var i = -32768; i < 32768; i++)
  //     curve[i + 32768] = ((i > 0) ? i : -i) / 32768;
  //   waveshaper.curve = curve;
  //   waveshaper.connect(awFollower);

  //   awDepth = audioContext.createGain();
  //   awDepth.gain.value = 11585;
  //   awFollower.connect(awDepth);

  //   awFilter = audioContext.createBiquadFilter();
  //   awFilter.type = "lowpass";
  //   awFilter.Q.value = 15;
  //   awFilter.frequency.value = 50;
  //   awDepth.connect(awFilter.frequency);
  //   awFilter.connect(wetGain);

  //   inputNode.connect(waveshaper);
  //   inputNode.connect(awFilter);
  //   return inputNode;
  // };

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

  /*******************************************************************************
                              VARIABLES
  /******************************************************************************/

  // function toggleRecording() {
  //   if (recordButton.textContent === 'RECORD LOOP') {
  //     $scope.startRecording();
  //   } else {
  //     pause();
  //     recordButton.textContent = 'RECORD LOOP';
  //     playButton.disabled = false;
  //     pauseButton.disabled = false;
  //     downloadButton.disabled = false;
  //   }
  // }

  $scope.recordStop = function() {
    $('#recordStop').click(function() {
      let $span = $(this).children("span");
      if ($span.hasClass('glyphicon-record')) {
        $span.removeClass('glyphicon-record');
        $span.addClass('glyphicon-stop animated infinite pulse');
        console.log("hi");

        $scope.startRecording();

      } else {
        console.log("bye");
        pause();
        $span.addClass('glyphicon-record');
        $span.removeClass('glyphicon-stop animated infinite pulse');
        playButton.disabled = false;
        // pauseButton.disabled = false;
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
        // $scope.startRecording();
      } else {
        pause();
        $span.addClass('glyphicon-play');
        $span.removeClass('glyphicon-stop animated infinite pulse');
        playButton.disabled = false;
        // pauseButton.disabled = false;
        downloadButton.disabled = false;
      }
    });
  };


  // $scope.handleStop = function(event) {
  //   // cancelAnimationFrame(timeoutId);
  //   $(".pad").removeClass("playing");
  //   console.log("clicked stop");
  // };

  // $scope.toggleSelectedListener = function() {
  //   $('.pad').click(function() {
  //     $(this).toggleClass("selected");
  //   });
  // };



  let mediaSource = new MediaSource();
  let mediaRecorder;
  let blobs;
  let liveVideo = document.getElementById('live');
  let recordedVideo = document.getElementById('recorded');

  // Button Variables
  // let recordButton = document.getElementById('recordButton');
  // recordButton.onclick = toggleRecording;

  let playButton = document.getElementById('pausePlay');
  playButton.onclick = play;

  // let pauseButton = document.getElementById('pauseButton');
  // pauseButton.onclick = pause;

  let downloadButton = document.getElementById('downloadButton');
  downloadButton.onclick = download;

  // ecord audio and/or video
  let audioVideo = {
    audio: true,
    video: false
  };
  /*******************************************************************************
                                 LIVE STREAM
  /******************************************************************************/
  function handleSuccess(stream) {
    // recordButton.disabled = false;
    console.log('stream: ', stream);
    window.stream = stream;
    if (window.URL) {
      console.log("window.URL: ", window.URL);
      console.log("window: ", window);

      // The Window.URL property returns an object that provides static
      // methods used for creating and managing object URLs. It can also be
      // called as a constructor to construct URL objects.

      liveVideo.src = window.URL.createObjectURL(stream);
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
    console.log('Recorder stopped: ', event);
  }

  /*******************************************************************************
                               TOGGLE Recording (start/stop)
  /******************************************************************************/

  // function toggleRecording() {
  //   if (recordButton.textContent === 'RECORD LOOP') {
  //     $scope.startRecording();
  //   } else {
  //     pause();
  //     recordButton.textContent = 'RECORD LOOP';
  //     playButton.disabled = false;
  //     pauseButton.disabled = false;
  //     downloadButton.disabled = false;
  //   }
  // }

  /*******************************************************************************
                               Start Recording FUNCTION
  /******************************************************************************/

  // $scope.recordStop = function() {
  //   $('#play-pause').click(function() {
  //     let $span = $(this).children("span");
  //     if ($span.hasClass('glyphicon-play')) {
  //       $span.removeClass('glyphicon-play');
  //       $span.addClass('glyphicon-pause');
  //       $scope.handlePlay();
  //     } else {
  //       $span.addClass('glyphicon-play');
  //       $span.removeClass('glyphicon-pause');
  //       $scope.handleStop();
  //     }
  //   });
  // };

  $scope.startRecording = function() {
    // function startRecording() {
    blobs = [];
    mediaRecorder = new MediaRecorder(dest.stream);
    // recordButton.textContent = 'STOP LOOP';
    playButton.disabled = true;
    // pauseButton.disabled = true;
    downloadButton.disabled = true;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    // mediaRecorder.start(10); this indicates 10ms of data per blob...not sure how that affects anything quite yet....
    mediaRecorder.start(10);
    console.log('MediaRecorder start: ', mediaRecorder);
  };

  /*******************************************************************************
                              STOP RECORDING function
  /******************************************************************************/

  // $scope.stopRecording = function() {
  //   // function stopRecording() {
  //     mediaRecorder.stop();
  //     console.log('blobs: ', blobs);
  //     recordedVideo.controls = false;
  //   };

  function play() {
    let playBack = new Blob(blobs, {
      type: 'video/webm'
    });
    recordedVideo.src = window.URL.createObjectURL(playBack);
    console.log("recordedVideo: ", recordedVideo);
    console.log("recordedVideo.src: ", recordedVideo.src);
    console.log("playBack: ", playBack);
  }

  function pause() {
    let pausePlay = mediaRecorder.pause();
    recordedVideo.src = window.URL.pausePlay;
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




  //   // /**********************************************************************
  //   //                                KICK DRUM
  //   // **********************************************************************/

  //   // the sound starts at a higher frequency — the ‘attack’ phase -
  //   // and then rapidly falls away to a lower frequency.
  //   // While this is happening, the volume of the sound also decreases.

  //   $scope.Kick = function(audioContext) {
  //     this.audioContext = audioContext;
  //   };

  //   $scope.Kick.prototype.setup = function() {
  //     this.osc = this.audioContext.createOscillator();
  //     this.gain = this.audioContext.createGain();
  //     this.osc.connect(this.gain);
  //     this.gain.connect(this.audioContext.destination);
  //   };

  //   $scope.Kick.prototype.trigger = function(time) {
  //     this.setup();

  //     this.osc.frequency.setValueAtTime(150, time);
  //     // the “envelope” of the sound:
  //     this.gain.gain.setValueAtTime(1, time);

  //     // // drop the FREQUENCY of the oscillator rapidly after the initial attack.
  //     this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

  //     // // decrease the GAIN to close to zero over the next 0.5 seconds
  //     this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  //     this.osc.start(time);

  //     this.osc.stop(time + 0.5);
  //   };


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
      console.log("inputs: ", inputs);
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
      console.log("object.source: ", object.source);
      // loadAudio(object, object.source);
      object.play = function(volume) {
        let s = audioContext.createBufferSource();
        s.buffer = object.buffer;
        s.connect(audioContext.destination);
        s.start();
      };
    }
  };
// });




























});
