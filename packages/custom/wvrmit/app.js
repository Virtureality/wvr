'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Wvrmit = new Module('wvrmit');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Wvrmit.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Wvrmit.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Wvrmit.menus.add({
    title: 'wvrmit',
    link: 'wvrmit',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Wvrmit.aggregateAsset('css', 'wvrmit.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Wvrmit.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Wvrmit.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Wvrmit.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Wvrmit;
});
