'use strict';

angular.module('wvr.space')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
            .state('spaces', {
              url: '/spaces',
              templateUrl: 'wvr/views/space/home.html',
              resolve: {
                  isAdmin: function(MeanUser) {
                      return MeanUser.checkAdmin();
                  }
              }
            }).state('spaces1', {
                url: '/spaces/',
                templateUrl: 'wvr/views/space/home.html',
                resolve: {
                    isAdmin: function(MeanUser) {
                        return MeanUser.checkAdmin();
                    }
                }
            })
            .state('space', {
              url: '/spaces/:spaceId',
              templateUrl: 'wvr/views/space/space.html'
            });
      }
    ]);
