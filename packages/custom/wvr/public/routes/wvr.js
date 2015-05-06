'use strict';

// Override system home page with wvr home page.
//angular.module('mean.wvr', ['mean.system'])
//As MEAN instruction, adding ['mean.system'] as above would cause error[error/ng/areq?p0=WvrHeaderController&p1=not%20aNaNunction,%20got%20undefined]! Why?
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
	       })
	       .state('spacehome', {
	         url: '/space',
	         templateUrl: 'wvr/views/space/home.html'
	       })
	       .state('space', {
	         url: '/space/:spaceId',
	         templateUrl: 'wvr/views/space/space.html'
	       });
	       
	     }]);/**/