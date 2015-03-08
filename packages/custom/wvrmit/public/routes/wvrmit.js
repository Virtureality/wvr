'use strict';

/*angular.module('mean.wvrmit').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('wvrmit', {
      url: '/wvrmit',
      templateUrl: 'wvrmit/views/index.html'
    });
  }
]);*/

angular.module('mean.wvrmit')
.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
})
.config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('wvrmit', {
      url: '/wvrmit',
      templateUrl: 'wvrmit/views/index.html'
    }).state('wvrmitmit', {
      url: '/wvrmit/mit/:mname',
      templateUrl: 'wvrmit/views/mit.html'
    });
  }
]);

/*angular.module('mean.wvrmit')
.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
})
.config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
    .state('wvrmit', {
      url: '/wvrmit',
      templateUrl: 'wvrmit/views/index.html'
    }).state('wvrmit.mit', {
      url: '/mit/:mname',
      templateUrl: 'wvrmit/views/mit.html'
    });
  }
]);*/