var crypto = require('crypto');
var uuid = require('uuid');
var LocalStrategy = require('passport-local').Strategy;

function Users(){

	var db=require("../config").db;
	var registerConfirmation=require("../config").registerConfirmation;
	
	return {

		addLocal : function (data, cb){

			var encPass = crypto.createHash('sha256').update(data.userPassword).digest('hex');
			var activationHash = crypto.createHash('sha256').update("69"+data.userEmail+uuid.v4()).digest('hex');
			
			if(registerConfirmation){
				var accEnable=false;
			}else{
				var accEnable=true;
			}
			
			db.users.insert({
								provider:"local",
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
								creationDate: new Date()
							},function(e, d){
								cb(e,d);
							});
		},

		existLocal: function (username, cb){

			db.users.findOne({username: username}, function(e, d){
				
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
			
			db.users.findOne({username: username, password: encPass, enable: true}, function(e, d){
				cb(e,d);
			})

		},
		
		findById: function (id, cb){
			db.users.findOne({_id: db.ObjectId(id)}, function(e, d){
				
				cb(e,d);

			})

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

		}
	}

}

module.exports=Users;