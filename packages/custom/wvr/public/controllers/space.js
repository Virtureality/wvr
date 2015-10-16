'use strict';

/* jshint -W098 */
angular.module('wvr.space')
    .controller('SpaceListController', ['$scope', 'Space',
      function($scope, Space) {
        //$scope.spaces = Space.query();
        $scope.url = '/api/wvr/space/spaces';
        $scope.search = function() {
          $scope.urlParams = {
            q: $scope.q
          };
        };
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

              if(space && (!space.uuid || space.uuid === "")) {//Not Explored Yet i.e. No record in the system.
                space = {"uuid": $stateParams.spaceId, "name": $stateParams.spaceId};

                Space.save(space, function(result) {
                  if(result && result.space) {
                    space = result.space;
                    $scope.operationInfo = 'Congratulations! You just discovered a new space!';
                    $scope.alertStyle = 'alert-success';
                  } else {
                    $scope.operationInfo = 'Oops, failed to discover the space! But you could still use the temporary space.';
                    $scope.alertStyle = 'alert-danger';
                  }
                }, function(error) {
                  $scope.operationInfo = 'Oops, failed to discover the space! But you could still use the temporary space.';
                  $scope.alertStyle = 'alert-danger';
                });
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
                                $scope.operationInfo = 'Congratulations! You are the space owner now!';
                                $scope.alertStyle = 'alert-success';

                                $window.refresh();
                              } else {
                                $scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
                                $scope.alertStyle = 'alert-danger';
                              }
                            }, function(error) {
                              $scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
                              $scope.alertStyle = 'alert-danger';
                            });
                          } else {//Space found, so to update the owner
                            space.owner = loginUser._id;
                            space.$update({spaceId: space.uuid}, function(result) {
                              if(result && result.space) {
                                $scope.space = result.space;
                                $scope.operationInfo = 'Congratulations! You are the space owner now! ';
                                $scope.alertStyle = 'alert-success';

                                $window.refresh();
                              } else {
                                $scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
                                $scope.alertStyle = 'alert-danger';
                              }
                            }, function(error) {
                              $scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
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
                    //alert('You would be redirected to login. Please come back to own after. :)');
                    $scope.operationInfo = 'You would be redirected to login. Please come back to own after. ';
                    $scope.alertStyle = 'alert-info';
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
                            $scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
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
                                  $scope.operationInfo = 'Congratulations! Facility assigned as you wish! ';
                                  $scope.alertStyle = 'alert-success';
                                } else {
                                  $scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
                                  $scope.alertStyle = 'alert-danger';
                                }
                              }, function(error) {
                                $scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
                                $scope.alertStyle = 'alert-danger';
                              });
                            } else {
                              $scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
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

                $scope.designPanelOpen = false; // This will be binded using the ps-open attribute

                $scope.toggleDesignPanel = function(){
                  $scope.designPanelOpen = !$scope.designPanelOpen
                };

                /*$scope.designerResources = {
                  "facilities": [{type: "Cabinet"}, {type: "Screen"}, {type: "Seat"}],
                  "spaces": [{type: "Building"}, {type: "Room"}, {type: "Office"}, {type: "Studio"}, {type: "Workspace"}]
                };*/
                $scope.designerResources = {
                  "facilities": [{type: "Seat"}],
                  "spaces": [{type: "Studio"}]
                };
                $scope.trash = [];
                $scope.newFacilities = [];
                $scope.spaceChanged = false;

                $scope.onFacilityDropped = function(event, ui) {

                  $scope.facilityDroppedTime = event.timeStamp;

                  $scope.spaceChanged = true;

                  $('#container').masonry();
                };

                $scope.updateSpace = function() {
                  Space.get({spaceId: $scope.space.uuid}).$promise.then(
                      function(space) {
                        space.type = $scope.space.type;

                        var newFacilities = $scope.newFacilities;

                        for(var i = 0; i < newFacilities.length; i++) {
                          space.facilities.push({name: newFacilities[i].type, type: newFacilities[i].type});
                        }

                        space.owner = $scope.loginUser._id;

                        space.$update({spaceId: space.uuid}, function(result) {
                          if(result && result.space) {
                            $scope.space.type = result.space.type;
                            $scope.space.facilities = result.space.facilities;
                            $scope.trash = [];
                            $scope.newFacilities = [];
                            $scope.spaceChanged = false;
                            $scope.operationInfo = 'Congratulations! Space updated as you wish. ';
                            $scope.alertStyle = 'alert-success';
                          } else {
                            $scope.operationInfo = 'Sorry, failed to update the space! You could try again later on.';
                            $scope.alertStyle = 'alert-danger';
                          }
                        }, function(error) {
                          $scope.operationInfo = 'Sorry, failed to update the space! You could try again later on.';
                          $scope.alertStyle = 'alert-danger';
                        });
                      },
                      function(reason) {
                        $scope.operationInfo = 'Oops, space service is in trouble right now! You may try again later.';
                        $scope.alertStyle = 'alert-warning';
                      }
                  );
                };

              }

              $scope.imers = new Set();

              $scope.$emit('spaceReached');
            },
            function(reason) {
              $scope.spaceServiceInfo = "Warning: Space service is in trouble right now! You could continue if you just want to use it temporarily.";
            }
        );

    }]);

