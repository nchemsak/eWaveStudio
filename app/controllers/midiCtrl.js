'use strict';

app.controller('midiCtrl', function($scope, ItemStorage, $location, AuthFactory) {

  $scope.title = "MIDI";
  // $scope.btnText = "Save new task";

  // $scope.newTask = {
  //   assignedTo: "",
  //   dependencies: "",
  //   dueDate: "",
  //   location: "",
  //   task: "",
  //   urgency: "low",
  //   isCompleted: false,
  //   uid: AuthFactory.loginUser
  // };

  // $scope.addNewItem = function() {
  //   console.log("you clicked on add new item:", $scope.newTask);
  //   ItemStorage.postNewItem($scope.newTask)
  //     .then((response) => {
  //       $location.url("/liveInput");
  //       $scope.$apply();
  //     });
  //   $scope.newTask = {};
  // };
});
