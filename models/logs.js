var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logSchema = Schema({
    
    timestamp: {
        type: String,
        default: Date.now().toString()
    },
    ip: {
        type: String,
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


// create a model from that schema
var logs = mongoose.model('logs', logSchema);

module.exports = logs;
