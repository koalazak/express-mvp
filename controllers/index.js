var validator = require('validator');
var paramParser = require("../lib/param-sanitizer.js");
var msgs = require("../lib/msgs.js");
var userModel = require("../models/users.js")();

var registerConfirmation=require("../config.js").registerConfirmation;
var mailConf=require("../config.js").emailData;
var Emails = require("../lib/emails.js")(mailConf);


function Home(){
	
	return {
		
		home: function(params, cb){

			var pto = {
				'viewOpts' : { title: "MVP" },
				'action' : 'renderHome'
			}
			cb(pto);
		},

		contactForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Contact us' },
				'action' : 'renderContact'
			}
			cb(pto);

		},

		about: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'About us' },
				'action' : 'renderAbout'
			}
			cb(pto);

		},

		legal: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Terms and Conditions' },
				'action' : 'renderLegal'
			}
			cb(pto);

		},

		loginForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Sign in' },
				'action' : 'renderLogin'
			}
			cb(pto);

		},

		registerForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Registration' },
				'action' : 'renderRegister'
			}
			cb(pto);

		},

		registerUser: function(params, cb){

			var pto = {
				'msgs' :[],
				'action' : 'OK'
			}

			var userAlias = paramParser.expect(params.bodyPost.userAlias,"string","").trim();
			var userEmail = paramParser.expect(params.bodyPost.userEmail,"string","").trim();
			if(!validator.isEmail(userEmail)) userEmail="";
			var userPassword1 = paramParser.expect(params.bodyPost.userPassword1,"string","");
			var userPassword2 = paramParser.expect(params.bodyPost.userPassword2,"string","");

			if(!userAlias){
				pto.msgs.push(msgs.error("Please chose an Alias"));
				pto.action="FAIL";
			}
			if(userAlias.length < 3){
				pto.msgs.push(msgs.error("Your Alias must have more than 3 characters"));
				pto.action="FAIL";
			}
			if(!userEmail){
				pto.msgs.push(msgs.error("Please enter a email address."));
				pto.action="FAIL";
			}
			if(userPassword1 != userPassword2){
				pto.msgs.push(msgs.error("The passwords must be equals"));
				pto.action="FAIL";

			}
			if(userPassword1.length<8){
				pto.msgs.push(msgs.error("Your passwords must have more than 3 characters"));
				pto.action="FAIL";

			}

			if(pto.action=="FAIL"){
				cb(pto);
				return;
			}else{

				userModel.existLocal(userEmail, function(uData){

					if(uData){
						pto.action="FAIL";
						pto.msgs.push(msgs.error("Please, choose another email address."));
						cb(pto);
					}else{

						userModel.addLocal( {userAlias: userAlias,
											 userEmail: userEmail,
											 userPassword: userPassword1
											}, function(err,uData){
							if(err){
								pto.action="FAIL";
								pto.msgs.push(msgs.error("Unkwnon error in registration. Please contact the Adminsitrator."));
								cb(pto);
							}else{

								Emails.sendRegister(userEmail, {
																registerConfirmation: registerConfirmation, 
																name: userAlias,
																activationHash: uData.activationHash,
																baseURL: params.baseURL,
																account: userEmail 
																});
								
								var okMSG="Account created successfully.";
								if(registerConfirmation){
									okMSG=okMSG+" Please check your email to activate your Account.";
								}else{
									okMSG=okMSG+" Please login.";
								} 
								pto.msgs.push(msgs.ok(okMSG));
								cb(pto);
							}	
						});
					}

				})
			}

		},

		forgotForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Forgot your password?' },
				'action' : 'renderForgot'
			}
			cb(pto);

		}

		
	}
	
} 

module.exports = Home;