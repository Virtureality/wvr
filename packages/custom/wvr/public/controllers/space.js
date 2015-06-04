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
            var loginUser = Global.user;
            if(loginUser && loginUser._id) {
              Space.get({spaceId: spaceToOwn.uuid}).$promise.then(
                  function(space) {
                    spaceToOwn.owner = loginUser._id;
                    if(space && (!space.uuid || space.uuid === "")) {//Space not found, so to create then own
                      Space.save(spaceToOwn, function(result) {
                        $scope.space = result.space;
                        alert(result.message);
                      }, function(error) {
                        alert('Error creating space: ' + error);
                      });
                    } else {//Space found, so to update the owner
                      //Space.update(spaceToOwn, function(result) {
                      space.owner = loginUser._id;
                      //space.$update({spaceId: space._id}, function(result) {
                      space.$update({spaceId: space.uuid}, function(result) {
                        $scope.space = result.space;
                        alert(result.message);
                      }, function(error) {
                        alert('Error updating space: ' + error);
                      });
                    }
                    /*Space.save(spaceToOwn, function(result) {
                      console.log('result: ' + result);
                      for(var item in result) {
                        console.log(item + ': ' + result[item]);
                      }
                      $scope.space = result.space;
                      alert(result.message);
                    }, function(error) {
                      alert('Error saving space: ' + error);
                    });*/
                  },
                  function(reason) {
                    console.log(reason);

                    alert('Oops, space service is in trouble right now! You may try again later.');
                  }
              );
            } else {
              alert('You would be redirected to login. Please come back to own after. :)');
              $location.path('/auth/login');
              $location.replace();
            }
          } else {
            alert('Sorry! The space has been owned.');
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
