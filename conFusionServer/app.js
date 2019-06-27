// Modules
const express       = require('express');       
const path          = require('path');
const favicon       = require('serve-favicon');
const logger        = require('morgan');
const bodyParser    = require('body-parser');
const session       = require('express-session');
const passport      = require('passport');
const authenticate  = require('./authenticate');

// Global Settings
const config = require('./config');

// Routers
const index         = require('./routes/index');
const users         = require('./routes/users');
const dishRouter    = require('./routes/dishRouter');
const promoRouter   = require('./routes/promoRouter');
const leaderRouter  = require('./routes/leaderRouter');
const uploadRouter  = require('./routes/uploadRouter');

// Mongoose Settings
const mongoose      = require('mongoose');
mongoose.Promise    = require('bluebird');
const url           = config.mongoUrl;
const options       = config.mongoOpts;
const connect = mongoose.connect(url);

connect.then(
  db => {
    console.log("\n Connected correctly to server!\n\n Console log: \n");
  },
  err => {
    console.log(err);
  }
);

// Application
const app = express();

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

// Authentication Middleware
app.use( passport.initialize());

// Mount Routes
app.use('/', index);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);

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
