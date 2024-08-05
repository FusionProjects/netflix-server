const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const RedisStore = require('connect-redis').default;
const session = require('express-session');
const redis = require('ioredis');

const userRoutes = require('./routes/user');
const userProfileRoutes = require('./routes/userProfile');

dotenv.config();

app.use(express.json());
// app.use(
//   cors({
//     origin: ['http://localhost:3000', 'https://netflix-five-zeta.vercel.app'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   })
// );

var allowedOrigins = [
  'http://localhost:3000',
  'https://netflix-five-zeta.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      // if(!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        console.log('if block');
        var msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.log(err));

redisClient.on('connect', () => {
  console.log('Connected to redis instance!');
});

const redisStore = new RedisStore({client: redisClient});

app.use(
  session({
    store: redisStore,
    name: process.env.REDIS_SESSION_NAME,
    secret: process.env.REDIS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    },
  })
);

app.use('/', userRoutes);
app.use('/', userProfileRoutes);

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority`;
mongoose.connect(uri, {useNewUrlParser: true});

const con = mongoose.connection;

con.on('open', () => {
  console.log('database connected');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`backend running on ${PORT} :)`);
});
