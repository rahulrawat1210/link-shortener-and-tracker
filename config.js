
var config = {};

config.db = {};
config.user = {};

// the URL shortening host - shortened URLs will be this + base58 ID
// i.e.: http://localhost:3000/3Ys

config.webhost = 'http://localhost:3000/';

// your MongoDB host and database name

config.db.host = 'localhost';
config.db.name = 'url_shortener';
config.user.name = 'siddhant';
config.user.password = 1234;

module.exports = config;

//nodejs in action
