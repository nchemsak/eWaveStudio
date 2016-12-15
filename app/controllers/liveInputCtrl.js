'use strict';

app.controller('liveInputCtrl', function($scope) {
  $scope.title = "Live Input";
  $scope.slider = { value: 0.75 };
  $scope.slider2 = { value: 0.5 };
  $scope.slider3 = { value: 0.5 };
  $scope.dropdown = { value: '' };
  $scope.dropdown2 = { value: '' };
  $scope.ngControls = { value: '' };
  $scope.flangeSlider1 = { value: 0.25 };
  $scope.flangeSlider2 = { value: 0.005 };
  $scope.flangeSlider3 = { value: 0.002 };
  $scope.flangeSlider4 = { value: 0.5 };


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
    // console.log("gain1: ", gain1);
    // console.log("gain2: ", gain2);
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

    if (currentEffectNode)
      currentEffectNode.disconnect();
    if (effectInput)
      effectInput.disconnect();

    // let audioSource = $scope.dropdown.index;

    let effect = document.getElementById("effect").selectedIndex;
    let effect2 = $scope.dropdown2.index;


    let effectControls = document.getElementById("controls");


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
      case 1: // flanger
        currentEffectNode = $scope.createFlange();
        // console.log("currentEffectNode: ", currentEffectNode);
        break;
      case 2: // Autowah
        currentEffectNode = $scope.createAutowah();
        // console.log("currentEffectNode: ", currentEffectNode);
        break;
      case 3: //Gain LFO
        currentEffectNode = $scope.createGainLFO();
        break;
      case 4: // Telephone
        currentEffectNode = $scope.createTelephonizer();
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

    let gainNode = audioContext.createGain();
    gainNode.gain.value = parseFloat($scope.slider3.value);
    dregen = gainNode;

    // audioInput.connect(delayNode);
    gainNode.connect(delayNode);
    delayNode.connect(gainNode);
    delayNode.connect(wetGain);
    return delayNode;

  };


  $scope.createFlange = function() {
    var delayNode = audioContext.createDelay();
    delayNode.delayTime.value = parseFloat($scope.flangeSlider1.value);
    fldelay = delayNode;

    var inputNode = audioContext.createGain();
    var feedback = audioContext.createGain();
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();
    gain.gain.value = parseFloat($scope.flangeSlider2.value);
    fldepth = gain;

    feedback.gain.value = parseFloat($scope.flangeSlider3.value);
    flfb = feedback;

    osc.type = 'sine';
    osc.frequency.value = parseFloat($scope.flangeSlider4.value);
    flspeed = osc;

    osc.connect(gain);
    gain.connect(delayNode.delayTime);

    inputNode.connect(wetGain);
    inputNode.connect(delayNode);
    delayNode.connect(wetGain);
    delayNode.connect(feedback);
    feedback.connect(inputNode);

    osc.start(0);

    return inputNode;
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

  $scope.createGainLFO = function() {
    // function createGainLFO() {
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();
    var depth = audioContext.createGain();

    osc.type = document.getElementById("lfotype").value;
    osc.frequency.value = parseFloat(document.getElementById("lfo").value);

    gain.gain.value = 1.0; // to offset
    depth.gain.value = 1.0;
    osc.connect(depth); // scales the range of the lfo


    depth.connect(gain.gain);
    gain.connect(wetGain);
    lfo = osc;
    lfotype = osc;
    lfodepth = depth;


    osc.start(0);
    return gain;
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





});
