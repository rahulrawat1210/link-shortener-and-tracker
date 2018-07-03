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

// grab the url modelss
var Url = require('./models/url.js')
var counter = require('./models/counter.js')
var logs = require('./models/logs.js');

app.use(device.capture({
    parseUserAgent: true
}));

app.use(requestIp.mw());
useragent(true);
app.use(bodyParser.json());
device.enableDeviceHelpers(app);
device.enableViewRouting(app);

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
            shortUrl = config.webhost + "url/" + base58.encode(doc._id);

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
app.get('/url/:encoded_id', function (req, res) {
    var base58Id = req.params.encoded_id;
    
    var id = base58.decode(base58Id);   
    
    var ver = req.device.parser.useragent.family + ": " 
            + req.device.parser.useragent.major + "."
            + req.device.parser.useragent.minor + "." 
            + req.device.parser.useragent.patch;

    var deviceType = req.device.type;

    var agent = useragent.parse(req.headers['user-agent']);
    const IP = req.clientIp;
      //var date = new Date();

<<<<<<< HEAD
    var os = agent.os.toString();
    console.log(deviceType + ": " + os);

    // check if url already exists in database
    Url.findOne({
        _id: id
    }, function (err, doc) {
        if (doc) {
            // found an entry in the DB, redirect the user to their destination
            res.redirect(doc.long_url);
        } else {
            // nothing found, take 'em home
            res.redirect(config.webhost);
        }
    })

})




//Testing server request
app.get('/hello/', function (req, res) {
    
    
    var data = { ip :req.clientIp,deviceType,os,country, region, city};

request.post({
    headers: {'content-type': 'application/json'},
    url: 'http://localhost:3000/new',
    form: data
}, function(error, response){
  console.log('ended');
});
      res.redirect('https://google.com')
=======
    var country, region, city, timezone;

    var os = agent.os.toString();
    
    request.get({
        url: "http://ip-api.com/json/" + IP,
        json: true,
    
    }, (error, res, data) => {
        if (error) {
            console.log('Error:', error);
            res.json({
                success: false,
                err: 'Problem in Geo Location API!!!'
            });
            
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
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
            }
        }
    });

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
        headers: {'content-type': 'application/json'},
        url: 'http://localhost:3000/insertLog',
        form: data

    }, function(error, response){
        console.log('ended');
    });
    
    // check if url already exists in database
    Url.findOne({
        _id: id
    }, function (err, doc) {
        if (doc) {
            // found an entry in the DB, redirect the user to their destination
            res.redirect(doc.long_url);
        } else {
            // nothing found, take 'em home
            res.redirect(config.webhost);
        }
    })
>>>>>>> 45a804a993dced4daaa83dc574fda511890d744f
})

// //Testing server request
// app.get('/hello/', function(req, res){
    
// })

app.post('/insertLog', (req, res)=>{
    res.end();
    
    logs.create({
        _id: req.body._id,
        ip: req.body._ip,
        browser_type: req.body._agent,
        country: req.body._country,
        city: req.body._city,
        region: req.body._region,
        device: {
            devType: req.body._type,
            os: req.body._os
        }
    }, function(err){
        console.log(err);
    });
})