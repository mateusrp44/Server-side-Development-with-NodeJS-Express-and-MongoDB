// Modules
const express       = require('express');       
const path          = require('path');
//const favicon       = require('serve-favicon');
const logger        = require('morgan');
const bodyParser    = require('body-parser');
const session       = require('express-session');
const passport      = require('passport');
const authenticate  = require('./authenticate');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');

// Global Settings
const config = require('./config');

// Routers
const index          = require('./routes/index');
const users          = require('./routes/users');
const dishRouter     = require('./routes/dishRouter');
const promoRouter    = require('./routes/promoRouter');
const leaderRouter   = require('./routes/leaderRouter');
const uploadRouter   = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');

// Mongoose Settings
const mongoose      = require('mongoose');
mongoose.Promise    = require('bluebird');
const url           = config.mongoUrl;
const options       = config.mongoOpts;
const connect = mongoose.connect(url, {
  useMongoClient: true,
  /* other options */
});

connect.then(
  db => {
    console.log("\n Connected correctly to server!\n\n Output log: \n");
  },
  err => {
    console.log(err);
  }
);

// Application
const app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
    if (req.secure) return next();
    else res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
    //res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// App Middlewares
//app.use( favicon( path.join(__dirname, 'public', 'favicon.ico')));
app.use( logger('dev'));
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: false }));
app.use( express.static( path.join(__dirname, 'public')));
//app.use(cookieParser('12345-67890-09876-54321'));

const cors = require("cors");
app.use(cors());

/*app.use(session({
   name: 'session-id',
   secret: '12345-67890-09876-54321',
   saveUninitialized: false,
   resave: false,
   store: new FileStore()
}));*/

// Authentication Middleware
app.use( passport.initialize());
// app.use(passport.session());

// Mount Routes
app.use('/', index);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

/*function auth (req, res, next) {
  console.log(req.user);
  if (!req.user) {
    var err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');                          
    err.status = 401;
    next(err);
  }
  else {
      next();
  }
}

app.use(auth);*/

// Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler: will print stacktrace.
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// Production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  // next is the last argument in above function
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

// Export module
module.exports = app;
