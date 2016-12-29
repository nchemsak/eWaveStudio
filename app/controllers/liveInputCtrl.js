'use strict';


$(document).ready(function(e) {
  try {
    $("body select").msDropDown();
  } catch (e) {
    window.alert(e.message);
  }
});


app.controller('liveInputCtrl', function($scope) {
  // $('.row').toggleClass('animated slideInLeft');
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
  $scope.flangeSlider1 = { value: 0.25 };
  $scope.flangeSlider2 = { value: 0.005 };
  $scope.flangeSlider3 = { value: 0.002 };
  $scope.flangeSlider4 = { value: 0.5 };
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
  let audioInput = null;
  let realAudioInput = null;
  let useFeedbackReduction = true;
  let lpInputFilter = null;
  let outputMix = null;
  let dryGain = null;
  let wetGain = null;
  let effectInput = null;
  let currentEffectNode = null;
  let dtime = null;
  let dregen = null;
  let reverbBuffer = null;
  let fldelay = null;
  let flspeed = null;
  let fldepth = null;
  let flfb = null;
  let mddelay = null;
  let mddepth = null;
  let mdspeed = null;
  let mdtime = null;
  let mdfeedback = null;
  let awFollower = null;
  let awDepth = null;
  let awFilter = null;
  let lfo = null;
  let lfotype = null;
  let lfodepth = null;
  let sflldelay = null;
  let sflrdelay = null;
  let sflspeed = null;
  let sflldepth = null;
  let sflrdepth = null;
  let sfllfb = null;
  let sflrfb = null;

  let constraints = {
    audio: {
      optional: [{
        echoCancellation: false
      }]

    }
  };

  MediaStreamTrack.getSources(gotSources);
  // document.getElementById("effect").onchange = $scope.changeEffect;

  /*****************************************************************
  //        CONVERT TO MONO
  *****************************************************************/
  $scope.convertToMono = function(input) {
    // function convertToMono(input) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
  };

  /*****************************************************************
  // feedback protection
  *****************************************************************/
  $scope.createLPInputFilter = function(input) {
    // function createLPInputFilter() {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
  };


  /*****************************************************************
  // gotStream function
  *****************************************************************/
  $scope.gotStream = function(stream) {
    // function gotStream(stream) {
    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    let input = audioContext.createMediaStreamSource(stream);

    audioInput = $scope.convertToMono(input);

    if (useFeedbackReduction) {
      audioInput.connect($scope.createLPInputFilter());
      audioInput = lpInputFilter;

    }
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
    outputMix.connect(audioContext.destination);
    $scope.crossfade(1.0);
    $scope.changeEffect();
  };

  /*****************************************************************
  // This selects the items from the dropdown  GET USER MEDIA API
  *****************************************************************/
  $scope.changeInput = function() {
    // let audioSelect = document.getElementById("audioinput");
    var audioSource = $scope.dropdown.index;

    constraints.audio.optional.push({ sourceId: audioSource });
    navigator.getUserMedia(constraints, $scope.gotStream, function(e) {
      console.log(e);
    });
  };

  /*****************************************************************
  // This produces the drop down list of inputs
  *****************************************************************/

  function gotSources(sourceInfos) {
    var audioSelect = document.getElementById("audioinput");

    //add this back in to have "default" as the first selected option
    // while (audioSelect.firstChild)
    //   audioSelect.removeChild(audioSelect.firstChild);

    for (var i = 0; i != sourceInfos.length; ++i) {
      var sourceInfo = sourceInfos[i];
      if (sourceInfo.kind === 'audio') {
        var option = document.createElement("option");
        option.value = sourceInfo.id;
        option.text = sourceInfo.label;
        audioSelect.appendChild(option);
      }
    }
    audioSelect.onchange = $scope.changeInput;
  }



  /*****************************************************************
  // CROSSFADE is responsible for changing the amount of the effect relative
  to volume (dry gain and wet gain)
  *****************************************************************/
  $scope.crossfade = function() {
    let gain1 = Math.cos($scope.slider.value * 0.5 * Math.PI);
    dryGain.gain.value = gain1;
    let gain2 = Math.cos((1.0 - $scope.slider.value) * 0.5 * Math.PI);
    wetGain.gain.value = gain2;
  };
  var lastEffect = -1;


  /*****************************************************************
  // Handles changing effects with a switch statement
  *****************************************************************/
  $scope.changeEffect = function() {
    // function changeEffect() {
    dtime = null;
    dregen = null;
    fldelay = null;
    flspeed = null;
    fldepth = null;
    flfb = null;
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

    // let audioSource = $scope.dropdown.index;

    var effect = document.getElementById("effect").selectedIndex;
    var effect2 = $scope.dropdown2.index;


    var effectControls = document.getElementById("controls");


    // Show and hide individual effects options
    if (lastEffect > -1)
      effectControls.children[lastEffect].classList.remove("display");
    lastEffect = effect;
    effectControls.children[effect].classList.add("display");

    switch (effect) {
      case 0: // Delay
        currentEffectNode = $scope.createdDelay();
        // console.log("currentEffectNode: ", currentEffectNode);
        break;
        // case 1: // mod delay
        // currentEffectNode = $scope.createModDelay();
        // console.log("currentEffectNode: ", currentEffectNode);
        // break;
      case 1: // lfo
        currentEffectNode = $scope.lfo();
        // console.log("currentEffectNode: ", currentEffectNode);
        break;
      case 2: // Flanger
        currentEffectNode = $scope.flanger();

        // console.log("currentEffectNode: ", currentEffectNode);
        break;
      case 3: //Telephone EQ
        currentEffectNode = $scope.telephoneEQ();
        break;
      case 4: // AutoWah
        currentEffectNode = $scope.createAutowah();
        break;
      case 5: // Flanger2
        // currentEffectNode = $scope.createFlange();

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

    var delayNode = audioContext.createDelay();
    delayNode.delayTime.value = parseFloat($scope.slider2.value);
    dtime = delayNode;

    var gainNode = audioContext.createGain();
    gainNode.gain.value = parseFloat($scope.slider3.value);
    dregen = gainNode;

    // audioInput.connect(delayNode);
    gainNode.connect(delayNode);
    delayNode.connect(gainNode);
    delayNode.connect(wetGain);
    return delayNode;

  };

  $scope.createAutowah = function() {
    // function createAutowah() {
    var inputNode = audioContext.createGain();
    var waveshaper = audioContext.createWaveShaper();
    awFollower = audioContext.createBiquadFilter();
    awFollower.type = "lowpass";
    awFollower.frequency.value = 10.0;

    var curve = new Float32Array(65536);
    for (var i = -32768; i < 32768; i++)
      curve[i + 32768] = ((i > 0) ? i : -i) / 32768;
    waveshaper.curve = curve;
    waveshaper.connect(awFollower);

    awDepth = audioContext.createGain();
    awDepth.gain.value = 11585;
    awFollower.connect(awDepth);

    awFilter = audioContext.createBiquadFilter();
    awFilter.type = "lowpass";
    awFilter.Q.value = 15;
    awFilter.frequency.value = 50;
    awDepth.connect(awFilter.frequency);
    awFilter.connect(wetGain);

    inputNode.connect(waveshaper);
    inputNode.connect(awFilter);
    return inputNode;
  };

  $scope.lfo = function() {
    // function lfo() {
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();
    var depth = audioContext.createGain();

    osc.type = $scope.lfoDropdown.value;
    osc.frequency.value = parseFloat($scope.lfoSlider1.value);

    // lfodepth.gain.value = parseFloat($scope.lfoSlider2.value);

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
    var lpf1 = audioContext.createBiquadFilter();
    lpf1.type = "lowpass";
    lpf1.frequency.value = 2000.0;
    var lpf2 = audioContext.createBiquadFilter();
    lpf2.type = "lowpass";
    lpf2.frequency.value = 2000.0;
    var hpf1 = audioContext.createBiquadFilter();
    hpf1.type = "highpass";
    hpf1.frequency.value = 1000.0;
    var hpf2 = audioContext.createBiquadFilter();
    hpf2.type = "highpass";
    hpf2.frequency.value = 1000.0;
    lpf1.connect(lpf2);
    lpf2.connect(hpf1);
    hpf1.connect(hpf2);
    hpf2.connect(wetGain);
    currentEffectNode = lpf1;
    return (lpf1);
  };



  $scope.flanger = function() {

    // function flanger() {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);
    var inputNode = audioContext.createGain();
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
  let mediaSource = new MediaSource();
  // mediaSource.addEventListener('sourceopen', false);
  let mediaRecorder;
  let blobs;
  let liveVideo = document.getElementById('live');
  let recordedVideo = document.getElementById('recorded');

  // Button Variables
  let recordButton = document.getElementById('recordButton');
  recordButton.onclick = toggleRecording;

  let playButton = document.getElementById('playButton');
  playButton.onclick = play;

  let downloadButton = document.getElementById('downloadButton');
  downloadButton.onclick = download;

  // Indicate whether to record audio and/or video
  let audioVideo = {
    audio: true,
    // video: true
  };
  /*******************************************************************************
                                 LIVE STREAM
  /******************************************************************************/
  function handleSuccess(stream) {
    recordButton.disabled = false;
    console.log('stream: ', stream);
    window.stream = stream;
    if (window.URL) {
      console.log("window.URL: ", window.URL);
      console.log("window: ", window);

      // The Window.URL property returns an object that provides static methods used for creating and managing object URLs. It can also be called as a constructor to construct URL objects.

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

  function toggleRecording() {
    if (recordButton.textContent === 'Start Recording') {
      startRecording();
    } else {
      stopRecording();
      recordButton.textContent = 'Start Recording';
      playButton.disabled = false;
      downloadButton.disabled = false;
    }
  }

  /*******************************************************************************
                               Start Recording FUNCTION
  /******************************************************************************/

  function startRecording() {
    blobs = [];
    mediaRecorder = new MediaRecorder(window.stream);
    recordButton.textContent = 'STOP Recording';
    playButton.disabled = true;
    downloadButton.disabled = true;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    // mediaRecorder.start(10); this indicates 10ms of data per blob...not sure how that affects anything quite yet....
    mediaRecorder.start(10);
    console.log('MediaRecorder start: ', mediaRecorder);
  }

  /*******************************************************************************
                              STOP RECORDING function
  /******************************************************************************/

  function stopRecording() {
    mediaRecorder.stop();
    console.log('blobs: ', blobs);
    recordedVideo.controls = true;
  }

  function play() {
    let playBack = new Blob(blobs, {
      type: 'video/webm'
    });
    recordedVideo.src = window.URL.createObjectURL(playBack);
    console.log("playBack: ", playBack);
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
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }




  // $scope.visualize = function() {
  //   // function visualize() {
  //   WIDTH = canvas.width;
  //   HEIGHT = canvas.height;


  //   var visualSetting = visualSelect.value;
  //   console.log(visualSetting);

  //   if (visualSetting == "sinewave") {
  //     analyser.fftSize = 2048;
  //     var bufferLength = analyser.fftSize;
  //     console.log(bufferLength);
  //     var dataArray = new Uint8Array(bufferLength);

  //     canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  //     function draw() {

  //       drawVisual = requestAnimationFrame(draw);

  //       analyser.getByteTimeDomainData(dataArray);

  //       canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  //       canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  //       canvasCtx.lineWidth = 2;
  //       canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  //       canvasCtx.beginPath();

  //       var sliceWidth = WIDTH * 1.0 / bufferLength;
  //       var x = 0;

  //       for (var i = 0; i < bufferLength; i++) {

  //         var v = dataArray[i] / 128.0;
  //         var y = v * HEIGHT / 2;

  //         if (i === 0) {
  //           canvasCtx.moveTo(x, y);
  //         } else {
  //           canvasCtx.lineTo(x, y);
  //         }

  //         x += sliceWidth;
  //       }

  //       canvasCtx.lineTo(canvas.width, canvas.height / 2);
  //       canvasCtx.stroke();
  //     }

  //     draw();

  //   } else if (visualSetting == "frequencybars") {
  //     analyser.fftSize = 256;
  //     var bufferLength = analyser.frequencyBinCount;
  //     console.log(bufferLength);
  //     var dataArray = new Uint8Array(bufferLength);

  //     canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  //     function draw() {
  //       drawVisual = requestAnimationFrame(draw);

  //       analyser.getByteFrequencyData(dataArray);

  //       canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  //       canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  //       var barWidth = (WIDTH / bufferLength) * 2.5;
  //       var barHeight;
  //       var x = 0;

  //       for (var i = 0; i < bufferLength; i++) {
  //         barHeight = dataArray[i];

  //         canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
  //         canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

  //         x += barWidth + 1;
  //       }
  //     };

  //     draw();

  //   } else if (visualSetting == "off") {
  //     canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  //     canvasCtx.fillStyle = "red";
  //     canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  //   }

  // };














  // $scope.createReverb = function() {
  //   // function createReverb() {
  //   var convolver = audioContext.createConvolver();
  //   convolver.buffer = reverbBuffer; // impulseResponse( 2.5, 2.0 );  // reverbBuffer;
  //   convolver.connect(wetGain);
  //   return convolver;
  // };

  /*****************************************************************
  // THis WAS FOR ICONS SELECTION IF I WANTED TO USE IT...PUT ABOVE CONVERT TO MONO FUNCTION
  *****************************************************************/
  // $(".classrow").click(function(event) {
  //   let idValue = event.target.id;
  //   console.log("idValue: ", idValue);
  //   // MICROPHONE
  //   if (idValue === "microphone") {
  //     navigator.getUserMedia(constraints, gotStream, function(e) {
  //       // console.log("error", e);
  //     });
  //     console.log("you clicked on microphone");
  //     // USB
  //   } else if (idValue === "usb") {
  //     // navigator.getUserMedia(constraints, gotStream, function(e) {
  //     // console.log("error", e);
  //     // });
  //     console.log("you clicked on usb");
  //   }
  // });



  /*****************************************************************
  //          TOGGLE MONO ON/OFF ...IF I WANT TO ADD BACK IN...
  *****************************************************************/
  // $scope.toggleMono = function() {
  //   if (audioInput != realAudioInput) {
  //     audioInput.disconnect();
  //     realAudioInput.disconnect();
  //     audioInput = realAudioInput;
  //   } else {
  //     realAudioInput.disconnect();
  //     audioInput = $scope.convertToMono(realAudioInput);
  //   }
  //   $scope.createLPInputFilter();
  //   lpInputFilter.connect(dryGain);
  //   // lpInputFilter.connect(analyser1);
  //   lpInputFilter.connect(effectInput);
  // };



  /*****************************************************************
  // for the reverb effect
  *****************************************************************/
  // function initAudio() {
  //   let irRRequest = new XMLHttpRequest();
  //   irRRequest.open("GET", "audio/cardiod-rear-levelled.wav", true);
  //   irRRequest.responseType = "arraybuffer";
  //   irRRequest.onload = function() {
  //     audioContext.decodeAudioData(irRRequest.response,
  //       function(buffer) { reverbBuffer = buffer; });
  //   };
  //   document.getElementById("effect").onchange = changeEffect;
  // }
  // window.addEventListener('load', initAudio);




  // var audioContext = new AudioContext();
  // sample rate is the number of samples per second
  console.log("sample rate:", audioContext.sampleRate);



  // audioRecorder = new WebAudioRecorder(sourceNode, {
  //   workerDir: "lib/node_modules/webAudioRecorder/"
  // });

  // console.log("audioRecorder: ", audioRecorder);



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
});
