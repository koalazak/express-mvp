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

		activation: function(params, cb){

			var pto = {
				'viewOpts' : { title: 'Account activation' },
				'msgs':[]
			}

			var username = paramParser.expect(params.bodyGet.user, "string","").trim();
			var code = paramParser.expect(params.bodyGet.acode, "string","").trim();

			userModel.checkActivationCode(username, code, function(err,udata){

				if(err){
					switch(err){
						case 'ERROR_ALREADY_ACTIVATED':
							var errorText="Your activation link is expired. Try recovering your password.";
						break;
						case 'ERROR_EXPIRED':
							//Send email again
							userModel.genNewActivationHash(udata._id, udata.username, function(newAcivationHash){

								Emails.sendRegister(udata.emails[0].value, {
									registerConfirmation: true, 
									name: udata.displayName,
									activationHash: newAcivationHash,
									baseURL: params.baseURL,
									account: udata.username 
								});
							});

							var errorText="Your activation link is expired. Check your email to follow a new activation link.";
						break;
						default:
							var errorText="Invalid activation link.";
						break;
					}
					pto.msgs.push(msgs.error(errorText));

				}else{
					//updateDB
					userModel.activateAccount(udata._id);
					pto.msgs.push(msgs.ok("Activation successfull. Please login."));
				}
				cb(pto);
			});
		},
		
		resetPasswordForm: function(params, cb){

			var pto = {
				'viewOpts' : { title: 'Reset your password' },
				'codeOK': false,
				'msgs':[]
			}

			var username = paramParser.expect(params.bodyGet.user, "string","").trim();
			var code = paramParser.expect(params.bodyGet.rcode, "string","").trim();

			userModel.checkRecoverCode(username, code, function(err,udata){

				if(err){
					switch(err){
						case 'ERROR_EXPIRED':
							var errorText="Your link is expired. Start the recovery process again.";
						break;
						default:
							var errorText="Invalid recovery link.";
						break;
					}
					pto.msgs.push(msgs.error(errorText));
				}else{
					params.session.resetPasswordApproved = true;
					params.session.resetPasswordUser= udata;
					pto.codeOK=true;
				}
				cb(pto);
			});
		},
		
		checkPasswordPolicy: function(pass){
			
			var retMsgs = [];
			
			if(pass.length < 8){
					retMsgs.push(msgs.error("Your passwords must have more than 8 characters."));	
			}
			
			return retMsgs;
			
		},
		
		resetPassword: function(params, cb){
			var _this=this;
			
			var pto = {
				'viewOpts' : { title: 'Reset your password', msgs:[] }
			}
			
			if("session" in params && "resetPasswordApproved" in params.session && params.session.resetPasswordApproved === true){
				
				var userData = params.session.resetPasswordUser;
				var userPassword1 = paramParser.expect(params.bodyPost.userPassword1,"string","");
				var userPassword2 = paramParser.expect(params.bodyPost.userPassword2,"string","");
				
				if(userPassword1 != userPassword2){
					pto.viewOpts.msgs.push(msgs.error("The passwords must be equals."));
					pto.viewOpts.showForm=true;
				}
				var passchecks=_this.checkPasswordPolicy(userPassword1)
				if(passchecks){
					pto.viewOpts.msgs=pto.viewOpts.msgs.concat(passchecks);
					pto.viewOpts.showForm=true;
				}
				
				if(userData.enable !== true){
					pto.viewOpts.msgs.push(msgs.error("Unauthorized attempt"));
					pto.viewOpts.showForm=false;
				}
				
				if(pto.viewOpts.msgs.length){
					return cb(pto);
				}else{
					
					userModel.updatePassword(userData._id, userPassword1, function(err, pok){
						
						if(err){
							pto.viewOpts.showForm=false;
							pto.viewOpts.msgs.push(msgs.error("Error changing password."));
						}else{
							pto.viewOpts.msgs.push(msgs.ok("Your password was reset! Please login."));
							params.session.resetPasswordApproved=false;
							params.session.resetPasswordUser=null;
							userModel.resetRecoveryAccountStatus(userData._id);
							pto.viewOpts.showForm=false;
						}
						return cb(pto);
						
					} );
					
				}
				
			}else{
				pto.viewOpts.showForm=false;
				pto.viewOpts.msgs.push(msgs.error("Unauthorized attempt"));
				return cb(pto);
			}
			
		},
		
		suscribe: function(params, cb){
			
			var pto = {
				'response' : { status:"error", msg:"Unknown error." }
			}
			
			var email = paramParser.expect(params.bodyPost.email, "string","").trim();
			
			if(!validator.isEmail(email)) email="";
			if(email){
			
				userModel.suscribe(email, '', true);
			    pto.response={status:"ok",msg:""};
			    cb(pto);
				
			}else{
				pto.response={status:"error",msg:"Enter a valid Email address."};
				cb(pto);
			}
			
		},
		
		contact: function(params, cb){
		
			var pto = {
				'response' : { status:"error", msg:"Unknown error." }
			}
			
			var name = paramParser.expect(params.bodyPost.name, "string","").trim();
			var email = paramParser.expect(params.bodyPost.email, "string","").trim();
			var phone = paramParser.expect(params.bodyPost.phone, "string","").trim();
			var msg = paramParser.expect(params.bodyPost.message, "string","").trim();
			var suscribed = paramParser.expect(params.bodyPost.suscribed, "string","");
			if(suscribed=="on"){
				suscribed="Yes";
			} else{
				suscribed="No";
			}
			
			if(!validator.isEmail(email)) email="";
			if(email){
			
				Emails.sendContactFromWeb(mailConf.contactEmail, {
					email: email, 
					name: name,
					phone: phone,
					suscribed: suscribed,
					msg: msg
				});
				
				var nlStatus=suscribed=="Yes"?true:false;
				userModel.suscribe(email, name, nlStatus);
				

			    pto.response={status:"ok",msg:""};
			    cb(pto);
				
			}else{
				pto.response={status:"error",msg:"Enter a valid Email address."};
				cb(pto);
				
			}

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
				pto.msgs.push(msgs.error("Please chose an Alias."));
				pto.action="FAIL";
			}
			if(userAlias.length < 3){
				pto.msgs.push(msgs.error("Your Alias must have more than 3 characters."));
				pto.action="FAIL";
			}
			if(!userEmail){
				pto.msgs.push(msgs.error("Please enter a email address."));
				pto.action="FAIL";
			}
			if(userPassword1 != userPassword2){
				pto.msgs.push(msgs.error("The passwords must be equals."));
				pto.action="FAIL";

			}
			if(userPassword1.length < 8){
				pto.msgs.push(msgs.error("Your passwords must have more than 8 characters."));
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
		
		forgot: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Forgot your password?'},
				'msgs' : []
			}

			pto.msgs.push(msgs.ok("A link with instructions to reset your password was sended to you email address. Check your email!"));
			
			var userEmail = paramParser.expect(params.bodyPost.email,"string","").trim();
			if(!validator.isEmail(userEmail)) userEmail="";
						
			if(userEmail){
				userModel.existLocal(userEmail, function(uData){
					
					if(uData){
						if(uData.enable===true){
							//send Email
							userModel.genRecovery(uData._id, userEmail, function(err, recoverHash){
								
								if(!err){
									
									//send email
									Emails.sendForgot(userEmail, {
										name: uData.displayName,
										recoverHash: recoverHash,
										baseURL: params.baseURL,
										account: uData.username 
									});
									cb(pto);
									
								}else{
									cb(pto);
								}								
							});
							
						}else{
							//always say all its ok.
							cb(pto);
						}						
					}else{
						//always say all its ok.
						cb(pto);
					}
				});
			}else{
				//always say all its ok.
				cb(pto);
			}			
		},

		forgotForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Forgot your password?' },
				'action' : 'renderForgot'
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
				'viewOpts' : { title: 'Sign in' }
			}
			cb(pto);

		},

		registerForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Registration' },
				'action' : 'renderRegister'
			}
			cb(pto);

		}
		
	}
	
} 

module.exports = Home;