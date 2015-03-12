'use strict';

angular.module('mean.wvr').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
    .state('wvrhome', {
      url: '/',
      templateUrl: 'wvr/views/index.html'
    })
    .state('wvr', {
      url: '/wvr',
      templateUrl: 'wvr/views/index.html'
    });
  }
]);

// Override system home page with wvr home page.
/*angular.module('mean.wvr', ['mean.system'])
.config(['$viewPathProvider', function($viewPathProvider) {
  $viewPathProvider.override('system/views/index.html', 'wvr/views/index.html');
}]);*/