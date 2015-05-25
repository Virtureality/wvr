'use strict';

/*angular.module('wvr.space', [])
    .factory('Space', ['$resource', function($resource) {
      return $resource('/wvr/api/space/spaces/:spaceId', {}, {
        query: {method:'GET', params:{spaceId: null}, isArray:true}
      });
    }])
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
            .state('spaces', {
              url: '/spaces',
              templateUrl: 'wvr/views/space/home.html'
            })
            .state('space', {
              url: '/spaces/:spaceId',
              templateUrl: 'wvr/views/space/space.html'
            });
      }
    ])
    .controller('SpaceListController', ['$scope', 'Global', 'Space',
      function($scope, Global, Space) {
        $scope.global = Global;
        $scope.package = {
          name: 'space'
        };
        $scope.spaces = Space.query();
      }])
    .controller('SpaceDetailController', ['$scope', '$stateParams', 'Space',
      function($scope, $stateParams, Space){
        $scope.space = Space.get({spaceId: $stateParams.spaceId});
      }]);*/
angular.module('wvr.space', []);
