var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create the counters schema with an _id field and a seq field
// create the counters schema with an _id field and a seq field
var CounterSchema = Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 0
    }
});

var counter = mongoose.model('counter', CounterSchema);

module.exports = counter;