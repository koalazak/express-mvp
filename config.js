var mongojs = require('mongojs');
var path = require('path');

var dev = process.env.NODE_ENV !== 'production';

if(dev){
    //dev
	var db = mongojs('mvp', ['users']);
	db.users=db.collection('users');

}else{
	//production
	var db = mongojs('mvp', ['users']);
	db.users=db.collection('users');
}


module.exports.projectName="MVP";

module.exports.emailData={
	templatesPath: path.join(__dirname, 'views/emails'),
	from: "MVP <mvp@example.com",
	replyTo: "MVP <mvp@example.com",
	proyectName: module.exports.projectName
}

module.exports.registerConfirmation=true;
module.exports.db=db;
module.exports.env=dev;
