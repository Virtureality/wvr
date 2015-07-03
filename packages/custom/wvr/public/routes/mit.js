'use strict';

angular.module('wvr.mit')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
            .state('mithome', {
              url: '/mit',
              templateUrl: 'wvr/views/mit/index.html'
            })
            .state('mit', {
              url: '/mit/:mname',
              templateUrl: 'wvr/views/mit/mit.html'
            });
      }
    ]);

/*
angular.module('wvr.mit')
    .config([
        '$meanStateProvider',
        function($meanStateProvider) {
            $meanStateProvider
                .state('mits', {
                    url: '/mits',
                    templateUrl: 'wvr/views/mit/index.html'
                });

            $meanStateProvider
                .state('mits.mit', {
                    url: '/:mname',
                    templateUrl: 'wvr/views/mit/mit.html'
                });
        }
    ])
    .config(['$locationProvider',
        function($locationProvider) {
            $locationProvider.html5Mode({
                enabled:true,
                requireBase:false
            });
        }
    ]);
*/
