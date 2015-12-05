'use strict';

var spaceApp = angular.module('wvr.space', ['ngDragDrop', 'pageslide-directive', 'mdo-angular-cryptography']);

spaceApp.config(['$cryptoProvider', function($cryptoProvider){
    $cryptoProvider.setCryptographyKey('FBLWVRCipherKey333');
}]);

var mitApp = angular.module('wvr.mit', []);