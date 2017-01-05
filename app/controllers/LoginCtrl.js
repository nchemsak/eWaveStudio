"use strict";

app.controller("LoginCtrl", function($scope, AuthFactory, $window) {
  AuthFactory.logoutUser();
  $scope.account = {
    email: "",
    password: ""
  };

  $scope.register = () => {
    AuthFactory.createUser($scope.account)
      .then((userData) => {
        $scope.login();
      });
  };

  $scope.login = () => {
    AuthFactory.loginUser($scope.account)
      .then((user) => {
        $window.location.href = "#/liveInput";
      });
  };

  /********************************************
            theremin code
  **********************************************/
  var SynthPad = (function() {
    // Variables
    var myCanvas;
    var frequencyLabel;
    var volumeLabel;
    var myAudioContext;
    var oscillator;
    var gainNode;

    // Notes
    var lowNote = 5;
    var highNote = 60;

    // Constructor
    var SynthPad = function() {
      myCanvas = document.getElementById('thereminCanvas');

      // Create an audio context.
      myAudioContext = new AudioContext();

      SynthPad.setupEventListeners();
    };

    // Event Listeners
    SynthPad.setupEventListeners = function() {

      // Disables scrolling on touch devices.
      document.body.addEventListener('touchmove', function(event) {
        event.preventDefault();
      }, false);

      myCanvas.addEventListener('mousedown', SynthPad.playSound);
      myCanvas.addEventListener('touchstart', SynthPad.playSound);
      myCanvas.addEventListener('mouseup', SynthPad.stopSound);
      document.addEventListener('mouseleave', SynthPad.stopSound);
      myCanvas.addEventListener('touchend', SynthPad.stopSound);
    };

    // Play a note.
    SynthPad.playSound = function(event) {
      oscillator = myAudioContext.createOscillator();
      gainNode = myAudioContext.createGain();
      oscillator.type = 'square';
      gainNode.connect(myAudioContext.destination);
      oscillator.connect(gainNode);
      SynthPad.updateFrequency(event);
      oscillator.start(0);
      myCanvas.addEventListener('mousemove', SynthPad.updateFrequency);
      myCanvas.addEventListener('touchmove', SynthPad.updateFrequency);
      myCanvas.addEventListener('mouseout', SynthPad.stopSound);
    };

    // Stop the audio.
    SynthPad.stopSound = function(event) {
      oscillator.stop(0);
      myCanvas.removeEventListener('mousemove', SynthPad.updateFrequency);
      myCanvas.removeEventListener('touchmove', SynthPad.updateFrequency);
      myCanvas.removeEventListener('mouseout', SynthPad.stopSound);
    };

    // Calculate the note frequency.
    SynthPad.calculateNote = function(posX) {
      var noteDifference = highNote - lowNote;
      var noteOffset = (noteDifference / myCanvas.offsetWidth) * (posX - myCanvas.offsetLeft);
      return lowNote + noteOffset;
    };

    // Calculate the volume.
    SynthPad.calculateVolume = function(posY) {
      var volumeLevel = 1 - (((100 / myCanvas.offsetHeight) * (posY - myCanvas.offsetTop)) / 100);
      return volumeLevel;
    };

    // Get the new frequency and volume.
    SynthPad.calculateFrequency = function(x, y) {
      var noteValue = SynthPad.calculateNote(x);
      // console.log("noteValue: ", noteValue);
      var volumeValue = SynthPad.calculateVolume(y);

      oscillator.frequency.value = noteValue;
      gainNode.gain.value = volumeValue;
    };

    // Update the note frequency.
    SynthPad.updateFrequency = function(event) {
      if (event.type == 'mousedown' || event.type == 'mousemove') {
        SynthPad.calculateFrequency(event.x, event.y);
      } else if (event.type == 'touchstart' || event.type == 'touchmove') {
        var touch = event.touches[0];
        SynthPad.calculateFrequency(touch.pageX, touch.pageY);
      }
    };
    // Export SynthPad.
    return SynthPad;

  })();
  var synthPad = new SynthPad();
});
