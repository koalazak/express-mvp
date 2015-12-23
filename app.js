var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require("./config.js").db;
var i18n = require("i18n-express");
var geolang = require("geolang-express");
var passport = require('passport');
var helmet = require('helmet');
var userModel = require("./models/users.js")();
var flash = require('connect-flash');

var indexRoutes = require('./routes/index');
var myAccountRoutes = require('./routes/myaccount');

var app = express();

app.use(function(req,res,next){
    req.db = db;
    next();
});
module.exports.db=db;

userModel.initializePassport(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: require("./config.js").sessionSecret,
  saveUninitialized: true,
  resave: true
}));

app.use(geolang({
  siteLangs: ['en','es']
}));

app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'),
  siteLangs: ["en","es"]
}));

app.use(passport.initialize());
app.use(passport.session());

//TODO: tune
app.use(helmet());

//default locals
app.use(function(req, res, next) {
  req.app.locals.registerEnabled=registerEnabled = require("./config.js").registerEnabled;
  req.app.locals.facebookLoginEnabled=require("./config.js").facebookLoginEnabled;
  req.app.locals.localLoginEnabled=require("./config.js").localLoginEnabled;
  req.app.locals.loggedUser = req.user;
  next();
});

app.use('/', indexRoutes);
app.use('/', myAccountRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
var dev = process.env.NODE_ENV !== 'production';

// development error handler
// will print stacktrace
if (dev) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
