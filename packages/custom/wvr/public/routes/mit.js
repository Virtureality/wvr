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
