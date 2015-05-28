'use strict';

/* jshint -W098 */
angular.module('wvr.space')
    .controller('SpaceListController', ['$scope', 'Global', 'Space',
      function($scope, Global, Space) {
        $scope.global = Global;
        $scope.package = {
          name: 'space'
        };
        $scope.spaces = Space.query();
      }])
    .controller('SpaceDetailController', ['$scope', '$stateParams', 'Space',
      function($scope, $stateParams, Space){
        $scope.space = Space.get({spaceId: $stateParams.spaceId});
        $scope.designerResources = {
          "facilities": [
              {
                "name": "Facility - Office",
                "type": "Facility-Office"
              }
          ],
          "spaces": [
            {
              "name": "Space - Generic",
              "type": "Space-Generic"
            }
          ]
        };
        $scope.trash = [];
      }]);
