'use strict';

/* jshint -W098 */
angular.module('mean.wvr').controller('WvrController', ['$scope', 'Global', 'Wvr',
  function($scope, Global, Wvr) {
    $scope.global = Global;
    $scope.package = {
      name: 'wvr'
    };
  }
]);

angular.module('mean.wvr').controller('WvrHeaderController', ['$scope', '$rootScope', 'Menus', 'MeanUser', '$state', '$cookies', '$location',
  function($scope, $rootScope, Menus, MeanUser, $state, $cookies, $location) {

    var vm = this;

    vm.menus = {};
    vm.hdrvars = {
      authenticated: MeanUser.loggedin,
      user: MeanUser.user,
      isAdmin: MeanUser.isAdmin
    };

    // Default hard coded menu items for main menu
    var defaultMainMenu = [];

    // Query menus added by modules. Only returns menus that user is allowed to see.
    function queryMenu(name, defaultMenu) {

      Menus.query({
        name: name,
        defaultMenu: defaultMenu
      }, function(menu) {
        vm.menus[name] = menu;
      });
    }

    // Query server for menus and check permissions
    queryMenu('wvr', defaultMainMenu);
    queryMenu('account', []);


    $scope.isCollapsed = false;

    $rootScope.$on('loggedin', function() {
      queryMenu('wvr', defaultMainMenu);

      vm.hdrvars = {
        authenticated: MeanUser.loggedin,
        user: MeanUser.user,
        isAdmin: MeanUser.isAdmin
      };
    });

    vm.logout = function(){
      MeanUser.logout();
    };

    $rootScope.$on('logout', function() {
      vm.hdrvars = {
        authenticated: false,
        user: {},
        isAdmin: false
      };
      queryMenu('wvr', defaultMainMenu);
      $location.path($cookies.redirect || '/');
    });

    $scope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {

      if(absNewUrl.indexOf('/login') !== -1) {
        var pathIndex = $location.absUrl().indexOf($location.path());
        $cookies.redirect = absOldUrl.substr(pathIndex, absOldUrl.length);
      }

    });

  }
]);