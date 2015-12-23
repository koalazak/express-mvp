var express = require('express');
var router = express.Router();
var db=require("../app.js").db;

var myAccountCtrl = require("../controllers/myaccount.js")();

router.get('/my-account/profile', function(req, res, next) {

	
	res.render('user/profile.ejs', {title:"My Account - Profile"});
		

});

                                     									
module.exports = router;
