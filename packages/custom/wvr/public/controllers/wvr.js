'use strict';

/* jshint -W098 */
angular.module('mean.wvr').controller('WvrController', ['$scope', 'Global', 'Wvr',
  function($scope, Global, Wvr) {
    $scope.global = Global;
    $scope.package = {
      name: 'wvr'
    };
  }
]);
