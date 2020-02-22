'use strict';

/* jshint -W098 */
angular.module('mean.wvr')
.controller('WvrController', ['$scope', 'Global', 'Wvr',
  function($scope, Global, Wvr) {
    $scope.global = Global;
    $scope.package = {
      name: 'wvr'
    };
  }
]);

angular.module('mean.wvr')
.controller('WvrHeaderController', ['$scope', '$rootScope', 'Menus', 'MeanUser', '$state', '$cookies', '$location', '$translate',
  function($scope, $rootScope, Menus, MeanUser, $state, $cookies, $location, $translate) {

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
      //$location.path($cookies.redirect || '/');
      window.location.reload(true);
    });

    $rootScope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {

      if(absNewUrl.indexOf('/login') !== -1 || absNewUrl.indexOf('/register') !== -1) {
        var pathIndex = $location.absUrl().indexOf($location.path());
        $cookies.redirect = absOldUrl.substr(pathIndex, absOldUrl.length) || '/';
      }

      if(absOldUrl.indexOf('/login') !== -1 || absOldUrl.indexOf('/register') !== -1 || $location.url() == '/') {
        window.location.reload(true);
      }

    });

    $scope.changeLanguage = changeLang;

    function changeLang(langKey) {

      $translate.use(langKey);

      if(langKey && (langKey === 'zh' || langKey === 'zh-CN')) {
        $('#zhSelector').attr('class', 'btn btn-warning');
        $('#enSelector').attr('class', 'btn');
        $rootScope.ourQuestions = 'https://edening.oss-cn-shenzhen.aliyuncs.com/img/guides/Edening_Team_Questions.png';
        $rootScope.ourCoreValues = 'https://edening.oss-cn-shenzhen.aliyuncs.com/img/guides/Edening_Guide_Values.png';
      } else if(langKey && langKey === 'en') {
        $('#enSelector').attr('class', 'btn btn-warning');
        $('#zhSelector').attr('class', 'btn');
        $rootScope.ourQuestions = null;
        $rootScope.ourCoreValues = 'https://edening.oss-cn-shenzhen.aliyuncs.com/img/guides/Edening_Guide_Values_en.png';
      }
    };

    var preferredLanguage = getPreferredLanguage();

    if(preferredLanguage === 'zh' || preferredLanguage === 'zh-CN' || preferredLanguage === 'en') {
      changeLang(preferredLanguage);
    }

    function getPreferredLanguage() {
      var resultLanguage = navigator.languages[0] || navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;

      return resultLanguage;
    }

  }
]);