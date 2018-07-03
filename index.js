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
app.use(device.capture({parseUserAgent:true}))
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
app.get('/:encoded_id', function (req, res) {
    var base58Id = req.params.encoded_id;
    var id = base58.decode(base58Id);
    var ver = req.device.parser.useragent.major+"."+req.device.parser.useragent.minor+"."+req.device.parser.useragent.patch;
    var agent = useragent.parse(req.headers['user-agent']);
    const IP = req.clientIp;
    var os = agent.os.toString();

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
// app.get('/', function(req, res){
//     var data = '{ "request" : "msg"}';
// var json_obj = JSON.parse(data);
// request.post({
//     headers: {'content-type': 'application/json'},
//     url: 'http://localhost:3000/new',
//     form: json_obj
// }, function(error, response){
//   console.log('ended');
// });
//       res.redirect('https://google.com')
// })

// app.post('/new', (req, res)=>{
//     res.end();
//     setTimeout(function(){
//         console.log('response ended')
//     }, 10000)
// })