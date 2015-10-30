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
    uuid: {type: String, unique: true, sparse: true},
    name: {type: String},
    owner: {type: Schema.ObjectId, ref: 'User'},
    type: {type: String},
    extra: {}
}, { strict: true });

FacilitySchema.pre('save', function(next){
    if(!this.uuid || this.uuid == '') {
        this.uuid = this.id;
    }

    next();
});

/**
 * Space Schema
 */
var SpaceSchema = new Schema({
    __v: { type: Number, select: false},
    uuid: {type: String, unique: true, sparse: true},
    name: {type: String},
    owner: {type: Schema.ObjectId, ref: 'User'},
    type: {type: String},
    facilities: [FacilitySchema],
    spaces: [{type: Schema.Types.ObjectId, ref: 'SpaceSchema'}],
    locker: {type: String},
    extra: {}
}, { strict: true })
    .index({uuid: 'text', name: 'text', owner: 'text'});

/**/
SpaceSchema.pre('save', function(next){
    if(!this.uuid || this.uuid == '') {
        this.uuid = this.id;
    }

    next();
});

mongoose.model('Space', SpaceSchema);