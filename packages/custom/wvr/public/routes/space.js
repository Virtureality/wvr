'use strict';

angular.module('wvr.space')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
            .state('spaces', {
              url: '/spaces',
              templateUrl: 'wvr/views/space/home.html'
            })
            .state('space', {
              url: '/spaces/:spaceId',
              templateUrl: 'wvr/views/space/space.html'
            });
      }
    ]);
