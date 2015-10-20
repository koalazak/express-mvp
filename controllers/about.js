

function About(db){
	
	return {
		
		show: function(req, res, next){
		
			  res.render('about', { title: 'About us' });

		},

		legal: function(req, res, next){
		
			  res.render('legal', { title: 'Terms and Conditions' });

		}
		
	}
	
} 

module.exports = About;