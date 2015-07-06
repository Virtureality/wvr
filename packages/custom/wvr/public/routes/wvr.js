'use strict';

// Override system home page with wvr home page.
angular.module('mean.wvr')
.config([
         '$viewPathProvider',
         '$stateProvider',
         function($viewPathProvider, $stateProvider) {
	       $viewPathProvider.override('system/views/index.html', 'wvr/views/index.html');

	       $stateProvider
	       .state('wvrhome', {
	         url: '/',
	         templateUrl: 'wvr/views/index.html'
	       });
	       
	     }]);/**/