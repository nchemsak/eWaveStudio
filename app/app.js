"use strict";

var app = angular.module("eWaveApp", ["ngRoute"]);

let isAuth = (AuthFactory) => new Promise((resolve, reject) => {
  AuthFactory.isAuthenticated()
    .then((userExistsTrue) => {
      if (userExistsTrue) {
        resolve();
      } else {
        reject();
      }
    });
});


//If you want authentication in order to view the app, uncomment the "resolve isAuth" sections below.
app.config(function($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    })
    .when('/liveInput', {
      templateUrl: 'partials/liveInput.html',
      controller: 'liveInputCtrl'
      // resolve: { isAuth }
    })
    .when('/midi', {
      templateUrl: 'partials/midi.html',
      controller: 'midiCtrl'
      // resolve: { isAuth }
    })
    .when('/sequencer', {
      templateUrl: 'partials/sequencer.html',
      controller: 'sequencerCtrl'
      // resolve: { isAuth }
    })
    .when('/computerKeyboard', {
      templateUrl: 'partials/computerKeyboard.html',
      controller: 'computerKeyboardCtrl'
      // resolve: { isAuth }
    })
    .otherwise('/login');
});

app.run(($location, FBCreds) => {
  let creds = FBCreds;
  let authConfig = {
    apiKey: creds.apiKey,
    authDomain: creds.authDomain
  };
  firebase.initializeApp(authConfig);
});
