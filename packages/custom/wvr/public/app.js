'use strict';

var spaceApp = angular.module('wvr.space', ['ngDragDrop', 'pageslide-directive']);

spaceApp.run(['$http', function($http){
    $http.defaults.headers.common.fabala = 'U2FsdGVkX18JP//uQdpiPtgZhamanCbwmNLvFuvpDM7yXEi7HtTyZRGSZadLCyukzuTJppCkjjEV1QXqplPiAA==';
}]);

var mitApp = angular.module('wvr.mit', []);