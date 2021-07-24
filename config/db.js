const Mongoose = require('mongoose');
Mongoose.set('useCreateIndex', true);
Mongoose.set('useFindAndModify', false);

const DB_USER = 'sany';
const PASSWORD = encodeURIComponent('sanyalam@123'); 

//Mongoose.connect('mongodb://' + process.env.DBUserName + ':' + process.env.DBPassword + '@' + process.env.DBUrl + '/' + process.env.DatabaseName,{ useNewUrlParser: true });
// Mongoose.connect("mongodb://admin:jmc123@ds059546.mlab.com:59546/jmcf",{ useNewUrlParser: true });
Mongoose.connect('mongodb+srv://sailor-user:sailor-user123@sailor-cluster.woawp.mongodb.net/sailor-express?retryWrites=true&w=majority')
const db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', async function callback() {
    console.log("Connection with database succeeded.");
});

// const redisClient = require('redis').createClient;
// const redis = redisClient(6379, '127.0.0.1');

// module.exports.redis = redis
module.exports.Mongoose = Mongoose;
module.exports.db = db;
