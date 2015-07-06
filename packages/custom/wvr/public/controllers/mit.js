'use strict';

/* jshint -W098 */
angular.module('wvr.mit')
    .controller('MitListController', ['$scope', 'Global',
      function($scope, Global) {
        $scope.global = Global;
        $scope.mits = {};

          $scope.objToArray = function(obj) {
              var result = [];
              for(var key in obj) {
                  if(obj.hasOwnProperty(key)) {
                      result.push(obj[key]);
                  }
              }
              return result;
          }
      }]);

