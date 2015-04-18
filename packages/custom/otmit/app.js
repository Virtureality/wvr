'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Otmit = new Module('otmit');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Otmit.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Otmit.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Otmit.menus.add({
    title: 'otmit example page',
    link: 'otmit example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Otmit.aggregateAsset('css', 'otmit.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Otmit.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Otmit.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Otmit.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Otmit;
});
