var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logs = Schema({
    _id: {
        type: Number,
        default: 0,
        required: true
    },
    timestamp: {
        type: String,
        default: Date.now().toLocaleString()
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
    device: {       
        devType: String,
        os: String   
    },
    url_ID: {
        type: Number,
        required: true
    }
});

var logSchema = new Schema();
// create a model from that schema
var logs = mongoose.model('logs', logs);


module.exports = logs;
