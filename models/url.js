var mongoose = require('mongoose');
var counter = require('./counter.js');
var Schema = mongoose.Schema;

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

        if (count === null) {
            //There is no counter yet
            counter.create({
                _id: 'url_count',
                seq: 1
            }, function () {

                counter.findByIdAndUpdate({
                    _id: 'url_count'
                }, {
                    $inc: {
                        seq: 1
                    }
                }, function (error, count2) {
                    if (error) {
                        //There is no counter yet
                        console.log(error);
                    }
                    // set the _id of the urls collection to the incremented value of the counter
                    doc._id = count2.seq;
                    var date = new Date();
                    doc.created_at = date.toDateString() + " @ " + date.toTimeString();
                    next();
                });
            });

        } else {
            doc._id = count.seq;
            doc.created_at = new Date();
            next();
        }
    });
});

var Url = mongoose.model('Url', urlSchema);
module.exports = Url