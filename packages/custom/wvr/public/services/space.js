'use strict';

angular.module('mean.wvr').factory('Space', ['$http', '$resource',
  function($http, $resource) {

    var spaceService = $resource('/api/wvr/space/spaces/:spaceId', {}, {
    //var spaceService = $resource('/api/proxy/wvr/space/spaces/:spaceId', {}, {
      query: {method:'GET', params:{spaceId: null}, isArray:true},
      'update': { method:'PUT' }
    });

    return spaceService;
  }
]);