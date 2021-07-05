require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const { errors } = require('celebrate');
const helmet = require('helmet');
let io = require('socket.io');

app.use(express.urlencoded({ limit: "50mb", parameterLimit: 500000000, extended: true }));
app.use(express.json()) 
app.use(session({secret : process.env.TokenSecret, resave : false, saveUninitialized : true}));
app.use('/public',[express.static('public')])

const options = {
    explorer : true,
    apis: ['./routes/*.js'],
};

const whitelist = ['http://localhost:3000','http://localhost','http://localhost:80']
const router = require('./routes');
let server = http.createServer(app);

io = io(server);
io.origins('*:*')

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(cors());
app.use(helmet());
app.use(function(req, res, next) {
    req.io = io;
    next();
});


app.use('/api/v1/home',router.home);
app.use('/api/v1/admin',router.admin);
app.use('/api/v1/category',router.category);
app.use('/api/v1/subcategory',router.subCategory);
app.use('/api/v1/brand',router.brand);
app.use('/api/v1/vendor',router.vendor);
app.use('/api/v1/product',router.product);
app.use('/api/v1/inventory',router.inventory);
app.use('/api/v1/order',router.order);
app.use('/api/v1/supplier',router.supplier);
app.use('/api/v1/subsubcategory',router.subsubcategory);
app.use('/api/v1/customer',router.customer);
app.use('/api/v1/report',router.report);
app.use('/api/v1/promo',router.promo);
app.use('/api/v1/agent',router.agent);
app.use('/api/v1/user',router.user);
app.use('/api/v1/campaign',router.campaign);

app.use(errors());
const port = process.env.PORT || 5001;
server.listen(port,_ => console.log('Example app listening on port :' + port));
