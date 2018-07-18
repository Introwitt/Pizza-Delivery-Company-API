/*
*
* Request handlers
*
*/

// Dependencies
var _data   = require("./data");
var helpers = require("./helpers");
var config  = require("./config");
var path    = require("path");
var fs      = require("fs");

// Define the handlers
var handlers = {};


// Not found Handler
handlers.notFound = function(data, callback){
    callback(404, {"Error" : "Page not found"});
} 

// Users handler
handlers.users = function(data, callback){
    var acceptableMethods = ["get", "post", "put", "delete"];
    if(acceptableMethods.indexOf(data.method)> -1){
        handlers._users[data.method](data, callback);
    } else{
        callback(405);
    }
    
}

// Container for the users submethods
handlers._users = {};

// Users - Post
// Required Data - name, email, phone, password, address
// Optional Data - none
handlers._users.post = function(data, callback){
    // Check that all the details were filled out
    var name = typeof(data.payload.name) == "string" && data.payload.name.trim().length > 0 ?data.payload.name.trim() : false;
    var email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var address = typeof(data.payload.address) == "string" && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
    

    if(name && email && phone && password && address){
        // Make sure the user doesn't exist
        _data.read("users", phone, function(err, data){
            if(err){
                // Hash the password
                var hashedPassword = helpers.hash(password);
                console.log(hashedPassword);

                if(hashedPassword){

                    // Create user object
                    var userObject ={
                        "name"           : name,
                        "email"          : email,
                        "hashedPassword" : hashedPassword,
                        "phone"          : phone,
                        "address"        : address
                    }

                    // Store user data
                    _data.create("users", phone, userObject, function(err){
                        if(!err){
                            callback(200);
                        } else{
                            console.log(err);
                            callback(500,{"Error" : "Couldn't create the new user"});
                        }
                    });

                } else{
                    callback(500, {"Error": "Couldn't hash the user's password"});
                }

                
               
            } else{
                callback(400,{"Error": "User with that phone no already exists"});
            }
        });

    } else{
        callback(400, {"Error": "Missing required fields"});
    }

}

// Users - Get
// Required Data - Phone
// Opptional data - none
handlers._users.get = function(data, callback){
    // Check if the phone no is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;

    if(phone){
       // Get the token from the users
       var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

       // Verify that the token received is valid for the user
       handlers._tokens.verifyToken(token, phone, function(isValidToken){
          if(isValidToken){
              // Lookup the user
            _data.read("users", phone, function(err, data){
                if(!err && data){
                 // Remove the hashed password from user object before sending to the requestor
                 delete data.hashedPassword;
                 callback(200, data);
                } else{
                    callback(404, {Error : "Not found"});
                }
            });

          } else{
            callback(403,{"Error": "Missing required token in header or token is invalid"});
          }
       })
              
   } else{
       callback(400, {Error : "Missing required field"});
   }
}

// Users - Put
// Required Data - phone
// Optional data - firstName, lastName, password (atleast one)
handlers._users.put = function(data, callback){

    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var name = typeof(data.payload.name) == "string" && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
    var email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var address = typeof(data.payload.address) == "string" && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;


    if(phone){
        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        handlers._tokens.verifyToken(token, phone, function(isValidToken){
        if(isValidToken){
            if(name || email || password || address){

                // Lookup the user
                _data.read("users", phone, function(err, userData){
                    if(!err && userData){
                        if(name){
                            userData.name = name;
                        }
    
                        if(email){
                            userData.email = email;
                        }
    
                        if(password){
                            userData.hashedPassword = helpers.hash(password);
                        }

                        if(address){
                            userData.address = helpers.hash(address);
                        }

                        // Update the user 
                        _data.update("users", phone, userData, function(err){
                            if(!err){
                                callback(200);
                            } else{
                                console.log(err);
                                callback(500,{"Error" : "Couldn't update users' data"});
                            }
                        })
    
                    } else{
                        callback(400, {"Error" : "User not found"});
                    }
                })
            } else{
                callback(400, {"Error": "Missing required field"});
            }

        } else{
            callback(403,{"Error": "Missing required token in header or token is invalid"});
        }
    });

       
    } else{
        callback(400, {"Error" : "Missing required field"});
    }

}

// Users - Delete
// Required Data - phone
// Optional Data - none
handlers._users.delete = function(data, callback){

    // Check if the phone no is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone){

        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        handlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
                // Lookup the user
                _data.read('users',phone,function(err,data){
                if(!err && data){
                    _data.delete('users',phone,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            callback(500,{'Error' : 'Could not delete the specified user'});
                        }
                    });
                } else {
                    callback(400,{'Error' : 'Could not find the specified user.'});
                }
            });
            } else{
                callback(403,{'Error': 'Missing required token in header or token is invalid'});
            }
        });       
        } else {
            callback(400,{'Error' : 'Missing required field'})
        }
    };
    

// Tokens handlers
handlers.tokens = function(data, callback){
    var acceptableMethods = ["get", "post", "put", "delete"];
    if(acceptableMethods.indexOf(data.method)> -1){
        handlers._tokens[data.method](data, callback);
    } else{
        callback(405);
    }
}

// Container for the tokens submethods
handlers._tokens = {};

// Tokens - Post
// Required Data - phone, password
// Optional Data - none
handlers._tokens.post = function(data, callback){
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
                            callback(500, {Error: "Couldn't create the token for the user"});
                        }
                    })
                } else{
                    callback(400,{Error:"Password did not match the specified users' stored password"});
                }

            } else{
                callback(400,{Error:"Couldn't find the user with the specified phone no"});
            }
        })

    } else{
        callback(400,{Error : "Missing required fields"});
    }
}

// Tokens - Get
// Required Data - token-id
// Optional data - none
handlers._tokens.get = function(data, callback){
    // Check if the phone no is valid
   var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

   if(id){
       // Lookup the user
       _data.read("tokens", id, function(err, tokenData){
           if(!err && tokenData){
            callback(200, tokenData);
           } else{
               callback(404, {Error : "Not found"});
           }
       })
   } else{
       callback(400, {Error : "Missing required field"});
   }

}


// Tokens - Put
// Required Data - token-id, extend
// Optional data - none

handlers._tokens.put = function(data, callback){
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
                       callback(400,{Error:"The token has already expired, and can't be extended"});
                   }
                    
                    // Update the token

                    _data.update("tokens", id, tokenData, function(err){
                        if(!err){
                            callback(200);
                        } else{
                            console.log(err);
                            callback(500,{Error : "Couldn't extend tokens' expiration"});
                        }
                    })

                } else{
                    callback(400, {Error : "Token not found"});
                }
            })
        } else{
            callback(400, {Error: "Missing required field"});
        }
}


// Token - Delete
// Required Data - id
// Optional Data - none
handlers._tokens.delete = function(data, callback){
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
                    callback(500, {Error: "Couldn't delete the specified token"});
                }
            });
        } else{
            callback(400,{Error: "could not find the specified token"});
        }
    });
           
   } else{
       callback(400, {Error : "Missing required field"});
   }

}


// Check if the given token id is valid for a given user
handlers._tokens.verifyToken= function(token, phone, callback){
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

// Menu handler
handlers.menu = function(data, callback){
    // Check if the phone no is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;

    if(phone){
        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        handlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
                if(data.method == "get"){
                    // Lookup the menu file
                    var baseDir = path.join(__dirname, "../.data/")
                    fs.readFile(baseDir + "menu" + "/" + "menu" + ".txt", "utf8", function(err,data){
                        if(!err && data){
                            callback(false, data, "plain");
                        } else{
                            callback(err,data);
                        }
                });               
            } else{
                callback(404, {Error : "Not found"});
            }
        } else{
            callback(403,{"Error": "Missing required token in header or token is invalid"});
        }
    })
              
    } else{
        callback(400, {Error : "Missing required field"});
    }
}
    

// Export the handlers
module.exports = handlers;


