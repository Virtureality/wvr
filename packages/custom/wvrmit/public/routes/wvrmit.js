'use strict';

angular.module('mean.wvrmit').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('wvrmit example page', {
      url: '/wvrmit/example',
      templateUrl: 'wvrmit/views/index.html'
    });
  }
]);
