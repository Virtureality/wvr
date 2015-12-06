'use strict';

angular.module('wvr.space').factory('Space', ['$http', '$resource',
  function($http, $resource) {

    var spaceService = $resource('/api/proxy/wvr/space/spaces/:spaceId', {}, {
      query: {method:'GET', params:{spaceId: null}, isArray:true},
      'update': { method:'PUT' }
    });

    return spaceService;
  }
]);