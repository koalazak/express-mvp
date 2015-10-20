

function Contact(db){
	
	return {
		
		show: function(req, res, next){
		
			  res.render('contact', { title: 'Contact us' });

		}
		
	}
	
} 

module.exports = Contact;