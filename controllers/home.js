

function Home(db){
	
	return {
		
		show: function(req, res, next){
		
			  res.render('home', { title: 'Home' });

		}
		
	}
	
} 

module.exports = Home;