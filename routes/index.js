var express = require('express');
var router = express.Router();
var db=require("../app.js").db;
var registerEnabled=require("../config.js").registerEnabled;
var registerConfirmation=require("../config.js").registerConfirmation;
var localLoginEnabled=require("../config.js").localLoginEnabled;
var facebookLoginEnabled=require("../config.js").facebookLoginEnabled;

var passport = require('passport');


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

router.post('/contact', function(req, res, next) {

	var params={ bodyPost: req.body};

	indexCtrl.contact(params, function(pto){
		res.send(pto.response);
	});

});

router.get('/legal', function(req, res, next) {

	indexCtrl.legal({}, function(pto){
		res.render('legal', pto.viewOpts);
	});

});

router.get('/login', function(req, res, next) {

	if(localLoginEnabled){
		indexCtrl.loginForm({}, function(pto){
			pto.viewOpts.loginError=req.flash("error");
			pto.viewOpts.loginusername=req.flash("loginusername");
			res.render('login', pto.viewOpts);
		});
	}else{
		next();
	}

});


router.post('/login',function(req, res, next) {
  
  if(localLoginEnabled){
	  req.flash("loginusername",req.body.login_username || "");

	  passport.authenticate('local', { successRedirect: '/',
	                                   failureRedirect: '/login',
	                                   failureFlash: true })(req, res, next);
  }else{
		next();
  }
});

router.get('/auth/facebook', function(req, res, next) {

	if(facebookLoginEnabled){
		passport.authenticate('facebook' , { scope: ['read_stream', 'publish_actions'] })(req, res, next);
	}else{
		next();
	}

});

router.get('/auth/facebook/callback', function(req, res, next) {

	if(facebookLoginEnabled){
 		passport.authenticate('facebook', 
					{   successRedirect: '/',
						failureRedirect: '/login',
						failureFlash: true
					})(req, res, next);
	}else{
		next();
	}

});


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
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

router.get('/activation', function(req, res, next) {

	if(registerConfirmation){
		
		var baseURL= req.protocol + '://' + req.get('host');
		var params={ bodyGet: req.query, baseURL:baseURL};

		indexCtrl.activation(params, function(pto){
			pto.viewOpts.loginError=req.flash("error");
			pto.viewOpts.loginusername=req.flash("loginusername");
			pto.viewOpts.msgs=pto.msgs;
			console.log(pto.msgs);
			res.render('login', pto.viewOpts);
		});
	}else{
		next();
	}

});

router.get('/recover-account', function(req, res, next) {
	if(localLoginEnabled){
		indexCtrl.forgotForm({}, function(pto){
			res.render('forgot', pto.viewOpts);
		});
	}else{
		next();
	}
});

                                     									

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}


// Allow public routes
router.all('*', function(req,res,next){
  if (req.path === '/' ||
      req.path === '/login' ||
      req.path === '/contact' ||
      req.path === '/about' ||
      req.path === '/recover-account' ||
      req.path === '/activation' ||
      req.path === '/legal' ||
      req.path === '/register') {
    next();
  } else ensureAuthenticated(req,res,next);
});


module.exports = router;
