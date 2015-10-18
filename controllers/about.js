

function About(db){
	
	return {
		
		show: function(req, res, next){
		
			  res.render('about', { title: 'About' });

		}
		
	}
	
} 

module.exports = About;