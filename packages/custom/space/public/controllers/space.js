'use strict';

/* jshint -W098 */
angular.module('mean.space').controller('SpaceController', ['$scope', 'Global', 'Space',
  function($scope, Global, Space) {
    $scope.global = Global;
    $scope.package = {
      name: 'space'
    };
    $scope.spaces = Space.query();
  }
]);
