'use strict';

/* jshint -W098 */
angular.module('wvr.space')
    .controller('SpaceListController', ['$scope', 'Space',
      function($scope, Space) {
        $scope.spaces = Space.query();
      }])
    .controller('SpaceDetailController', ['$location', '$scope', '$rootScope', 'MeanUser', '$stateParams', 'Space', '$http',
      function($location, $scope, $rootScope, MeanUser, $stateParams, Space, $http){
        $scope.loginUser = MeanUser.user;
        $rootScope.$on('loggedin', function() {
          $scope.loginUser = MeanUser.user;
        });

        $scope.userSearchDisplay = false;
        $scope.showUserSearch = function(facility) {
          $scope.facilityToAssign = facility;
          $scope.userSearchDisplay = true;
        };
        $scope.hideUserSearch = function() {
          $scope.userSearchDisplay = false;
        };
        $scope.searchUser = function() {
          $scope.operationInfo = 'Searching for users ...';
          $http.post('/api/wvr/user/users', { "keywords" : $scope.keywords}).
              success(function(data, status) {
                $scope.userSearchStatus = status;
                $scope.userSearchData = data;
                $scope.resultUserList = data;
              }).
              error(function(data, status) {
                $scope.userSearchData = data || "Request failed";
                $scope.userSearchStatus = status;
              });
        };

        Space.get({spaceId: $stateParams.spaceId}).$promise.then(
            function(space) {
              // Success!
              if(space && (!space.uuid || space.uuid === "")) {
                space = {"uuid": $stateParams.spaceId, "name": $stateParams.spaceId};
              }
              $scope.space = space;

              $scope.ableToOpenDefaultRoom = !space.owner || space.owner._id == $scope.loginUser._id;

              $scope.ownSpace = function(spaceToOwn) {

                $scope.operationInfo = 'Processing...[Own the Space]';
                $scope.alertStyle = 'alert-info';

                if(!spaceToOwn.owner) {
                  var loginUser = $scope.loginUser;
                  if(loginUser && loginUser._id) {
                    Space.get({spaceId: spaceToOwn.uuid}).$promise.then(
                        function(space) {
                          if(space && (!space.uuid || space.uuid === "")) {//Space not found, so to create then own
                            spaceToOwn.owner = loginUser._id;
                            Space.save(spaceToOwn, function(result) {
                              if(result && result.space) {
                                $scope.space = result.space;
                                $scope.operationInfo = 'Congratulations! ' + result.message + ' You are the space owner now! :)';
                                $scope.alertStyle = 'alert-success';
                              } else {
                                $scope.operationInfo = 'Failed to own the space! Reason: ' + result.message;
                                $scope.alertStyle = 'alert-danger';
                              }
                            }, function(error) {
                              $scope.operationInfo = 'Failed to own the space! Reason: ' + error;
                              $scope.alertStyle = 'alert-danger';
                            });
                          } else {//Space found, so to update the owner
                            space.owner = loginUser._id;
                            space.$update({spaceId: space.uuid}, function(result) {
                              if(result && result.space) {
                                $scope.space = result.space;
                                $scope.operationInfo = 'Congratulations! ' + result.message + ' You are the space owner now! :)';
                                $scope.alertStyle = 'alert-success';
                              } else {
                                $scope.operationInfo = 'Failed to own the space! Reason: ' + result.message;
                                $scope.alertStyle = 'alert-danger';
                              }
                            }, function(error) {
                              $scope.operationInfo = 'Failed to own the space! Reason: ' + error;
                              $scope.alertStyle = 'alert-danger';
                            });
                          }
                        },
                        function(reason) {
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
                  $scope.operationInfo = 'Sorry! The space has been owned.';
                  $scope.alertStyle = 'alert-warning';
                }
              };

              $scope.showSpace = function() {
                $scope.space.visible = true;
              };

              $scope.hideSpace = function() {
                $scope.space.visible = false;
              };

              var isSpaceOwner = space.owner && space.owner._id == $scope.loginUser._id;
              $scope.isSpaceOwner = isSpaceOwner;

              if(isSpaceOwner) {

                $scope.assignOwner = function(spaceForFacility, facilityToAssign, resultUser) {
                  $scope.operationInfo = 'Assigning seat owner ...';
                  $scope.alertStyle = 'alert-info';

                  if(!resultUser) {
                    $scope.operationInfo = 'You must choose a user for assigning to!';
                    $scope.alertStyle = 'alert-warning';
                  } else {
                    Space.get({spaceId: spaceForFacility.uuid}).$promise.then(
                        function(space) {
                          if(space && (!space.uuid || space.uuid === "")) {//Space not found
                            $scope.operationInfo = 'Failed to assign the facility! Reason: ' + result.message;
                            $scope.alertStyle = 'alert-danger';
                          } else {//Space found, so to update the facility owner
                            var facilities = space.facilities;
                            var curFacility, targetFacility;
                            for(var i = 0; i< facilities.length; i++) {
                              curFacility = facilities[i];
                              if(curFacility._id == facilityToAssign._id) {
                                targetFacility = curFacility;
                              }
                            }
                            if(targetFacility && resultUser._id) {
                              targetFacility.owner = resultUser._id;
                              space.$update({spaceId: space.uuid}, function(result) {
                                if(result && result.space) {
                                  $scope.userSearchDisplay = false;
                                  $('#seat-owner-' + targetFacility._id).text(resultUser.name || resultUser.email || resultUser._id);
                                  $scope.operationInfo = 'Congratulations! ' + result.message + ' Facility assigned as you wish! :)';
                                  $scope.alertStyle = 'alert-success';
                                } else {
                                  $scope.operationInfo = 'Failed to assign the facility! Reason: ' + result.message;
                                  $scope.alertStyle = 'alert-danger';
                                }
                              }, function(error) {
                                $scope.operationInfo = 'Failed to assign the facility! Reason: ' + error;
                                $scope.alertStyle = 'alert-danger';
                              });
                            } else {
                              $scope.operationInfo = 'Failed to assign the facility! Reason: Unknown.';
                              $scope.alertStyle = 'alert-danger';
                            }
                          }
                        },
                        function(reason) {
                          $scope.operationInfo = 'Oops, space service is in trouble right now! You may try again later.';
                          $scope.alertStyle = 'alert-warning';
                        }
                    );
                  }
                };

                var showCraftToStudio =  isSpaceOwner && space.type != 'Studio';

                $scope.showCraftToStudio = showCraftToStudio;

                if(showCraftToStudio) {
                  $scope.craftToStudio = function(spaceToCraft) {

                    Space.get({spaceId: spaceToCraft.uuid}).$promise.then(
                        function(space) {
                          space.type = 'Studio';

                          for(var i = 1; i <= 6; i++) {
                            space.facilities.push({name: 'Seat - ' + i, type: 'Physical'});
                          }

                          space.owner = $scope.loginUser._id;

                          space.$update({spaceId: space.uuid}, function(result) {
                            if(result && result.space) {
                              $scope.showCraftToStudio = false;

                              $scope.space.facilities = result.space.facilities;
                              $scope.operationInfo = 'Congratulations! ' + result.message + ' to Studio now! :)';
                              $scope.alertStyle = 'alert-success';
                            } else {
                              $scope.operationInfo = 'Failed to craft the space! Reason: ' + result.message;
                              $scope.alertStyle = 'alert-danger';
                            }
                          }, function(error) {
                            $scope.operationInfo = 'Failed to craft the space! Reason: ' + error;
                            $scope.alertStyle = 'alert-danger';
                          });
                        },
                        function(reason) {
                          $scope.operationInfo = 'Oops, space service is in trouble right now! You may try again later.';
                          $scope.alertStyle = 'alert-warning';
                        }
                    );

                  }
                }
              }

              $scope.$emit('spaceReached');
            },
            function(reason) {
              $scope.spaceServiceInfo = "Warning: Space service is in trouble right now! You could continue if you just want to use it temporarily.";
            }
        );

    }]);

