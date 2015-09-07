'use strict';

angular.module('wvr.space').factory('Space', ['$resource',
  function($resource) {
    var spaceService = $resource('/api/wvr/space/spaces/:spaceId', {}, {
      query: {method:'GET', params:{spaceId: null}, isArray:true},
      'update': { method:'PUT' }
    });

    return spaceService;
  }
]);