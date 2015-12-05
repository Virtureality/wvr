'use strict';

angular.module('wvr.space').factory('Space', ['$http', '$resource', '$crypto',
  function($http, $resource, $crypto) {

    //$httpProvider.defaults.headers.common.Authorization = 'Bearer fbl_api_54fbf04ed87c38e661e06a00';
    $http.defaults.headers.common.Authorization = 'Bearer ' + $crypto.encrypt('fbl_api_54fbf04ed87c38e661e06a00');

    var spaceService = $resource('/api/wvr/space/spaces/:spaceId', {}, {
      query: {method:'GET', params:{spaceId: null}, isArray:true},
      'update': { method:'PUT' }
    });

    return spaceService;
  }
]);