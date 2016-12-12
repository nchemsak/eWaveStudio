'use strict';

app.controller('liveInputCtrl', function($scope, ItemStorage) {

  $scope.title = "Live Input";
  ItemStorage.getItemList()
    .then((ItemArray) => {
      $scope.items = ItemArray;
      console.log("ItemArray: ", ItemArray);
      $scope.$apply();
    });

});
