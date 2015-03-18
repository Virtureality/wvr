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
    menu: 'wvr'
  });
  
  Wvrmit.aggregateAsset('css', 'wvrmit.css');
  Wvrmit.aggregateAsset('css', 'masonry.css');

  Wvrmit.aggregateAsset('js', 'lib/socket.io.js');
  Wvrmit.aggregateAsset('js', 'lib/firebase.js');
  Wvrmit.aggregateAsset('js', 'lib/RTCPeerConnection-v1.5.js');
  Wvrmit.aggregateAsset('js', 'lib/conference.js');
  Wvrmit.aggregateAsset('js', 'lib/data-connection.js');
  /*Wvrmit.aggregateAsset('js', 'mit.js');
  Wvrmit.aggregateAsset('js', 'home.js');*/


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
