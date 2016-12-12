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

});
