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
  Wvr.angularDependencies(['bgf.paginateAnything', 'wvr.space', 'wvr.mit']);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Wvr.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Wvr.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Wvr.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  // Override default layouts
  app.set('views', __dirname + '/server/views');

  return Wvr;
});
