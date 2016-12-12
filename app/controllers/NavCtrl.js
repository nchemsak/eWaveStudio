'use strict';
app.controller('NavCtrl', function($scope) {
  $scope.navItems = [
    { name: "Live Input", url: '#/liveInput' },
    { name: "MIDI", url: '#/midi' },
    { name: "Sequencer", url: '#/sequencer' }
  ];

  $scope.signOut = [
    { name: "Log Out", url: '#/login' }
  ];
});


let you = Universe => {};

function Universe(You) {}

function Ocean(wave) {

}
