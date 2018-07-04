const mongoose = require('mongoose')
const express = require('express')
const app = express()
const path = require('path')
const Schema = mongoose.Schema;
const bodyParser = require('body-parser')
const config = require('./config.js')
const base58 = require('./base58.js')
const useragent = require('useragent')
const request = require('request')
const requestIp = require('request-ip')
const device = require("express-device")
const cookieParser = require("cookie-parser");
const session = require('express-session');
const myUrl = require('url');
var countBlockRequests = 1;

// grab the url modelss
var Url = require('./models/url.js')
var counter = require('./models/counter.js')
var logs = require('./models/logs.js');

app.use(device.capture({
    parseUserAgent: true
}));

app.use(session({secret: 'secret'}));
app.use(cookieParser());
app.use(requestIp.mw());
useragent(true);
app.use(bodyParser.json());
device.enableDeviceHelpers(app);
device.enableViewRouting(app);

var date = new Date();

// create a connection to our MongoDB
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, () => {
    console.log("Connected to db...")
});

app.use(express.static(path.join(__dirname, 'public')))
// handles JSON bodies
app.use(bodyParser.json());
// handles URL encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));


var server = app.listen(3000,function(){
    console.log('Server started on port 3000')
})
// app.get('/rajat', function (req, res)
// {
//     res.send("rajat");
// })

app.post('/api/shorten', function (req, res) {
    var longUrl = req.body.url;
    var shortUrl = '';

    // check if url already exists in database
    Url.findOne({
        long_url: longUrl
    }, function (err, doc) {
        if (doc) {
            // base58 encode the unique _id of that document and construct the short URL
            shortUrl = config.webhost + base58.encode(doc._id);

            // since the document exists, we return it without creating a new entry
            res.send({
                'shortUrl': shortUrl
            })

        } else {
            // The long URL was not found in the long_url field in our urls
            // collection, so we need to create a new entry:
            var newUrl = Url({
                long_url: longUrl
            });

            // save the new link
            newUrl.save(function (err) {
                if (err) {
                    console.log(err);
                }

                // construct the short URL
                shortUrl = config.webhost + base58.encode(newUrl._id);

                res.send({
                    'shortUrl': shortUrl
                });
            })
        }

    });

});

// //Testing server request
// app.get('/hello/', function(req, res){
    
// })


app.post('/insertLog', (req, res)=>{
    res.end();

    logs.create({
        url_ID: req.body._id,
        ip: req.body._ip,
        browser_type: req.body._agent,
        country: req.body._country,
        timestamp: date.toDateString() + " @ " + date.toTimeString(), 
        city: req.body._city,
        region: req.body._region,
        
        device: {
            devType: req.body._type,
            os: req.body._os
        }
    }, function(err){
        if(err) console.log(err);
    });
})

app.get('/viewmore', function (req, res) {
    var sURL = myUrl.parse(sURL).path.substr(1);
   
    logs.find({sURL}, function (err, data) {
        res.send(data);
    });

    // console.log(myUrl.parse(sURL).path.substr(1));    
})

app.get('/:encoded_id', function (req, res) {

    if (req.cookies.startTime !== null && req.cookies.startTime !== undefined) {
        res.cookie('currentTime', new Date().getTime());

    } else {
        res.cookie('startTime', date.getTime());
        countBlockRequests = 1;
    }

    if (req.cookies.counter !== null && req.cookies.counter !== undefined) {
        var counter = 1 + parseInt(req.cookies.counter);
        console.log(counter);
        res.cookie('counter', counter);

    } else {
        res.cookie('counter', 1);
    }

    var base58Id = req.params.encoded_id;

    var id = base58.decode(base58Id);

    var ver = req.device.parser.useragent.family + ": " +
        req.device.parser.useragent.major + "." +
        req.device.parser.useragent.minor + "." +
        req.device.parser.useragent.patch;

    var deviceType = req.device.type;

    var agent = useragent.parse(req.headers['user-agent']);
    const IP = req.clientIp;
    //var date = new Date();

    var country, region, city, timezone;

    var os = agent.os.toString();

    request.get({
        url: "http://ip-api.com/json/122.161.193.100", // + IP,
        json: true,

    }, (error, ress, data) => {
        if (error) {
            console.log('Error:', error);
            res.json({
                success: false,
                err: 'Problem in Geo Location API!!!'
            });

        } else if (ress.statusCode !== 200) {
            // console.log('Status:', ress.statusCode);
            res.json({
                success: false,
                err: 'No data Found for this IP!!!!'
            });

        } else {

            if (data.status == 'fail') {
                res.json({
                    success: false,
                    err: "Invalid IP " + data.query
                });

            } else {
                country = data.country;
                timezone = data.timezone;
                city = data.city;
                region = data.regionName;

                var data = {
                    _id: id,
                    _ver: ver,
                    _type: deviceType,
                    _country: country,
                    _region: region,
                    _city: city,
                    _os: os,
                    _agent: ver,
                    _ip: IP
                };

                request.post({
                    headers: {
                        'content-type': 'application/json'
                    },
                    url: 'http://localhost:3000/insertLog',
                    form: data

                }, function (error, response) {
                    // console.log('ended');
                });

                // check if url already exists in database and updates the hit number
                Url.findByIdAndUpdate({
                    _id: id
                }, {
                    $inc: {
                        noOfHits: 1
                    }
                }, function (err, doc) {

                    if (doc) {

                        console.log((req.cookies.currentTime - req.cookies.startTime));

                        if (req.cookies.counter >= 3 && (req.cookies.currentTime - req.cookies.startTime) <= 100000) {

                            if (req.cookies.timestamp !== null && req.cookies.timestamp !== undefined) {
                                if (Date.now() - req.cookies.timestamp > 50000) {
                                    res.clearCookie('timestamp');
                                    res.clearCookie('startTime');
                                    res.redirect(doc.long_url);

                                } else {
                                    res.send('BLOCKED');
                                }
                            } else {
                                res.cookie('timestamp', Date.now()).send('BLOCKED');
                            }

                        } else {
                            res.redirect(doc.long_url);
                        }

                    } else {
                        res.redirect(config.webhost);
                    }
                });

            }

        }

    });

});
