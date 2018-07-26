/*
*
* API for Token handlers
*
*/

// Dependencies
var _data   = require("../lib/data");
var helpers = require("../lib/helpers");
var config  = require("../lib/config");
var path    = require("path");
var fs      = require("fs");

// Define token handlers
var tokenHandlers = {};

// Tokens handlers
tokenHandlers.tokens = function(data, callback){
    var acceptableMethods = ["get", "post", "put", "delete"];
    if(acceptableMethods.indexOf(data.method)> -1){
        tokenHandlers._tokens[data.method](data, callback);
    } else{
        callback(405);
    }
}

// Container for the tokens submethods
tokenHandlers._tokens = {};

// Tokens - Post
// Required Data - phone, password
// Optional Data - none
tokenHandlers._tokens.post = function(data, callback){
    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){
        // Look upto the user
        _data.read("users", phone, function(err, userData){
            if(!err && userData){
                // Check that the password entered is same as that of user password
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // if valid, create a new token with a random name, set Expiration 1 hour from the time of creation
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000*60*60;
                    var tokenObject ={
                        "phone" : phone,
                        "id"    : tokenId,
                        "expires" : expires
                    }

                    // Store the token
                    _data.create("tokens", tokenId, tokenObject, function(err, data){
                        if(!err){
                            callback(200, tokenObject);
                        } else{
                            callback(500, {"Error": "Couldn't create the token for the user"});
                        }
                    })
                } else{
                    callback(400,{"Error":"Invalid password"});
                }

            } else{
                callback(404,{"Error":"User not found"});
            }
        })

    } else{
        callback(400,{"Error" : "Required fields missing or they were invalid"});
    }
}

// Tokens - Get
// Required Data - token-id
// Optional data - none
tokenHandlers._tokens.get = function(data, callback){

    // Check if the phone no is valid
   var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

   if(id){
       // Lookup the user
       _data.read("tokens", id, function(err, tokenData){
           if(!err && tokenData){
            callback(200, tokenData);
           } else{
               callback(404, {"Error" : "Token not found"});
           }
       })
   } else{
       callback(400, {"Error" : "Invalid phone no"});
   }

}


// Tokens - Put
// Required Data - token-id, extend
// Optional data - none

tokenHandlers._tokens.put = function(data, callback){
    var id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend  = typeof(data.payload.extend) == "boolean" && data.payload.extend == true ? true : false;

    if(id && extend){
            // Lookup the user
            _data.read("tokens", id, function(err, tokenData){
                if(!err && tokenData){
                   // Check if the token is already expired
                   if(tokenData.expires > Date.now()){
                       // Extend the token session by 1 hour
                       tokenData.expires= Date.now() + 1000*60*60;

                   } else{
                       callback(400,{"Error":"Token has already expired, and can't be extended"});
                   }
                    
                    // Update the token
                    _data.update("tokens", id, tokenData, function(err){
                        if(!err){
                            callback(200);
                        } else{
                            console.log(err);
                            callback(500,{"Error" : "Couldn't extend tokens' expiration"});
                        }
                    })

                } else{
                    callback(404, {"Error" : "Token not found"});
                }
            })
        } else{
            callback(400, {"Error": "Required fields missing or they were invalid"});
        }
}


// Token - Delete
// Required Data - id
// Optional Data - none
tokenHandlers._tokens.delete = function(data, callback){
    // Check if the token is valid
    var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if(id){
       // Lookup the user
       _data.read("tokens", id, function(err, data){
           if(!err && data){
            // Remove the token
            _data.delete("tokens", id, function(err){
                if(!err){
                    callback(200);
                } else{
                    callback(500, {"Error": "Couldn't delete the specified token"});
                }
            });
        } else{
            callback(404,{"Error": "Token not found"});
        }
    });
           
    } else{
       callback(400, {"Error" : "Required fields missing or they were invalid"});
    }
}


// Check if the given token id is valid for a given user
tokenHandlers._tokens.verifyToken= function(token, phone, callback){
    _data.read("tokens", token, function(err, tokenData){
        if(!err && tokenData){
            if(phone== tokenData.phone && tokenData.expires>Date.now()){
                callback(true);
            } else{
                callback(false);
            }

        } else{
            callback(false);

        }
    });
}


// Export the handlers
module.exports = tokenHandlers;