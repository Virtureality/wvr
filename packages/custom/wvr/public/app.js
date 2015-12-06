'use strict';

var spaceApp = angular.module('wvr.space', ['ngDragDrop', 'pageslide-directive', 'mdo-angular-cryptography']);

spaceApp.run(['$http', function($http){
    $http.defaults.headers.common.fabala = 'U2FsdGVkX18JP//uQdpiPtgZhamanCbwmNLvFuvpDM7yXEi7HtTyZRGSZadLCyukzuTJppCkjjEV1QXqplPiAA==';
}]);

var mitApp = angular.module('wvr.mit', []);