var express = require('express');
var router = express.Router();

var home = require("../controllers/home.js")();
var about = require("../controllers/about.js")();


router.get('/', function(req, res, next) {

  home.show(req, res, next);

});


router.get('/about', function(req, res, next) {
  
  about.show(req, res, next);

});


module.exports = router;
