var crypto = require('crypto');
var uuid = require('uuid');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

function Users(){

	var db=require("../config").db;
	
	var FACEBOOK_APP_ID=require("../config").FACEBOOK_APP_ID;
	var FACEBOOK_APP_SECRET=require("../config").FACEBOOK_APP_SECRET;
	var FACEBOOK_CALLBACK_DOMAIN=require("../config").FACEBOOK_CALLBACK_DOMAIN;
	var facebookLoginEnabled= require("../config").facebookLoginEnabled;

	var registerConfirmation=require("../config").registerConfirmation;

	var ACTIVATION_EXPIRE=1000*60*60*24*7; // 7 days
	var RECOVER_EXPIRE=1000*60*60*3; // 3 hours
	
	return {

		addLocal : function (data, cb){

			var encPass = crypto.createHash('sha256').update(data.userPassword).digest('hex');
			var activationHash = crypto.createHash('sha256').update("69"+data.userEmail+uuid.v4()).digest('hex');
			var compatibleID=uuid.v4();
			
			if(registerConfirmation){
				var accEnable=false;
			}else{
				var accEnable=true;
			}
			
			db.users.insert({
							provider:"local",
							id:compatibleID,
							enable: accEnable,
							activationRequired: !accEnable,
							activationHash:  activationHash,
							activationStart: new Date(),
							recoverHash: '',
							recoverStart: null,
							username: data.userEmail,
							password: encPass,
							displayName: data.userAlias, 
							name: {familyName: '', middleName: '', givenName: data.userAlias},
							emails: [{value:data.userEmail, type:'home'}],
							photos: [],
							creationDate: new Date(),
							gender: "n/a",
							profileUrl: ""
						},function(e, d){
							cb(e,d);
						});
		},
		
		addFacebook : function (data, cb){
			
			var randomPass=crypto.createHash('sha256').update("pass"+data.id+uuid.v4()).digest('hex');
			var username = data.username || "f"+data.id;
			
			db.users.insert({
							provider:"facebook",
							id: data.id,
							enable: true,
							activationRequired: false,
							activationHash:  null,
							activationStart: null,
							recoverHash: '',
							recoverStart: null,
							username: username,
							password: randomPass,
							displayName: data.displayName, 
							name: {familyName: data.name.familyName, middleName: data.name.middleName, givenName: data.name.givenName},
							emails: [],
							photos: [],
							creationDate: new Date(),
							gender: data.gender,
							profileUrl: data.profileUrl,
							_json: data._json
						},function(e, d){
							cb(e,d);
						});
		},


		existLocal: function (username, cb){

			db.users.findOne({username: username, provider: "local"}, function(e, d){
				
				if(e){
					 throw new Error(e)
					 return;
				}else{
					cb(d);
				}

			})

		},
		
		suscribe: function(email, name, status, cb){
			
			var cb = cb || function(){};
			
			db.suscriptions.update({email: email},{email:email, name:name, status:status, date: new Date()}, {upsert:true}, function(e, d){
				cb(e,d);
			})
			
		},
		
		auth: function (username, password, cb){
			
			var encPass = crypto.createHash('sha256').update(password).digest('hex');
			
			db.users.findOne({username: username, password: encPass, enable: true, "provider":"local"}, function(e, d){
				cb(e,d);
			})

		},
		
		findById: function (id, cb){
			db.users.findOne({_id: db.ObjectId(id)}, function(e, d){
				
				cb(e,d);

			});

		},

		checkActivationCode: function(user, code, cb){

			var _this=this;
			
			db.users.findOne({"username": user, "provider": "local", }, function(e, fu){
				if(e){
					cb("ERROR_DB");
				}else{
					if(fu){
						if(fu.activationHash === code && code.trim()!=""){
							if(fu.enable===true || fu.activationRequired===false){
								return cb("ERROR_ALREADY_ACTIVATED",fu);
							}
							var dateDiff=new Date() - fu.activationStart;
							if(dateDiff > ACTIVATION_EXPIRE){
								cb("ERROR_EXPIRED",fu);
							}else{
								cb(null,fu);
							}

						}else{
							cb("ERROR_INVALID_LINK");
						}
					}else{
						cb("ERROR_USER_NOT_FOUND");
					}
				}
			});
		},
		
		checkRecoverCode: function(user, code, cb){

			var _this=this;
			
			db.users.findOne({"username": user, "provider": "local", }, function(e, fu){
				if(e){
					cb("ERROR_DB");
				}else{
					if(fu){
						//console.log(fu);
						if(fu.recoverHash === code && code.trim()!="" && fu.enable===true){
							
							var dateDiff=new Date() - fu.recoverStart;
							if(dateDiff > RECOVER_EXPIRE){
								cb("ERROR_EXPIRED",fu);
							}else{
								cb(null,fu);
							}

						}else{
							cb("ERROR_INVALID_LINK");
						}
					}else{
						cb("ERROR_USER_NOT_FOUND");
					}
				}
			});
		},

		genNewActivationHash: function(uID, email, cb){

			var activationHash = crypto.createHash('sha256').update("69"+email+uuid.v4()).digest('hex');
			db.users.update({id:uID},{$set:{activationHash:activationHash, activationStart: new Date()}}, function(err){
				cb(activationHash);
			});

		},
		
		resetRecoveryAccountStatus: function (uID){
			
			db.users.update({id:uID},{$set:{recoverHash:'',recoverStart:null }}, function(err){
				
			});
			
		},
		
		updatePassword: function(uID, plainPass, cb){
			
			var encPass = crypto.createHash('sha256').update(plainPass).digest('hex');
			
			db.users.update({id:uID},{$set:{password:encPass}}, function(err){
				cb(err, encPass);
			});
			
		},
		
		genRecovery: function(uID, username, cb){
			
			var recoverHash = crypto.createHash('sha256').update("68"+username+uuid.v4()).digest('hex');
			
			db.users.update({id:uID},{$set:{recoverHash:recoverHash, recoverStart: new Date()}}, function(err){
				cb(err, recoverHash);
			});
			
			
		},

		activateAccount: function(uID, cb){
			var cb=cb || function(){};
			db.users.update({id:uID},{$set:{enable:true, activationRequired: false }}, function(err){
				cb(err);
			});
		},
		
		facebookFindOrCreate: function (profile, cb){
		
			var _this=this;
			
			if("id" in profile){
				
				db.users.findOne({"id": profile.id, "provider": "facebook"}, function(e, fu){
				
					if(e){
						 cb(e, null);
						 return;
					}else{
						
						if(fu == null){
							//create user
							_this.addFacebook(profile, function(cErr, uData){
								if(cErr){
									cb("ERROR_ADD_USER", null);
								}else if(uData){
									cb(null, uData);
								}else{
									cb("ERROR_UNKNOWN", null);
								}
								
							});
							
						}else{
							//login user
							cb(null, fu);
						}
					}
				})
				
			}else{
				cb("ERROR_NO_DATA", null);
			}

		},

		initializePassport : function (passport){

			var _this=this;

			passport.serializeUser(function(user, done) {
			  done(null, user._id);
			});

			passport.deserializeUser(function(id, done) {
			  _this.findById(id, function(err, user) {
			    done(err, user);
			  });
			});

			// Local Strategy
			passport.use(new LocalStrategy({
			    usernameField: 'login_username',
			    passwordField: 'login_password'
			  },
			  function(username, password, done) {
			    _this.auth(username, password, function(err, user) {
			      if (err) { return done(err); }
			      if (!user) {
			        return done(null, false, { message: 'Incorrect password/username.' });
			      }
			      return done(null, user);
			    });
			  }
			));
			
			if(facebookLoginEnabled){
				// Facebook Strategy
				passport.use(new FacebookStrategy({
				    clientID: FACEBOOK_APP_ID,
				    clientSecret: FACEBOOK_APP_SECRET,
				    callbackURL: "http://"+FACEBOOK_CALLBACK_DOMAIN+"/auth/facebook/callback"
				  },
				  function(accessToken, refreshToken, profile, done) {
				  var errorMSG='An error ocurred with Facebook Connect. Please try again or create a local account.';
				    _this.facebookFindOrCreate(profile , function(err, user) {
				      if (err) { return done(null, false, { message: errorMSG }); }
				      
				      if (!user) {
				        return done(null, false, { message: errorMSG });
				      }
				      return done(null, user);
				    });
				  }
				));
			}

		}
	}

}

module.exports=Users;