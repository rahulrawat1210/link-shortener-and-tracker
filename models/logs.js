var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logs = Schema({
    _id: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: 0
    },
    ip: {
        type:String,
        default: 0
    },
    country: {
        type: String,
        default: 0
    },
    region: {
        type: String,
        default: 0
    },
    city: {
        type: String,
        default: 0
    },
    browser_type: {
        type: String,
        default: 0
    },
    platform_type: {
        type: String,
        default: 0
    },
    is_mobile: {
        type: Boolean,
        default: 0
    }
});

var logSchema = new Schema();
// create a model from that schema
var logs = mongoose.model('logs', logs);


module.exports = logs;
