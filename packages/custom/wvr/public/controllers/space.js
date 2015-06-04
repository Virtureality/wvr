'use strict';

/* jshint -W098 */
angular.module('wvr.space')
    .controller('SpaceListController', ['$scope', 'Global', 'Space',
      function($scope, Global, Space) {
        $scope.global = Global;
        $scope.spaces = Space.query();
      }])
    .controller('SpaceDetailController', ['$location', '$scope', 'Global', '$stateParams', 'Space',
      function($location, $scope, Global, $stateParams, Space){
        Space.get({spaceId: $stateParams.spaceId}).$promise.then(
            function(space) {
              // Success!
              if(space && (!space.uuid || space.uuid === "")) {
                space = {"uuid": $stateParams.spaceId, "name": $stateParams.spaceId};
              }
              $scope.space = space;

              $scope.ableToOpenDefaultRoom = !space.owner || space.owner == Global.user._id;
            },
            function(reason) {
              // Error!
              console.log(reason);

              /*var uuid = uniqueToken();
              $location.path('/#!/spaces/' + uuid);
              $location.replace();
              $scope.space = {"uuid": uuid, "name": uuid};*/

              $scope.spaceServiceInfo = "Warning: Space service is in trouble right now! You could continue if you just want to use it temporarily.";
            }
        );

        $scope.ownSpace = function(spaceToOwn) {

          if(!spaceToOwn.owner) {
            Space.get({spaceId: spaceToOwn.uuid}).$promise.then(
                function(space) {
                  if(space && (!space.uuid || space.uuid === "")) {
                    var loginUser = Global.user;
                    if(loginUser && loginUser._id) {
                      spaceToOwn.owner = loginUser._id;
                      Space.save(spaceToOwn, function(result) {
                        $scope.space = result.space;
                        alert(result.message);
                      }, function(error) {
                        alert('Error saving space: ' + error);
                      });
                    } else {
                      $location.path('/auth/login');
                      $location.replace();
                    }
                  }
                },
                function(reason) {
                  console.log(reason);

                  alert('Oops, space service is in trouble right now! You may try again later.');
                }
            );
          }
        };

      }]);

/*
function uniqueToken() {
  var s4 = function() {
    return Math.floor(Math.random() * 0x10000).toString(16);
  };
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}*/
