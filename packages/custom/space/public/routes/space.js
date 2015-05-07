'use strict';

angular.module('mean.space').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
    .state('spacehome', {
        url: '/space',
        templateUrl: 'space/views/home.html'
      })
      .state('space', {
        url: '/space/:spaceId',
        templateUrl: 'space/views/space.html'
      });
  }
]);
