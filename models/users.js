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
							activationStatus: accEnable,
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
							activationStatus: null,
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
					 throw new Error('Error cheking user existence.')
					 return;
				}else{
					cb(d);
				}

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
		
		facebookFindOrCreate: function (profile, cb){
		
			var _this=this;
			var errorText="An error ocurred with Facebook Connect.";
			
			if("id" in profile){
				
				db.users.findOne({"id": profile.id, "provider": "facebook"}, function(e, fu){
				
					if(e){
						 cb(errorText, null);
						 return;
					}else{
						
						if(fu == null){
							//create user
							_this.addFacebook(profile, function(cErr, uData){
								if(cErr){
									cb(errorText, null);
								}else if(uData){
									cb(null, uData);
								}else{
									cb(errorText, null);
								}
								
							});
							
						}else{
							//login user
							cb(null, fu);
						}
					}
				})
				
			}else{
				cb(errorText, null);
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
				    _this.facebookFindOrCreate(profile , function(err, user) {
				      if (err) { return done(null, false, err); }
				      
				      if (!user) {
				        return done(null, false, { message: 'An error ocurred with Facebook Connect. Please try again or create a local account.' });
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