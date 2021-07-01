const Mongoose = require('mongoose');
Mongoose.set('useCreateIndex', true);
Mongoose.set('useFindAndModify', false);
Mongoose.connect('mongodb://' + process.env.DBUserName + ':' + process.env.DBPassword + '@' + process.env.DBUrl + '/' + process.env.DatabaseName,{ useNewUrlParser: true });
// Mongoose.connect("mongodb://admin:jmc123@ds059546.mlab.com:59546/jmcf",{ useNewUrlParser: true });

const db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', async function callback() {
    console.log("Connection with database succeeded.");
});

const redisClient = require('redis').createClient;
const redis = redisClient(6379, '127.0.0.1');

module.exports.redis = redis
module.exports.Mongoose = Mongoose;
module.exports.db = db;
