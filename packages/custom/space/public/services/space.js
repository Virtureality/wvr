'use strict';

//angular.module('space.service', ['ngResource']).factory('Space', ['$resource',
angular.module('mean.space').factory('Space', ['$resource',
  function($resource) {
    return $resource('space/assets/json/space.json', {}, {
    	query: {method:'GET', params:{}, isArray:true}
    });
  }
]);
