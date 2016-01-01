var express = require('express');
var router = express.Router();
var db=require("../app.js").db;

var myAccountCtrl = require("../controllers/myaccount.js")();

router.get('/my-account/profile', function(req, res, next) {

	res.render('user/profile.ejs', {title:"Profile"});
		
});

router.get('/my-account/settings', function(req, res, next) {

	res.render('user/settings.ejs', {title:"Account Settings"});
		
});

router.get('/my-account/emails', function(req, res, next) {

	res.render('user/emails.ejs', {title:"Email Preferences"});
		
});

                                     									
module.exports = router;
