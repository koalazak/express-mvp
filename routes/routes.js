var express = require('express');
var router = express.Router();
var db=require("../app.js").db;

var home = require("../controllers/home.js")(db);
var about = require("../controllers/about.js")(db);
var contact = require("../controllers/contact.js")(db);


router.get('/', function(req, res, next) {

  home.show(req, res, next);

});


router.get('/about', function(req, res, next) {
  
  about.show(req, res, next);

});

router.get('/contact', function(req, res, next) {
  
  contact.show(req, res, next);

});

router.get('/login', function(req, res, next) {
  
  home.loginForm(req, res, next);

});

router.get('/register', function(req, res, next) {
  
  home.registerForm(req, res, next);

});


module.exports = router;
