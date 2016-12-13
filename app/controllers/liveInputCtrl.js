'use strict';

app.controller('liveInputCtrl', function($scope, ItemStorage) {

  $scope.title = "Live Input";


  // navigator.getUserMedia = navigator.getUserMedia ||
  //   navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();

  // window.addEventListener('load', initAudio);

  var audioInput = null;
  var realAudioInput = null;
  var useFeedbackReduction = true;
  var lpInputFilter = null;
  var outputMix = null;
  var dryGain = null;
  var wetGain = null;
  var effectInput = null;
  var currentEffectNode = null;
  var lastEffect = -1;
  var dtime = null;
  var dregen = null;
  var rafID = null;
  var reverbBuffer = null;

  var constraints = {
    audio: {
      optional: [{
        echoCancellation: false
      }]

    }
  };



  navigator.getUserMedia(constraints, gotStream, function(e) {
    console.log("error", e);
  });


  MediaStreamTrack.getSources(gotSources);
  document.getElementById("effect").onchange = changeEffect;




  function convertToMono(input) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
  }

  // function updateAnalysers(time) {
  //   // analyserView1.doFrequencyAnalysis( analyser1 );
  //   // analyserView2.doFrequencyAnalysis( analyser2 );

  //   rafID = window.requestAnimationFrame(updateAnalysers);
  // }


  function createLPInputFilter() {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
  }


  function toggleMono() {
    if (audioInput != realAudioInput) {
      audioInput.disconnect();
      realAudioInput.disconnect();
      audioInput = realAudioInput;
    } else {
      realAudioInput.disconnect();
      audioInput = convertToMono(realAudioInput);
    }

    createLPInputFilter();
    lpInputFilter.connect(dryGain);
    // lpInputFilter.connect(analyser1);
    lpInputFilter.connect(effectInput);
  }

  function gotStream(stream) {
    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    var input = audioContext.createMediaStreamSource(stream);

    audioInput = convertToMono(input);

    if (useFeedbackReduction) {
      audioInput.connect(createLPInputFilter());
      audioInput = lpInputFilter;

    }
    // create mix gain nodes
    outputMix = audioContext.createGain();
    dryGain = audioContext.createGain();
    wetGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(dryGain);
    // audioInput.connect(analyser1);
    audioInput.connect(effectInput);
    dryGain.connect(outputMix);
    wetGain.connect(outputMix);
    outputMix.connect(audioContext.destination);
    console.log("outputMix: ", outputMix);
    // outputMix.connect(analyser2);
    crossfade(1.0);
    changeEffect();
    // cancelAnalyserUpdates();
    // updateAnalysers();
  }

  function changeInput() {
    // if (!!window.stream) {
    //   window.stream.stop();
    // }
    var audioSelect = document.getElementById("audioinput");
    var audioSource = audioSelect.value;
    console.log("audioSource: ", audioSource);
    constraints.audio.optional.push({ sourceId: audioSource });
    console.log("constraints.audio.optional: ", constraints.audio.optional);
    console.log("constraints: ", constraints);
    navigator.getUserMedia(constraints, gotStream, function(e) {
      // alert('Error getting audio');
      console.log(e);
    });
  }


  function gotSources(sourceInfos) {
    var sourceInfo = sourceInfos[2];

    var audioSelect = document.getElementById("audioinput");

    for (var i = 2; i !== sourceInfos.length; ++i) {
      // var sourceInfo = sourceInfos[i];
      // var option = document.createElement('option');
      // option.value = sourceInfo.id;
      console.log("sourceInfo.kind: ", sourceInfo.kind);
      console.log("sourceInfo.label: ", sourceInfo.label);
      if
      //   (sourceInfo.kind === 'audio') {
      //   option.text = sourceInfo.label || 'microphone ' +
      //     (audioSelect.length + 1);
      //   audioSelect.appendChild(option);
      // } else if
      (sourceInfo.label === 'USB Audio Device') {
        var option = document.createElement("option");
        console.log("option: ", option);
        option.value = sourceInfo.id;
        console.log("audioSelect: ", audioSelect);
        audioSelect.appendChild(option);


      }

    }
    audioSelect.onchange = changeInput;

  }

  function initAudio() {
    var irRRequest = new XMLHttpRequest();
    irRRequest.open("GET", "audio/cardiod-rear-levelled.wav", true);
    irRRequest.responseType = "arraybuffer";
    irRRequest.onload = function() {
      audioContext.decodeAudioData(irRRequest.response,
        function(buffer) { reverbBuffer = buffer; });
    };
    irRRequest.send();
  }




  // navigator.getUserMedia(constraints, gotStream, function(e) {
  //   console.log("error", e);
  // });


  // MediaStreamTrack.getSources(gotSources);
  // document.getElementById("effect").onchange = changeEffect;




  function crossfade(value) {
    // equal-power crossfade
    var gain1 = Math.cos(value * 0.5 * Math.PI);
    var gain2 = Math.cos((1.0 - value) * 0.5 * Math.PI);

    dryGain.gain.value = gain1;
    wetGain.gain.value = gain2;
  }


  function changeEffect() {
    // lfo = null;
    dtime = null;
    dregen = null;
    // cspeed = null;
    // cdelay = null;
    // cdepth = null;
    // rmod = null;
    // fldelay = null;
    // flspeed = null;
    // fldepth = null;
    // flfb = null;
    // scspeed = null;
    // scldelay = null;
    // scrdelay = null;
    // scldepth = null;
    // scrdepth = null;
    // sflldelay = null;
    // sflrdelay = null;
    // sflspeed = null;
    // sflldepth = null;
    // sflrdepth = null;
    // sfllfb = null;
    // sflrfb = null;
    // rmod = null;
    // mddelay = null;
    // mddepth = null;
    // mdspeed = null;
    // lplfo = null;
    // lplfodepth = null;
    // lplfofilter = null;
    // awFollower = null;
    // awDepth = null;
    // awFilter = null;
    // ngFollower = null;
    // ngGate = null;
    // bitCrusher = null;

    if (currentEffectNode)
      currentEffectNode.disconnect();
    if (effectInput)
      effectInput.disconnect();

    var effect = document.getElementById("effect").selectedIndex;
    console.log("effect: ", effect);
    var effectControls = document.getElementById("controls");
    if (lastEffect > -1)
      effectControls.children[lastEffect].classList.remove("display");
    lastEffect = effect;
    effectControls.children[effect].classList.add("display");

    switch (effect) {
      case 0: // Delay
        currentEffectNode = createDelay();
        break;
      case 1: // Reverb
        currentEffectNode = createReverb();
        break;
        // case 2: // Distortion
        //   currentEffectNode = createDistortion();
        //   break;
        // case 3: // Telephone
        //   currentEffectNode = createTelephonizer();
        //   break;
        // case 4: // GainLFO
        //   currentEffectNode = createGainLFO();
        //   break;
        // case 5: // Chorus
        //   currentEffectNode = createChorus();
        //   break;
        // case 6: // Flange
        //   currentEffectNode = createFlange();
        //   break;
        // case 7: // Ringmod
        //   currentEffectNode = createRingmod();
        //   break;
        // case 8: // Stereo Chorus
        //   currentEffectNode = createStereoChorus();
        //   break;
        // case 9: // Stereo Flange
        //   currentEffectNode = createStereoFlange();
        //   break;
        // case 10: // Pitch shifting
        //   currentEffectNode = createPitchShifter();
        //   break;
        // case 11: // Mod Delay
        //   currentEffectNode = createModDelay();
        //   break;
        // case 12: // Ping-pong delay
        //   var pingPong = createPingPongDelay(audioContext, (audioInput == realAudioInput), 0.3, 0.4);
        //   pingPong.output.connect(wetGain);
        //   currentEffectNode = pingPong.input;
        //   break;
        // case 13: // LPF LFO
        //   currentEffectNode = createFilterLFO();
        //   break;
        // case 14: // Envelope Follower
        //   currentEffectNode = createEnvelopeFollower();
        //   break;
        // case 15: // Autowah
        //   currentEffectNode = createAutowah();
        //   break;
        // case 16: // Noise gate
        //   currentEffectNode = createNoiseGate();
        //   break;
        // case 17: // Wah Bass
        //   var pingPong = createPingPongDelay(audioContext, (audioInput == realAudioInput), 0.5, 0.5);
        //   pingPong.output.connect(wetGain);
        //   pingPong.input.connect(wetGain);
        //   var tempWetGain = wetGain;
        //   wetGain = pingPong.input;
        //   wetGain = createAutowah();
        //   currentEffectNode = createPitchShifter();
        //   wetGain = tempWetGain;
        //   break;
        // case 18: // Distorted Wah Chorus
        //   var tempWetGain = wetGain;
        //   wetGain = createStereoChorus();
        //   wetGain = createDistortion();
        //   currentEffectNode = createAutowah();
        //   wetGain = tempWetGain;
        //   // waveshaper.setDrive(20);
        //   break;
        // case 19: // Vibrato
        //   currentEffectNode = createVibrato();
        //   break;
        // case 20: // BitCrusher
        //   currentEffectNode = createBitCrusher();
        //   break;
        // case 21: // Apollo effect
        //   currentEffectNode = createApolloEffect();
        //   break;
      default:
        break;
    }
    audioInput.connect(currentEffectNode);
  }

  function createDelay() {
    var delayNode = audioContext.createDelay();

    delayNode.delayTime.value = parseFloat(document.getElementById("dtime").value);
    dtime = delayNode;

    var gainNode = audioContext.createGain();
    gainNode.gain.value = parseFloat(document.getElementById("dregen").value);
    dregen = gainNode;

    gainNode.connect(delayNode);
    delayNode.connect(gainNode);
    delayNode.connect(wetGain);
    console.log("dtime.delayTime.value: ", dtime.delayTime.value);
    return delayNode;
  }

  function createReverb() {
    console.log("reverb selected: ");
    var convolver = audioContext.createConvolver();
    convolver.buffer = reverbBuffer; // impulseResponse( 2.5, 2.0 );  // reverbBuffer;
    convolver.connect(wetGain);
    return convolver;
  }

});
