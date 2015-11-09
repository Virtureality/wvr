'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto    = require('crypto');

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
    salt: String,
    hashed_locker: {type: String},
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

/**
 * Virtuals
 */
SpaceSchema.virtual('locker').set(function(locker) {
    this._locker = locker;
    this.salt = this.makeSalt();
    this.hashed_locker = this.hash(locker);
}).get(function() {
    return this._locker;
});

/**
 * Methods
 */
SpaceSchema.methods = {

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Hash txt
     *
     * @param {String} txt
     * @return {String}
     * @api public
     */
    hash: function(txt) {
        if (!txt || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

mongoose.model('Space', SpaceSchema);