var mongojs = require('mongojs');
var path = require('path');

var env = process.env.NODE_ENV !== 'production';

if(env){
    //dev
	var db = mongojs('mvp', ['users']);
	db.users=db.collection('users');

}else{
	//production
	var db = mongojs('mvp', ['users']);
	db.users=db.collection('users');
}


module.exports = {
					db: db,
					env: env,
					sessionSecret: "changeme",
					projectName: "MVP",
					emailData: {
						templatesPath: path.join(__dirname, 'views/emails'),
						from: "MVP <mvp@example.com",
						replyTo: "MVP <mvp@example.com",
						proyectName: module.exports.projectName
					},
					registerEnabled: true,
					registerConfirmation: true,
					facebookLoginEnabled: false,
					FACEBOOK_APP_ID : "",
					FACEBOOK_APP_SECRET: "",
					FACEBOOK_CALLBACK_DOMAIN: ""
				};
