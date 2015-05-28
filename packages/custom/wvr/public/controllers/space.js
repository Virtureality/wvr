'use strict';

/* jshint -W098 */
angular.module('wvr.space')
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
        $scope.designerResources = [
          { 'title': 'Design Resource 1', 'drag': true },
          { 'title': 'Design Resource  2', 'drag': true },
          { 'title': 'Design Resource  3', 'drag': true }
        ];
        $scope.designResult = [];
      }]);
