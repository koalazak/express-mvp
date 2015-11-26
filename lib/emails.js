var nodemailer = require('nodemailer');
var htmlToText = require('nodemailer-html-to-text').htmlToText;

var ejs=require("ejs");
var path = require('path');

var Emails = function(opts){

	var defaultFrom=opts.from || "noreply@example.com"; 
	var defaultReplayTo=opts.replyTo || "noreply@example.com";
	var templatesPath=opts.templatesPath || __dirname;
	var proyectName=opts.proyectName || "the project";
	
	var smtpTransport = require('nodemailer-smtp-transport');
	var transporter = nodemailer.createTransport(smtpTransport());
	transporter.use('compile', htmlToText());
	
	return {
	
		send : function(from, replyTo, to, subject, template, data){
		
			data.proyectName=proyectName;
		
			var elpath=path.join(templatesPath, template+".ejs");
			var rawContent=require("fs").readFileSync(elpath).toString();
			var html=ejs.render(rawContent, data);
			
			var mailOptions = {
			    from: defaultFrom,
			    to: to, 
			    subject: subject, 
			    html: html,
			    replyTo: replyTo
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
			
		},
		
		sendForgot: function(to, data){
			
			var subject = "How to reset your password.";
			
			this.send(defaultFrom, defaultReplayTo, to, subject, "forgot", data );
			
		},

		
		sendContactFromWeb: function(to, data){
			
			var subject = "Contact from Web";
			
			this.send(defaultFrom, data.email, to, subject, "contact", data );
		
		}
		
	}

}

module.exports=Emails;
