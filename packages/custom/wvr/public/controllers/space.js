'use strict';

/* jshint -W098 */
angular.module('wvr.space')
    .controller('SpaceListController', ['$scope', 'Space',
      function($scope, Space) {
        $scope.url = '/api/proxy/wvr/space/spaces';
        $scope.search = function() {
          $scope.urlParams = {
            q: $scope.q
          };
        };
      }])
    .controller('SpaceDetailController', ['$window', '$location', '$scope', '$rootScope', 'MeanUser', '$stateParams', 'Space', '$http',
      function($window, $location, $scope, $rootScope, MeanUser, $stateParams, Space, $http){

        $scope.actionText = 'TXT_MARCHING';

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
          //$scope.operationInfo = 'Searching for users ...';
          $scope.operationInfo = '';

          $http.post('/api/proxy/wvr/user/users', { "keywords" : $scope.keywords}).
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
            function(resultSpace) {
              // Success!

              if(resultSpace && (!resultSpace.uuid || resultSpace.uuid === "")) {//Not Explored Yet i.e. No record in the system.
                $scope.operationInfo = 'INFO_UNKNOWN_SPACE';
                $scope.alertStyle = 'alert-danger';
              } else {
                if(resultSpace.uuid === 'trial') {
                  $scope.isTrial = true;
                }

                var facilities = resultSpace.facilities;
                var facility;
                $scope.sgFacilities = [];
                $scope.nonSGFacilities = [];

                for(var i = 0; i < facilities.length; i++) {
                  facility = facilities[i];
                  if(facility.type === 'SpaceGate') {
                    $scope.sgFacilities.push(facility);
                  } else {
                    $scope.nonSGFacilities.push(facility);
                  }
                }

                $scope.space = resultSpace;

                $scope.ableToOpenDefaultRoom = !resultSpace.owner || resultSpace.owner._id == $scope.loginUser._id;

                $scope.addLocker = function() {

                  $scope.$apply(function() {

                    var lockerKey = prompt('Input to create the key: ');

                    if(lockerKey !== null) {

                      //$scope.operationInfo = 'Processing...[Add Space Locker]';
                      $scope.operationInfo = 'INFO_PROCESSING_ADDLOCKER';
                      $scope.alertStyle = 'alert-info';

                      if(!resultSpace.locker) {
                        var loginUser = $scope.loginUser;
                        if(loginUser && loginUser._id) {
                          Space.get({spaceId: resultSpace.uuid}).$promise.then(
                              function(space) {
                                if (space && (!space.uuid || space.uuid === "")) {//Space not found
                                  //$scope.operationInfo = 'Sorry, failed to lock the space at the moment! You could try again later on.';
                                  $scope.operationInfo = 'INFO_ADDLOCKER_FAILED';
                                  $scope.alertStyle = 'alert-danger';
                                } else {//Space found, so to update the locker
                                  if(space.owner) {
                                    delete space.owner;
                                  }
                                  space.locker = lockerKey;
                                  space.$update({spaceId: space.uuid}, function(result) {
                                    if(result && result.space) {
                                      $scope.space = result.space;
                                      //$scope.operationInfo = 'Congratulations! You have added locker to the space! ';
                                      $scope.operationInfo = 'INFO_ADDLOCKER_SUCCESS';
                                      $scope.alertStyle = 'alert-success';

                                      $window.location.reload(true);
                                    } else {
                                      //$scope.operationInfo = 'Sorry, failed to lock the space at the moment! You could try again later on.';
                                      $scope.operationInfo = 'INFO_ADDLOCKER_FAILED';
                                      $scope.alertStyle = 'alert-danger';
                                    }
                                  }, function(error) {
                                    //$scope.operationInfo = 'Sorry, failed to lock the space at the moment! You could try again later on.';
                                    $scope.operationInfo = 'INFO_ADDLOCKER_FAILED';
                                    $scope.alertStyle = 'alert-danger';
                                  });
                                }
                              });
                        } else {
                          //$scope.operationInfo = 'You would be redirected to login. Please come back to finish operation then. ';
                          $scope.operationInfo = 'INFO_REDIRECTING';
                          $scope.alertStyle = 'alert-info';
                          $location.path('/auth/login');
                          $location.replace();
                        }
                      } else {
                        //$scope.operationInfo = 'The space has locker already, no need to add again!';
                        $scope.operationInfo = 'INFO_LOCKEREXIST';
                        $scope.alertStyle = 'alert-warning';
                      }
                    }
                  });

                };

                $scope.changeLocker = function() {

                  $scope.$apply(function() {

                    var lockerKey = prompt('Input new key: ');

                    if(lockerKey !== null) {

                      //$scope.operationInfo = 'Processing...[Change Space Locker]';
                      $scope.operationInfo = 'INFO_PROCESSING_CHANGELOCKER';
                      $scope.alertStyle = 'alert-info';

                      if(resultSpace.locker) {
                        var loginUser = $scope.loginUser;
                        if(loginUser && loginUser._id) {
                          Space.get({spaceId: resultSpace.uuid}).$promise.then(
                              function(space) {
                                if (space && (!space.uuid || space.uuid === "")) {//Space not found
                                  //$scope.operationInfo = 'Sorry, failed to change locker at the moment! You could try again later on.';
                                  $scope.operationInfo = 'INFO_CHANGELOCKER_FAILED';
                                  $scope.alertStyle = 'alert-danger';
                                } else {//Space found, so to change the locker
                                  if(space.owner) {
                                    delete space.owner;
                                  }
                                  space.locker = lockerKey;
                                  space.$update({spaceId: space.uuid}, function(result) {
                                    if(result && result.space) {
                                      $scope.space = result.space;
                                      //$scope.operationInfo = 'Congratulations! You have changed the locker! ';
                                      $scope.operationInfo = 'INFO_CHANGELOCKER_SUCCESS';
                                      $scope.alertStyle = 'alert-success';

                                      $window.location.reload(true);
                                    } else {
                                      //$scope.operationInfo = 'Sorry, failed to change locker at the moment! You could try again later on.';
                                      $scope.operationInfo = 'INFO_CHANGELOCKER_FAILED';
                                      $scope.alertStyle = 'alert-danger';
                                    }
                                  }, function(error) {
                                    //$scope.operationInfo = 'Sorry, failed to change locker at the moment! You could try again later on.';
                                    $scope.operationInfo = 'INFO_CHANGELOCKER_FAILED';
                                    $scope.alertStyle = 'alert-danger';
                                  });
                                }
                              });
                        } else {
                          //$scope.operationInfo = 'You would be redirected to login. Please come back to finish operation then. ';
                          $scope.operationInfo = 'INFO_REDIRECTING';
                          $scope.alertStyle = 'alert-info';
                          $location.path('/auth/login');
                          $location.replace();
                        }
                      } else {
                        //$scope.operationInfo = 'Oops, it turns out there is no locker yet!';
                        $scope.operationInfo = 'INFO_NOLOCKER';
                        $scope.alertStyle = 'alert-warning';
                      }
                    }
                  });

                };

                $scope.ownSpace = function() {

                  $scope.$apply(function() {
                    //$scope.operationInfo = 'Processing...[Own the Space]';
                    $scope.operationInfo = 'INFO_PROCESSING_OWN';
                    $scope.alertStyle = 'alert-info';

                    if(!resultSpace.owner) {
                      var loginUser = $scope.loginUser;
                      if(loginUser && loginUser._id) {
                        Space.get({spaceId: resultSpace.uuid}).$promise.then(
                            function(space) {
                              if(space && (!space.uuid || space.uuid === "")) {//Space not found, so to create then own
                                space.owner = loginUser._id;
                                Space.save(space, function(result) {
                                  if(result && result.space) {
                                    $scope.space = result.space;
                                    //scope.operationInfo = 'Congratulations! You are the space owner now!';
                                    $scope.operationInfo = 'INFO_OWNSPACE_SUCCESS';
                                    $scope.alertStyle = 'alert-success';

                                    $window.location.reload(true);
                                  } else {
                                    //$scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
                                    $scope.operationInfo = 'INFO_OWNSPACE_FAILED';
                                    $scope.alertStyle = 'alert-danger';
                                  }
                                }, function(error) {
                                  //$scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
                                  $scope.operationInfo = 'INFO_OWNSPACE_FAILED';
                                  $scope.alertStyle = 'alert-danger';
                                });
                              } else {//Space found, so to update the owner
                                space.owner = loginUser._id;
                                space.$update({spaceId: space.uuid}, function(result) {
                                  if(result && result.space) {
                                    $scope.space = result.space;
                                    //$scope.operationInfo = 'Congratulations! You are the space owner now! ';
                                    $scope.operationInfo = 'INFO_OWNSPACE_SUCCESS';
                                    $scope.alertStyle = 'alert-success';

                                    $window.location.reload(true);
                                  } else {
                                    //$scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
                                    $scope.operationInfo = 'INFO_OWNSPACE_FAILED';
                                    $scope.alertStyle = 'alert-danger';
                                  }
                                }, function(error) {
                                  //$scope.operationInfo = 'Sorry, failed to own the space at the moment! You could try again later on.';
                                  $scope.operationInfo = 'INFO_OWNSPACE_FAILED';
                                  $scope.alertStyle = 'alert-danger';
                                });
                              }
                            },
                            function(reason) {
                              //$scope.operationInfo = 'Oops, space service is in trouble right now! You may try again later.';
                              $scope.operationInfo = 'INFO_SPACESERVICE_UNAVAILABLE';
                              $scope.alertStyle = 'alert-warning';
                            }
                        );
                      } else {
                        //$scope.operationInfo = 'You need to login to own the space. Please register if not yet, then login for coming back to own after. Good luck! :)';
                        $scope.operationInfo = 'INFO_LOGINNEEDED';
                        $scope.alertStyle = 'alert-info';
                      }
                    } else {
                      //$scope.operationInfo = 'Sorry! The space has been owned.';
                      $scope.operationInfo = 'INFO_SPACEOWNEREXIST';
                      $scope.alertStyle = 'alert-warning';
                    }
                  });

                };

                $scope.showSpace = function() {
                  $scope.space.visible = true;
                };

                $scope.hideSpace = function() {
                  $scope.space.visible = false;
                };

                $scope.isSGFacility = function(facility) {
                  var result = false;

                  if(facility && facility.type === 'SpaceGate') {
                    result = true;
                  }

                  return result;
                };

                var isSpaceOwner = resultSpace.owner && resultSpace.owner._id == $scope.loginUser._id;
                $scope.isSpaceOwner = isSpaceOwner;

                if(isSpaceOwner) {

                  $scope.assignOwner = function(spaceForFacility, facilityToAssign, resultUser) {

                    //$scope.operationInfo = 'Assigning seat owner ...';
                    $scope.operationInfo = 'INFO_ASSIGNINGOWNER';
                    $scope.alertStyle = 'alert-info';

                    if(!resultUser) {
                      //$scope.operationInfo = 'You must choose a user for assigning to!';
                      $scope.operationInfo = 'INFO_CHOOSEUSER';
                      $scope.alertStyle = 'alert-warning';
                    } else {
                      Space.get({spaceId: spaceForFacility.uuid}).$promise.then(
                          function(space) {
                            if(space && (!space.uuid || space.uuid === "")) {//Space not found
                              //$scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
                              $scope.operationInfo = 'INFO_ASSIGNOWNER_FAILED';
                              $scope.alertStyle = 'alert-danger';
                            } else {//Space found, so to update the facility owner

                              if(space.locker) {
                                delete space.locker;
                              }

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
                                    //$('#seat-owner-' + targetFacility._id).text(resultUser.name || resultUser.email || resultUser._id);
                                    $('#facility-owner-' + targetFacility._id).text(resultUser.name || resultUser.email || resultUser._id);
                                    //$scope.operationInfo = 'Congratulations! Facility assigned as you wish! ';
                                    $scope.operationInfo = 'INFO_ASSIGNOWNER_SUCCESS';
                                    $scope.alertStyle = 'alert-success';

                                    //$window.location.reload(true);
                                  } else {
                                    //$scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
                                    $scope.operationInfo = 'INFO_ASSIGNOWNER_FAILED';
                                    $scope.alertStyle = 'alert-danger';
                                  }
                                }, function(error) {
                                  //$scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
                                  $scope.operationInfo = 'INFO_ASSIGNOWNER_FAILED';
                                  $scope.alertStyle = 'alert-danger';
                                });
                              } else {
                                //$scope.operationInfo = 'Sorry, failed to assign facility owner! You could try again later on.';
                                $scope.operationInfo = 'INFO_ASSIGNOWNER_FAILED';
                                $scope.alertStyle = 'alert-danger';
                              }
                            }
                          },
                          function(reason) {
                            //$scope.operationInfo = 'Oops, space service is in trouble right now! You may try again later.';
                            $scope.operationInfo = 'INFO_SPACESERVICE_UNAVAILABLE';
                            $scope.alertStyle = 'alert-warning';
                          }
                      );
                    }
                  };

                  $scope.designPanelOpen = false; // This will be binded using the ps-open attribute

                  $scope.toggleDesignPanel = function(){
                    $scope.designPanelOpen = !$scope.designPanelOpen;
                    $scope.spaceChanged = !$scope.spaceChanged;
                  };

                  /*$scope.designerResources = {
                   "facilities": [{type: "Cabinet"}, {type: "Screen"}, {type: "Seat"}],
                   "spaces": [{type: "Building"}, {type: "Room"}, {type: "Office"}, {type: "Studio"}, {type: "Workspace"}]
                   };*/
                  $scope.designerResources = {
                    "facilities": [{type: "Seat", imgURL: "/wvr/assets/img/Seat.png", extra: {}}, {type: "SpaceGate", imgURL: "/wvr/assets/img/SpaceGate.png", extra: {address: ""}}],
                    "spaces": [{type: "Studio", extra: {}}]
                  };
                  $scope.trash = [];
                  $scope.newFacilities = [];
                  $scope.newSGFacilities = [];
                  $scope.spaceChanged = false;

                  $scope.onFacilityAdded = function(event, ui) {

                    $scope.facilityDroppedTime = event.timeStamp;

                    $scope.spaceChanged = true;

                    $('#container').masonry();
                  };

                  $scope.onFacilityTrashed = function(event, ui) {
                    var dragSettings = $scope.$eval(ui.draggable.attr('jqyoui-draggable') || ui.draggable.attr('data-jqyoui-draggable')) || {};
                    var trashedItemIndex = dragSettings.index;
                    /*var curSpace = $scope.space;

                    if(curSpace && curSpace.facilities) {
                      curSpace.facilities.splice(trashedItemIndex, 1);
                    }*/
                    var dragFacilityType = ui.draggable.attr('data-facility-type');
                    var nonSGFacilities = $scope.nonSGFacilities;
                    var sgFacilities = $scope.sgFacilities;

                    if(dragFacilityType === 'SpaceGate') {
                      sgFacilities.splice(trashedItemIndex, 1);
                    } else if(dragFacilityType === 'Seat') {
                      nonSGFacilities.splice(trashedItemIndex, 1);
                    }
                  };

                  $scope.updateSpace = function() {
                    var spaceToUpdate = $scope.space;

                    if(!spaceToUpdate) {
                      return;
                    }

                    if(spaceToUpdate.locker) {
                      delete spaceToUpdate.locker;
                    }

                    var newFacilities = $scope.newFacilities;
                    var newSGFacilities = $scope.newSGFacilities;

                    spaceToUpdate.facilities = [];
                    spaceToUpdate.facilities = spaceToUpdate.facilities.concat($scope.nonSGFacilities);
                    spaceToUpdate.facilities = spaceToUpdate.facilities.concat($scope.sgFacilities);

                    for(var i = 0; i < newFacilities.length; i++) {
                      spaceToUpdate.facilities.push({name: newFacilities[i].type, type: newFacilities[i].type, extra: newFacilities[i].extra});
                    }

                    for(var i = 0; i < newSGFacilities.length; i++) {
                      spaceToUpdate.facilities.push({name: newSGFacilities[i].type, type: newSGFacilities[i].type, extra: newSGFacilities[i].extra});
                    }

                    spaceToUpdate.owner = $scope.loginUser._id;

                    spaceToUpdate.$update({spaceId: spaceToUpdate.uuid}, function(result) {
                      if(result && result.space) {
                        $scope.space.type = result.space.type;
                        $scope.space.facilities = result.space.facilities;
                        $scope.trash = [];
                        $scope.newFacilities = [];
                        $scope.spaceChanged = false;
                        //$scope.operationInfo = 'Congratulations! Space updated as you wish. ';
                        $scope.operationInfo = 'INFO_UPDATESPACE_SUCCESS';
                        $scope.alertStyle = 'alert-success';

                        $window.location.reload(true);
                      } else {
                        //$scope.operationInfo = 'Sorry, failed to update the space! You could try again later on.';
                        $scope.operationInfo = 'INFO_UPDATESPACE_FAILED';
                        $scope.alertStyle = 'alert-danger';
                      }
                    }, function(error) {
                      //$scope.operationInfo = 'Sorry, failed to update the space! You could try again later on.';
                      $scope.operationInfo = 'INFO_UPDATESPACE_FAILED';
                      $scope.alertStyle = 'alert-danger';
                    });
                  };

                }

                $scope.imers = new Set();

                $scope.$emit('spaceReached');
              }

            },
            function(reason) {
              //$scope.spaceServiceInfo = "Warning: Space service is in trouble right now! You could continue if you just want to use it temporarily.";
              $scope.operationInfo = 'INFO_SPACESERVICE_UNAVAILABLE';
            }
        );

    }]);

