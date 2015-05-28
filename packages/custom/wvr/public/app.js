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
//angular.module('wvr.space', ['ngDragDrop']);

var spaceApp = angular.module('wvr.space', ['ngDragDrop']);

spaceApp.controller('oneCtrl', function($scope, $timeout) {
    $scope.list1 = [];
    $scope.list2 = [];
    $scope.list3 = [
        { 'title': 'Item 1', 'drag': true },
        { 'title': 'Item 2', 'drag': true },
        { 'title': 'Item 3', 'drag': true }
    ];
    $scope.list4 = [];

    $scope.list5 = [
        { 'title': 'Item 1', 'drag': true },
        { 'title': 'Item 2', 'drag': true },
        { 'title': 'Item 3', 'drag': true },
        { 'title': 'Item 4', 'drag': true },
        { 'title': 'Item 5', 'drag': true },
        { 'title': 'Item 6', 'drag': true }
    ];

    // Limit items to be dropped in list1
    $scope.optionsList1 = {
        accept: function(dragEl) {
            if ($scope.list1.length >= 3) {
                return false;
            } else {
                return true;
            }
        }
    };
});
