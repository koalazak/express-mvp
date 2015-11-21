
document.addEventListener("DOMContentLoaded", function(readyevent) { 

	$("#register").submit(function( event ) {
		$.post( '/register', $('#register').serialize(), function(data) {
	        if("action" in data){
	        	if(data.action=="OK"){
	        		$('#register').hide();
	        		$('#registerOK').html(data.msgs[0].msg).show().focus();
	        	}else{
	        		var errmsgs=[];
	        		for(var i=0; i<data.msgs.length; i++){
	        			errmsgs.push(data.msgs[i].msg);
	        		}
	        		$('#registerError').html(errmsgs.join("<br>")).show();
	        	}

	        }else{
	        	//showGlobalError()
	        }

	    },'json');

	  event.preventDefault();
	  return;

	});
	
	$("#contact-form").submit(function( event ) {
		$("#sendcontact").prop('disabled', true);
		$.post( '/contact', $('#contact-form').serialize(), function(data) {
	        if("status" in data){
	        	if(data.status=="ok"){
	        		$('#contact-form').hide();
	        		$('#contact-thanks').show();
	        		
	        	}
	        	$("#sendcontact").prop('disabled', false);
	        }
	    },'json');

	  event.preventDefault();
	  return;

	});


});