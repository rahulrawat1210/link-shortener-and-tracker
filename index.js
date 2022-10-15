const mongoose = require('mongoose')
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const config = require('./config.js')
const base58 = require('./base58.js')
const base64 = require('js-base64').Base64;
const useragent = require('useragent')
const request = require('request')
const requestIp = require('request-ip')
const device = require("express-device")
const cookieParser = require("cookie-parser");
const session = require('express-session');
const myUrl = require('url');
var blocked = false;
var cors = require('cors');
app.use(cors());

var query = {};

var cookieTimeLimit = 10000; //(around 7 seconds)
var cookieHitLimit = 3;
var cookieBlockTime = 10000 //(around 7 seconds)

// grab the url modelss
var Url = require('./models/url.js')
var logs = require('./models/logs.js');

app.use(device.capture({
    parseUserAgent: true
}));

app.use(session({
    secret: 'secret'
}));
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


var server = app.listen(3000, function () {
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

app.get('/getData', function (req, res) {
    Url.find(query, function (err, docs) {
        if (err) console.log(err);
        else
            var dataMap = [];
        query = {};
        docs.forEach(function (doc) {
            var data = {
                shortURL: config.webhost + base58.encode(doc._id),
                longURL: doc.long_url,
                numHits: doc.noOfHits,
                dateCreated: doc.created_at
            }

            dataMap.push(data);
        });

        res.send(dataMap);
    });
    query = {};
});

app.post('/insertLog', (req, res) => {
    res.end();

    logs.create({
        url_ID: req.body._id,
        ip: req.body._ip,
        browser_type: req.body._agent,
        timestamp: date.toDateString() + " @ " + date.toTimeString(),
        device: {
            devType: req.body._type,
            os: req.body._os
        }
    }, function (err) {
        if (err) console.log(err);
    });
})

app.post('/viewmore', function (req, res) {
    var sURL = myUrl.parse(req.body.sURL).path.substr(1);
    console.log("sURL: " + sURL);
    console.log("decoded: " + base58.decode(sURL));
    logs.find({
        url_ID: base58.decode(sURL)
    }, function (err, data) {
        console.log(data);
        res.send(data);
    });

    // console.log(myUrl.parse(sURL).path.substr(1));    
});

app.post("/login", (req, res) => {
    console.log(req.body.pass)
    console.log(config.user.password)
    console.log(config.user.name)
    console.log(req.body.usern)
    if (req.body.pass == config.user.password && req.body.usern == config.user.name) {

        var Encoded = base64.encode(req.body.pass);
        res.cookie("password", Encoded);
        res.json({
            reply: "success",
            redirect: "/query"
        });
    } else {
        res.json({
            reply: "Wrong username or password!!!"
        });
    }
})

app.get('/loginScreen', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/logout", function (req, res, next) {
    console.log('came here!');
    res.clearCookie("password");
    res.json({
        reply: "success",
        redirect: "/loginScreen"
    });
});

app.post('/cookieSettings', function (req, res) {
    console.log("Hit!");
    console.log(req.body);
    let hit = req.body.hit;
    let interval = req.body.myInterval;
    let block = req.body.block;

    console.log(isNaN(hit));
    console.log(isNaN(block));
    console.log(isNaN(interval));

    if (hit && !isNaN(hit)) {
        cookieHitLimit = hit;
    }

    if (block && !isNaN(block)) {
        cookieBlockTime = block;
    }

    if (interval && !isNaN(interval)) {
        cookieTimeLimit = interval;
    }

    res.send({
        hit: cookieHitLimit,
        block: cookieBlockTime,
        interval: cookieTimeLimit
    });
});

app.post('/ipInfo', function (req, res) {

    var ip;

    if (req.body.ip == "::1") {
        ip = "";

    } else {
        ip = req.body.ip;
    }

    request.get({
        url: "http://ip-api.com/json/" + ip,
        json: true,

    }, (error, ress, data) => {
        if (error) {
            console.log('Error:', error);
            res.json({
                success: false,
                err: 'Problem in Geo Location API!!!'
            });

        } else if (ress.statusCode !== 200) {
            console.log('Status:', ress.statusCode);
            res.json({
                success: false,
                err: 'No data Found for this IP!!!!'
            });

        } else {

            if (data.status == 'fail') {
                console.log(data);
                res.json({
                    success: false,
                    err: "Invalid IP " + data.query
                });

            } else {
                logs.update({
                        ip: req.body.ip.toString()
                    }, {
                        country: data.country,
                        city: data.city,
                        region: data.regionName

                    }, {
                        multi: true
                    },
                    function (err, info) {

                        console.log("===============================");
                        console.log(info);
                        console.log("===============================");

                        res.send([{
                            ip: req.body.ip,
                            country: data.country,
                            city: data.city,
                            region: data.regionName
                        }]);
                    }
                );
            }
        }
    })
});

app.get('/viewInfo', function (req, res) {
    let {
        sURL,
        lURL,
        sDate,
        eDate
    } = req.query;

    if (sURL) {
        query._id = base58.decode(myUrl.parse(sURL).path.substr(1));
    }

    if (lURL) {
        query.long_url = lURL;
    }

    if (sDate) {
        if (!query.created_at) {
            query.created_at = {};
        }

        var dates = sDate.split('-');

        query.created_at.$gte = new Date(parseInt(dates[0]), parseInt(dates[1] - 1), parseInt(dates[2]));
    }

    if (eDate) {
        if (!query.created_at) {
            query.created_at = {};
        }

        var dates = eDate.split('-');

        query.created_at.$lte = new Date(parseInt(dates[0]), parseInt(dates[1] - 1), parseInt(dates[2]));
    }

    console.log(query);

    res.sendFile(path.join(__dirname, "public", "viewAll.html"));
});

app.get('/query', function (req, res) {
    var p = base64.decode(req.cookies.password);
    if (p == config.user.password) {
        res.sendFile(path.join(__dirname, "public", "URLManager.html"));

    } else {
        res.redirect('/loginScreen');
    }
});

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

    if (req.cookies.counter >= cookieHitLimit) {
        res.cookie('startTime', date.getTime());
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

    var os = agent.os.toString();

    var data = {
        _id: id,
        _ver: ver,
        _type: deviceType,
        _os: os,
        _agent: ver,
        _ip: IP
    };

    if (!blocked) {
        request.post({
            headers: {
                'content-type': 'application/json'
            },
            url: 'http://localhost:3000/insertLog',
            form: data

        }, function (error, response) {
            // console.log('ended');
        });
    }

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

            if (req.cookies.counter >= cookieHitLimit && (req.cookies.currentTime - req.cookies.startTime) <= cookieTimeLimit) {

                if (req.cookies.timestamp !== null && req.cookies.timestamp !== undefined) {
                    if (Date.now() - req.cookies.timestamp > cookieBlockTime) {
                        res.clearCookie('timestamp');
                        res.clearCookie('startTime');
                        res.clearCookie('counter');
                        blocked = false;
                        res.redirect(doc.long_url);

                    } else {
                        blocked = true;
                        res.send('BLOCKED');
                    }
                } else {
                    res.cookie('timestamp', Date.now()).send('BLOCKED');
                    blocked = true;
                }

            } else {
                res.redirect(doc.long_url);
            }

        } else {
            res.redirect(config.webhost);
        }
    });

});

app.get('/about-app', function (req, res) {
    res.send("Author: Rahul Singh Rawat");
});
