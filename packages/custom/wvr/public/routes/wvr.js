'use strict';

angular.module('mean.wvr').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('wvr example page', {
      url: '/wvr/example',
      templateUrl: 'wvr/views/index.html'
    });
  }
]);

// Override system home page with wvr home page.
/*angular.module('mean.wvr', ['mean.system'])
.config(['$viewPathProvider', function($viewPathProvider) {
  $viewPathProvider.override('system/views/index.html', 'wvr/views/index.html');
}]);*/

/*angular.module('mean.wvr', ['mean.system'])
.config(['$viewPathProvider', function($viewPathProvider) {
  $viewPathProvider.override('system/views/index.html', 'wvr/views/soon.html');
}]);*/
