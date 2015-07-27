'use strict';

// Override system home page with wvr home page.
angular.module('mean.wvr')
.config([
         '$viewPathProvider',
         '$stateProvider',
         function($viewPathProvider, $stateProvider) {
	         $viewPathProvider.override('system/views/index.html', 'wvr/views/index.html');

			 $viewPathProvider.override('users/views/index.html', 'wvr/views/users/index.html');
			 $viewPathProvider.override('users/views/login.html', 'wvr/views/users/login.html');
			 $viewPathProvider.override('users/views/register.html', 'wvr/views/users/register.html');
			 $viewPathProvider.override('users/views/forgot-password.html', 'wvr/views/users/forgot-password.html');
			 $viewPathProvider.override('users/views/reset-password.html', 'wvr/views/users/reset-password.html');

	         $stateProvider
	         .state('wvrhome', {
	           url: '/',
	           templateUrl: 'wvr/views/index.html'
	         });
	       
	     }]);/**/