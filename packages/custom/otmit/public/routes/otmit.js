'use strict';
/*
angular.module('mean.otmit').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('otmit example page', {
      url: '/otmit/example',
      templateUrl: 'otmit/views/index.html'
    });
  }
]);
*/

angular.module('mean.otmit')
.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
})
.config([
	'$stateProvider',
	'$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
      .state('ot mit home', {
        url: '/otmit/home',
        templateUrl: 'otmit/views/index.html'
      })
      .state('ot mit', {
        url: '/otmit/mit/{mname}',
        templateUrl: 'otmit/views/mit.html'
      });

      //$urlRouterProvider.otherwise('otmithome');
    }
]);