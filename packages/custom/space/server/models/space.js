'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Facility Schema
 */
var FacilitySchema = new Schema({
    //uuid: {type: String, unique: true, sparse: true, default: _id},
    uuid: {type: String, unique: true, sparse: true},
    name: {type: String},
    owner: {type: Schema.ObjectId, ref: 'User'},
    type: {type: String, enum: ['Generic', 'Physical', 'Virtual'], default: 'Generic', required: true}
}, { strict: true });

/**
 * Space Schema
 */
var SpaceSchema = new Schema({
    //uuid: {type: String, unique: true, sparse: true, default: _id},
    //uuid: {type: String, unique: true, sparse: true, default: id},
    uuid: {type: String, unique: true, sparse: true},
    name: {type: String},
    owner: {type: Schema.ObjectId, ref: 'User'},
    type: {type: String, enum: ['Generic', 'Event', 'Org', 'Studio'], default: 'Generic', required: true},
    facilities: [FacilitySchema]
    //spaces: [SpaceSchema]
    //spaces: [this]
}, { strict: true });

SpaceSchema.add({
    spaces: [SpaceSchema]
});

/**/
SpaceSchema.pre('save', function(next){
    if(!this.uuid || this.uuid == '') {
        this.uuid = this.id;
    }

    next();
});

/*SpaceSchema.methods.populate = function(spaceObj) {

}*/

mongoose.model('Space', SpaceSchema);