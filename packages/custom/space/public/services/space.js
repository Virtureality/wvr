'use strict';

//angular.module('space.service', ['ngResource']).factory('Space', ['$resource',
angular.module('mean.space').factory('Space', ['$resource',
  function($resource) {
    /*return $resource('space/assets/json/:spaceId.json', {}, {
    	query: {method:'GET', params:{spaceId: 'space'}, isArray:true}
    });*/
    return $resource('space/spaces/:spaceId', {}, {
      query: {method:'GET', params:{spaceId: null}, isArray:true}
    });
  }
]);
