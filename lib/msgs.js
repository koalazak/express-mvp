

var msgs = {

	error : function(msg){
		return {type:"error", msg:msg };
	},
	ok : function(msg){
		return {type:"success", msg:msg };
	}

}

module.exports=msgs;