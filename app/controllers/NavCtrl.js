'use strict';
app.controller('NavCtrl', function($scope) {
  $scope.navItems = [
    { name: "Live Input", url: '#/liveInput' },
    { name: "MIDI", url: '#/midi' },
    { name: "Sequencer", url: '#/sequencer' },
    { name: "Computer Keyboard", url: '#/computerKeyboard' }
  ];

  $scope.signOut = [
    { name: "Log Out", url: '#/login' }
  ];
});

