'use strict';

/* jshint -W098 */
angular.module('mean.wvrmit').controller('WvrmitController', ['$scope', 'Global', 'Wvrmit',
  function($scope, Global, Wvrmit) {
    $scope.global = Global;
    $scope.package = {
      name: 'wvrmit'
    };
  }
]);
