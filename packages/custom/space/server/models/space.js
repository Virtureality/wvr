'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Space Schema
 */

var SpaceSchema = new Schema({
    name: {
        type: String
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        required: true
    },
    construct: {
        type: Schema.ObjectId,
        ref: 'Space'
    }
});

mongoose.model('Space', SpaceSchema);