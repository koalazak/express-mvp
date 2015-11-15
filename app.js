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
var LocalStrategy = require('passport-local').Strategy;
var userModel = require("./models/users.js")();


var indexRoutes = require('./routes/index');

var app = express();

app.use(function(req,res,next){
    req.db = db;
    next();
});
module.exports.db=db;


//TODO: move all password
// Passport
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  userModel.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'login_username',
    passwordField: 'login_password'
  },
  function(username, password, done) {
    userModel.auth(username, password, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username/password.' });
      }
      return done(null, user);
    });
  }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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

// Ensure auth
app.all('*', function(req,res,next){
  if (req.path === '/' ||
      req.path === '/login' ||
      req.path === '/contact' ||
      req.path === '/about' ||
      req.path === '/recover-account' ||
      req.path === '/legal' ||
      req.path === '/register') {
    next();
  } else ensureAuthenticated(req,res,next);
});

//some locals
app.use(function(req, res, next) {
  var registerEnabled = require("./config.js").registerEnabled;
  req.app.locals.registerEnabled=registerEnabled;
  req.app.locals.loggedUser = req.user;
  next();
});


app.use('/', indexRoutes);

// Login/Logout
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: false })
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

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
