var nodemailer = require('nodemailer');
var ejs=require("ejs");
var path = require('path');

var Emails = function(opts){

	var defaultFrom=opts.from || "noreply@example.com"; 
	var defaultReplayTo=opts.replyTo || "noreply@example.com";
	var templatesPath=opts.templatesPath || __dirname;
	var proyectName=opts.proyectName || "This";
	
	var transporter = nodemailer.createTransport();
	
	return {
	
		send : function(from, replyTo, to, subject, template, data){
		
			data.proyectName=proyectName;
		
			var elpath=path.join(templatesPath, template+".ejs");
			var rawContent=require("fs").readFileSync(elpath).toString();
			var html=ejs.render(rawContent, data);
		
			//TODO
			var text="";
			
			var mailOptions = {
			    from: defaultFrom,
			    to: to, 
			    subject: subject, 
			    text: text,
			    html: html
			};
		
			transporter.sendMail(mailOptions, function(error, info){
			    if(error){
			        return console.log(error);
			    }
			    console.log('Message sent: ', info);
			
			});
			
			
		},
		
		
		sendRegister: function(to, data){
			
			var subject = "Welcome!";
			if(data.registerConfirmation) subject=subject+" Confirm your account.";
			
			this.send(defaultFrom, defaultReplayTo, to, subject, "register", data );
			
		}
		
	}

}

module.exports=Emails;
