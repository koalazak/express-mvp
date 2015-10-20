

function Home(db){
	
	return {
		
		show: function(req, res, next){
		
			  res.render('home', { title: 'MVP' });

		},

		loginForm: function(req, res, next){
		
			  res.render('login', { title: 'Sign in' });

		},

		registerForm: function(req, res, next){
		
			  res.render('register', { title: 'Sign up' });

		}

		
	}
	
} 

module.exports = Home;