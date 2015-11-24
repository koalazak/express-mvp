

var msgs = {

	error : function(msg){
		return {type:"error", css: "alert-danger", msg:msg };
	},
	ok : function(msg){
		return {type:"success", css: "alert-success", msg:msg };
	}

}

module.exports=msgs;