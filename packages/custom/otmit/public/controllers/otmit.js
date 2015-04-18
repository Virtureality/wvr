'use strict';

/* jshint -W098 */
angular.module('mean.otmit').controller('OtmitController', ['$scope', 'Global', 'Otmit',
  function($scope, Global, Otmit) {
    $scope.global = Global;
    $scope.package = {
      name: 'otmit'
    };
  }
]);
