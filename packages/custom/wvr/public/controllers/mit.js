'use strict';

angular.module('mean.wvr')
    .controller('MitListController', ['$scope', '$rootScope', 'MeanUser',
      function($scope, $rootScope, MeanUser) {
          $scope.loginUser = MeanUser.user;
          $rootScope.$on('loggedin', function() {
              $scope.loginUser = MeanUser.user;
          });

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
      }])
    .controller('MitDetailController', ['$scope', '$rootScope', 'MeanUser',
        function($scope, $rootScope, MeanUser) {
            $scope.loginUser = MeanUser.user;
            $rootScope.$on('loggedin', function() {
                $scope.loginUser = MeanUser.user;
            });
    }]);