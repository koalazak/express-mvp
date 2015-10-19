var express = require('express');
var router = express.Router();
var db=require("../app.js").db;

var home = require("../controllers/home.js")(db);
var about = require("../controllers/about.js")(db);


router.get('/', function(req, res, next) {

  home.show(req, res, next);

});


router.get('/about', function(req, res, next) {
  
  about.show(req, res, next);

});


module.exports = router;
