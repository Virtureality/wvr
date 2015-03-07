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
Wvr.register(function(system, app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Wvr.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Wvr.menus.add({
    title: 'wvr example page',
    link: 'wvr example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  //Wvr.aggregateAsset('css', 'wvr.css');
  //Wvr.aggregateAsset('css', 'soon.css');

  /*Wvr.aggregateAsset('js', 'plugins.js');
  Wvr.aggregateAsset('js', 'jquery.themepunch.revolution.min.js');
  Wvr.aggregateAsset('js', 'custom.js');*/

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