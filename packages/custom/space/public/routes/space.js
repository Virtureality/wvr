'use strict';

angular.module('mean.space')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
            .state('spacehome', {
              url: '/spaces',
              templateUrl: 'space/views/home.html'
            })
            .state('space', {
              url: '/spaces/:spaceId',
              templateUrl: 'space/views/space.html'
            });
      }
    ]);
