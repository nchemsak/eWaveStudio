'use strict';

app.controller('liveInputCtrl', function($scope) {
  $scope.title = "Live Input";
  $scope.slider = { value: 0 };
  $scope.slider2 = { value: 0 };
  $scope.slider3 = { value: 0 };
  $scope.dropdown = { value: '' };
  $scope.dropdown2 = { value: '' };
  // $scope.ngControls = {};

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
    let splitter = audioContext.createChannelSplitter(2);
    let merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
  };

  /*****************************************************************
  // for feedback protection
  *****************************************************************/
  $scope.createLPInputFilter = function(input) {
    // function createLPInputFilter() {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
  };

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
    // console.log("outputMix: ", outputMix);
    $scope.crossfade(1.0);
    $scope.changeEffect();
  };

  /*****************************************************************
  // This selects the items from the dropdown
  *****************************************************************/
  $scope.changeInput = function() {
    // let audioSelect = document.getElementById("audioinput");
    let audioSource = $scope.dropdown.index;

    constraints.audio.optional.push({ sourceId: audioSource });
    navigator.getUserMedia(constraints, $scope.gotStream, function(e) {
      console.log(e);
    });
  };

  /*****************************************************************
  // This produces the drop down list of inputs
  *****************************************************************/

  function gotSources(sourceInfos) {
    let audioSelect = document.getElementById("audioinput");

    //add this back in to have "default" as the first selected option
    // while (audioSelect.firstChild)
    //   audioSelect.removeChild(audioSelect.firstChild);

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
  // CROSSFADE is responsible for changing the amount of the effect relative
  to volume (dry gain and wet gain)
  *****************************************************************/
  $scope.crossfade = function() {
    let gain1 = Math.cos($scope.slider.value * 0.5 * Math.PI);
    dryGain.gain.value = gain1;
    let gain2 = Math.cos((1.0 - $scope.slider.value) * 0.5 * Math.PI);
    wetGain.gain.value = gain2;
    console.log("gain1: ", gain1);
    console.log("gain2: ", gain2);
  };
  let lastEffect = -1;


  /*****************************************************************
  // Handles changing effects with a switch statement
  *****************************************************************/
  $scope.changeEffect = function() {
    // function changeEffect() {

    if (currentEffectNode)
      currentEffectNode.disconnect();
    if (effectInput)
      effectInput.disconnect();

    let effect = document.getElementById("effect").selectedIndex;
    let effect2 = $scope.dropdown2.selectedIndex;
    console.log("effect2: ", effect2);
    console.log("effect: ", effect);

    let effectControls = document.getElementById("controls");
    let effectControls2 = $scope.ngControls;

    // Show and hide individual effects options
    if (lastEffect > -1)
      effectControls.children[lastEffect].classList.remove("display");
    lastEffect = effect;
    effectControls.children[effect].classList.add("display");

    switch (effect) {
      case 0: // delayNode
        currentEffectNode = $scope.createdDelay();
        console.log("currentEffectNode: ", currentEffectNode);
        break;
      case 1: // Reverb
        // currentEffectNode = $scope.createTelephonizer();
        console.log("currentEffectNode: ", currentEffectNode);
        break;
      case 3: // Telephone
        // currentEffectNode = $scope.createReverb();
        console.log("currentEffectNode: ", currentEffectNode);
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
    console.log("delayNode.delayTime.value: ", delayNode.delayTime.value);
    let gainNode = audioContext.createGain();
    gainNode.gain.value = parseFloat($scope.slider3.value);

    audioInput.connect(delayNode);
    gainNode.connect(delayNode);
    delayNode.connect(gainNode);
    delayNode.connect(wetGain);
    return delayNode;

  };

















  $scope.createTelephonizer = function() {
    var lpf1 = audioContext.createBiquadFilter();
    lpf1.type = "lowpass";
    lpf1.frequency.value = 2000.0;
    var lpf2 = audioContext.createBiquadFilter();
    lpf2.type = "lowpass";
    lpf2.frequency.value = 2000.0;
    var hpf1 = audioContext.createBiquadFilter();
    hpf1.type = "highpass";
    hpf1.frequency.value = 500.0;
    var hpf2 = audioContext.createBiquadFilter();
    hpf2.type = "highpass";
    hpf2.frequency.value = 500.0;
    lpf1.connect(lpf2);
    lpf2.connect(hpf1);
    hpf1.connect(hpf2);
    hpf2.connect(wetGain);
    currentEffectNode = lpf1;
    return (lpf1);
  };


  $scope.createReverb = function() {
    // function createReverb() {
    var convolver = audioContext.createConvolver();
    convolver.buffer = reverbBuffer; // impulseResponse( 2.5, 2.0 );  // reverbBuffer;
    convolver.connect(wetGain);
    return convolver;
  };

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
  // function toggleMono() {
  //   if (audioInput != realAudioInput) {
  //     audioInput.disconnect();
  //     realAudioInput.disconnect();
  //     audioInput = realAudioInput;
  //   } else {
  //     realAudioInput.disconnect();
  //     audioInput = convertToMono(realAudioInput);
  //   }
  //   createLPInputFilter();
  //   lpInputFilter.connect(dryGain);
  //   // lpInputFilter.connect(analyser1);
  //   lpInputFilter.connect(effectInput);
  // }



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






  // LFO START



  // $scope.lfoStart2 = function() {
  //   let osc = audioContext.createOscillator();
  //   let vol = audioContext.createGain();
  //   let panner = audioContext.createStereoPanner();
  //   let freqGain = audioContext.createGain();
  //   let lfo = audioContext.createOscillator();
  //   let distortion = audioContext.createWaveShaper();


  //   // get html controls
  //   // let volControl = $scope.volume.value;
  //   // console.log("volControl: ", $scope.volControl);
  //   // document.getElementById("volume");
  //   // let panControl = document.getElementById("panner");
  //   // let panControl = $scope.panner.value;

  //   //PANNER
  //   panner.connect(audioContext.destination);

  //   // VOLUME
  //   // vol.gain.value = $scope.volControl.value;
  //   vol.connect(panner);

  //   //distortion
  //   distortion.oversample = '4x';
  //   distortion.connect(vol);

  //   // OSCILLATOR
  //   osc.frequency.value = 440;
  //   osc.connect(distortion);


  //   // LFO
  //   freqGain.gain.value = 100;
  //   freqGain.connect(osc.frequency);

  //   lfo.frequency.value = 1;
  //   lfo.connect(freqGain);
  //   lfo.type = 'square';


  //   // LISTENERS

  //   // volControl.addEventListener("input", function() {
  //   // $scope.volControl = function() {
  //   //   vol.gain.value = $scope.volControl.value;

  //   // };
  //   // // });
  //   // $scope.panControl = function() {
  //   //   panner.pan.value = $scope.panControl.value;
  //   // };

  //   osc.start();
  //   lfo.start();


  //   // LFO Stop
  //   // document.getElementById('lfoStop2').addEventListener('click', function() {
  //   //   lfo.stop();
  //   //   osc.stop();

  //   // });

  // };
});
