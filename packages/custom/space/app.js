'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Space = new Module('space');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Space.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Space.routes(app, auth, database);
  
  Space.aggregateAsset('css', 'space.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Space.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Space.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Space.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  //Space.angularDependencies(['spaceServices', 'spaceControllers', 'spaceFilters', 'spaceAnimations']);

  return Space;
});
