var mongojs = require('mongojs');

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


module.exports.db=db;
