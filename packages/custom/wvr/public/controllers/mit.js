'use strict';

/* jshint -W098 */
angular.module('wvr.mit')
    .controller('MitListController', ['$scope', 'Global',
      function($scope, Global) {
        $scope.global = Global;
        //$scope.mits = [];
        $scope.mits = {};
      }]);

