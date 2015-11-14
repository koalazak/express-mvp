var express = require('express');
var router = express.Router();
var db=require("../app.js").db;
var registerEnabled=require("../config.js").registerEnabled;

var indexCtrl = require("../controllers/index.js")();


router.get('/', function(req, res, next) {

	indexCtrl.home({}, function(pto){
		res.render('home', pto.viewOpts);
	});

});

router.get('/about', function(req, res, next) {
  
	indexCtrl.about({}, function(pto){
		res.render('about', pto.viewOpts);
	});

});

router.get('/contact', function(req, res, next) {

	indexCtrl.contactForm({}, function(pto){
		res.render('contact', pto.viewOpts);
	});

});

router.get('/legal', function(req, res, next) {

	indexCtrl.legal({}, function(pto){
		res.render('legal', pto.viewOpts);
	});

});

router.get('/login', function(req, res, next) {
  
	indexCtrl.loginForm({}, function(pto){
		res.render('login', pto.viewOpts);
	});

});

router.get('/register', function(req, res, next) {

	if(registerEnabled){
		indexCtrl.registerForm({}, function(pto){
			res.render('register', pto.viewOpts);
		});
	}else{
		next();
	}

});

router.post('/register', function(req, res, next) {

	if(registerEnabled){
		var baseURL= req.protocol + '://' + req.get('host');
		var params={ bodyPost: req.body, baseURL: baseURL};
	
		indexCtrl.registerUser(params, function(pto){
			res.send(pto);
		});
	}else{
		next();
	}

});

router.get('/recover-accout', function(req, res, next) {
  
	indexCtrl.forgotForm({}, function(pto){
		res.render('forgot', pto.viewOpts);
	});

});


module.exports = router;
