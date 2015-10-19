"use strict";
var paramSanitizer = {

    init: function(){
        return this;
    },
  
    expect : function(value,type,defaultValue,noforce){

        switch(type){

            case "string":
                if(value){
                    if(typeof value=="string"){
                        return value;
                    }else{
                        if(noforce==true){
                            //no lo paso a string. mando el default
                            return typeof defaultValue=="string"?defaultValue:"";
                        }else{
                            if(typeof value.toString=="function"){
                                return value.toString();
                            }else{
                                 return typeof defaultValue=="string"?defaultValue:"";
                            }
                        }
                    }
                }else{
                     return typeof defaultValue=="string"?defaultValue:"";
                }

            break;
            case "boolean":
                if(typeof value=="boolean"){
                    return value;
                }else{
                    if(typeof value=="string"){
                        if(value=="true" || value=="TRUE"){
                            return true;
                        }
                        if(value=="false" || value=="FALSE"){
                            return false;
                        }

                        return typeof defaultValue=="boolean"?defaultValue:false;

                    }else{
                        return typeof defaultValue=="boolean"?defaultValue:false;
                    }
                }
            break;

            case "array":
                if( Object.prototype.toString.call( value ) === '[object Array]' ) {
                    return value;
                }else{
                    if( Object.prototype.toString.call( defaultValue ) === '[object Array]' ) {
                        return defaultValue;
                    }else{
                        return [];
                    }
                }
            break;


            case "object":
                if( SISSCore.Caronte.Object.isObject( value )) {
                    return value;
                }else{
                    if( SISSCore.Caronte.Object.isObject( defaultValue ) ) {
                        return defaultValue;
                    }else{
                        return {};
                    }//end else
                }//end else
                break;


            case "number":
                if(typeof value=="number"){
                    return value;
                }else{
                    var n=parseInt(value);
                    if(isNaN(n)){
                        return typeof defaultValue=="number"?defaultValue:0;
                    }else{
                        return n;
                    }
                }
            break;

            default:
                return value;
            break;

        }

    }


};


module.exports = paramSanitizer;