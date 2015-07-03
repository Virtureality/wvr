'use strict';

//angular.module('space.service', ['ngResource']).factory('Space', ['$resource',
angular.module('wvr.space').factory('Space', ['$resource',
  function($resource) {
    return $resource('/api/wvr/space/spaces/:spaceId', {}, {
      query: {method:'GET', params:{spaceId: null}, isArray:true},
      'update': { method:'PUT' }
    });
  }
]);
