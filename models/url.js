var mongoose = require('mongoose');
var counter = require('./counter.js');
var Schema = mongoose.Schema;
// create the counters schema with an _id field and a seq field
// create the counters schema with an _id field and a seq field
// var CounterSchema = Schema({
//     _id: {
//         type: String,
//         required: true
//     },
//     seq: {
//         type: Number,
//         default: 0
//     }
// });

// create a model from that schema
// var counter = mongoose.model('counter', CounterSchema);
// create a schema for our links
var urlSchema = new Schema({
    _id: {
        type: Number,
        index: false
    },
    long_url: String,
    noOfHits: Number,
    created_at: Date
});

// The pre('save', callback) middleware executes the callback function
// every time before an entry is saved to the urls collection.
urlSchema.pre('save', function (next) {
    var doc = this;
    // find the url_count and increment it by 1
    counter.findByIdAndUpdate({
        _id: 'url_count'
    }, {
        $inc: {
            seq: 1
        }
    }, function (error, count) {
        if (error) {
            //There is no counter yet
            console,log(error);
            counter.create({
                _id: 'url_count',
                seq: 1
            });

            counter.findByIdAndUpdate({
                _id: 'url_count'
            }, {
                $inc: {
                    seq: 1
                }
            }, function (error, count) {
                if (error) {
                    //There is no counter yet
                    console,log(error);           
                }
                // set the _id of the urls collection to the incremented value of the counter
                doc._id = count.seq;
                doc.created_at = new Date();
                next();
            });            
        }

        // set the _id of the urls collection to the incremented value of the counter
        doc._id = count.seq;
        doc.created_at = new Date();
        next();
    });
});
var Url = mongoose.model('Url', urlSchema);
module.exports = Url;