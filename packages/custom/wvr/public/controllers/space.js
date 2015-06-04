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

          $scope.operationInfo = 'Processing...[Own the Space]';
          $scope.alertStyle = 'alert-info';

          if(!spaceToOwn.owner) {
            var loginUser = Global.user;
            if(loginUser && loginUser._id) {
              Space.get({spaceId: spaceToOwn.uuid}).$promise.then(
                  function(space) {
                    if(space && (!space.uuid || space.uuid === "")) {//Space not found, so to create then own
                      spaceToOwn.owner = loginUser._id;
                      Space.save(spaceToOwn, function(result) {
                        if(result && result.space) {
                          $scope.space = result.space;
                          //alert('Congratulations! ' + result.message + ' You are the space owner now! :)');
                          $scope.operationInfo = 'Congratulations! ' + result.message + ' You are the space owner now! :)';
                          $scope.alertStyle = 'alert-success';
                        } else {
                          $scope.operationInfo = 'Failed to own the space! Reason: ' + result.message;
                          $scope.alertStyle = 'alert-danger';
                        }
                      }, function(error) {
                        //alert('Failed to own the space! Reason: ' + error);
                        $scope.operationInfo = 'Failed to own the space! Reason: ' + error;
                        $scope.alertStyle = 'alert-danger';
                      });
                    } else {//Space found, so to update the owner
                      space.owner = loginUser._id;
                      space.$update({spaceId: space.uuid}, function(result) {
                        if(result && result.space) {
                          $scope.space = result.space;
                          //alert('Congratulations! ' + result.message + ' You are the space owner now! :)');
                          $scope.operationInfo = 'Congratulations! ' + result.message + ' You are the space owner now! :)';
                          $scope.alertStyle = 'alert-success';
                        } else {
                          $scope.operationInfo = 'Failed to own the space! Reason: ' + result.message;
                          $scope.alertStyle = 'alert-danger';
                        }
                      }, function(error) {
                        //alert('Failed to own the space! Reason: ' + error);
                        $scope.operationInfo = 'Failed to own the space! Reason: ' + error;
                        $scope.alertStyle = 'alert-danger';
                      });
                    }
                  },
                  function(reason) {
                    //console.log(reason);

                    //alert('Oops, space service is in trouble right now! You may try again later.');
                    $scope.operationInfo = 'Oops, space service is in trouble right now! You may try again later.';
                    $scope.alertStyle = 'alert-warning';
                  }
              );
            } else {
              alert('You would be redirected to login. Please come back to own after. :)');
              $location.path('/auth/login');
              $location.replace();
            }
          } else {
            //alert('Sorry! The space has been owned.');
            $scope.operationInfo = 'Sorry! The space has been owned.';
            $scope.alertStyle = 'alert-warning';
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
