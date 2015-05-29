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
        Space.get({spaceId: $stateParams.spaceId}).$promise.then(
            function(space) {
              // Success!
              if(space && (!space.uuid || space.uuid === "")) {
                space = {"uuid": $stateParams.spaceId, "name": $stateParams.spaceId};
              }
              $scope.space = space;
            },
            function(reason) {
              // Error!
              console.log(reason);

              var uuid = uniqueToken();
              $scope.space = {"uuid": uuid, "name": uuid};
            }
        );
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

function uniqueToken() {
  var s4 = function() {
    return Math.floor(Math.random() * 0x10000).toString(16);
  };
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}