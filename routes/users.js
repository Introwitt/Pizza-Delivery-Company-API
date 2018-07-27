/*
*
* API for User handlers
*
*/

// Dependencies
var _data   = require("../lib/data");
var helpers = require("../lib/helpers");
var config  = require("../lib/config");
var path    = require("path");
var fs      = require("fs");
var tokenHandlers = require("./tokens")

// Define users handlers
var userHandlers = {};

// Users handler
userHandlers.users = function(data, callback){
    var acceptableMethods = ["get", "post", "put", "delete"];
    if(acceptableMethods.indexOf(data.method)> -1){
        userHandlers._users[data.method](data, callback);
    } else{
        callback(405);
    }   
}

// Container for the users submethods
userHandlers._users = {};

// Users - Post
// Required Data - name, email, phone, password, address
// Optional Data - none
userHandlers._users.post = function(data, callback){
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
        callback(400, {"Error": "Required fields missing or they were invalid"});
    }

}

// Users - Get
// Required Data - Phone
// Optional data - none
userHandlers._users.get = function(data, callback){
    // Check if the phone no is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;

    if(phone){
       // Get the token from the users
       var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        tokenHandlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
              // Lookup the user
                _data.read("users", phone, function(err, data){
                if(!err && data){
                // Remove the hashed password from user object before sending to the requestor
                delete data.hashedPassword;
                callback(200, data);
                } else{
                    callback(404, {"Error" : "User not found"});
                }
            });

          } else{
            callback(403,{"Error": "Unauthorized Access(Token missing or invalid)"});
          }
       })
              
   } else{
       callback(400, {"Error" : "Required fields missing or they were invalid"});
   }
}

// Users - Put
// Required Data - phone
// Optional data - firstName, lastName, password (atleast one)
userHandlers._users.put = function(data, callback){

    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    var name = typeof(data.payload.name) == "string" && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
    var email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var address = typeof(data.payload.address) == "string" && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;


    if(phone){
        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        tokenHandlers._tokens.verifyToken(token, phone, function(isValidToken){
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
                        callback(404, {"Error" : "User not found"});
                    }
                })
            } else{
                callback(400, {"Error": "Required fields missing or they were invalid"});
            }

        } else{
            callback(403,{"Error": "Unauthorized Access(Token missing or invalid)"});
        }
    });

       
    } else{
        callback(400, {"Error" : "Required fields missing or they were invalid"});
    }

}

// Users - Delete
// Required Data - phone
// Optional Data - none
userHandlers._users.delete = function(data, callback){

    // Check if the phone no is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone){

        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        tokenHandlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
                // Lookup the user
                _data.read('users',phone,function(err,data){
                if(!err && data){
                    _data.delete('users',phone,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            callback(500,{"Error" : "Couldn't delete the specified user"});
                        }
                    });
                } else {
                    callback(404,{"Error" : "User not found"});
                }
            });
            } else{
                callback(403,{"Error": "Unauthorized Access(Token missing or invalid)"});
            }
        });       
        } else {
            callback(400,{"Error" : 'Required fields missing or they were invalid'})
        }
    };


// Export the handlers
module.exports = userHandlers;
    