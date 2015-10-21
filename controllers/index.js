

function Home(db){
	
	return {
		
		home: function(params, cb){

			var pto = {
				'viewOpts' : { title: "MVP" },
				'action' : 'renderHome'
			}
			cb(pto);
		},

		contactForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Contact us' },
				'action' : 'renderContact'
			}
			cb(pto);

		},

		about: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'About us' },
				'action' : 'renderAbout'
			}
			cb(pto);

		},

		legal: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Terms and Conditions' },
				'action' : 'renderLegal'
			}
			cb(pto);

		},

		loginForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Sign in' },
				'action' : 'renderLogin'
			}
			cb(pto);

		},

		registerForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Registration' },
				'action' : 'renderRegister'
			}
			cb(pto);

		},

		forgotForm: function(params, cb){
		
			var pto = {
				'viewOpts' : { title: 'Forgot your password?' },
				'action' : 'renderForgot'
			}
			cb(pto);

		}

		
	}
	
} 

module.exports = Home;