'use strict';

angular.module('mean.wvrmit').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('wvrmit', {
      url: '/wvrmit',
      templateUrl: 'wvrmit/views/index.html'
    });
  }
]);
