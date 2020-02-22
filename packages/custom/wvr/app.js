'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Wvr = new Module('wvr');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Wvr.register(function(system, app, auth, database, passport) {

  //We enable routing. By default the Package Object is passed to the routes
  Wvr.routes(app, auth, database, passport);

  Wvr.aggregateAsset('css', 'fancybox/jquery.fancybox.css');
  Wvr.aggregateAsset('css', 'style.css');
  Wvr.aggregateAsset('css', 'flexslider.css');
  Wvr.aggregateAsset('css', 'default.css');

  Wvr.aggregateAsset('css', 'wvr.css');
  Wvr.aggregateAsset('js', 'angular-pageslide-directive.min.js');
  Wvr.aggregateAsset('js', 'mit/lib/RTCMultiConnection.js');
  Wvr.angularDependencies(['bgf.paginateAnything', 'pascalprecht.translate', 'ngDragDrop', 'pageslide-directive']);

  // Override default layouts
  app.set('views', __dirname + '/server/views');

  return Wvr;
});
