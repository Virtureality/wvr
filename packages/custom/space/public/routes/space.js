'use strict';

angular.module('mean.space').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
    .state('spacehome', {
        url: '/space',
        templateUrl: 'wvr/views/space/home.html'
      })
      .state('space', {
        url: '/space/:spaceId',
        templateUrl: 'wvr/views/space/space.html'
      });
  }
]);
