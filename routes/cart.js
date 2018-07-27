/*
*
* API for Cart handlers
*
*/

// Dependencies
var _data   = require("../lib/data");
var helpers = require("../lib/helpers");
var config  = require("../lib/config");
var path    = require("path");
var fs      = require("fs");
var tokenHandlers = require("./tokens");


// Define cart handlers
var cartHandlers = {};

// Cart handler
cartHandlers.cart = function(data, callback){
    var acceptableMethods = ["get", "post", "put", "delete"];
    if(acceptableMethods.indexOf(data.method)> -1){
        cartHandlers._cart[data.method](data, callback);
    } else{
        callback(405);
    }    
}

// Container for the cart submethods
cartHandlers._cart = {};

// Cart - Post
// Required Data - item id, size
// Optional Data - crust

cartHandlers._cart.post = function(data, callback){
    
    // Receive the required fields
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;
    var itemId = typeof(data.payload.itemId) == "string" && data.payload.itemId.trim().length > 0 ? data.payload.itemId.trim() : false;
    var size = typeof(data.payload.size) == "string" && ["small","regular", "large"].indexOf(data.payload.size.toLowerCase()) > -1 ? data.payload.size : false;
    var crust = typeof(data.payload.crust) == "string" && ["wheat thin crust","cheese burst"].indexOf(data.payload.crust.toLowerCase()) > -1 ? data.payload.crust.toLowerCase() : "new hand tossed";

    
    if(phone && itemId && size && crust){
        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        tokenHandlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
                // Read the user's data
                _data.read("users", phone, function(err, userData){
                    if(!err && userData){
                        var userCart = typeof(userData.cart) == "object" && userData.cart instanceof Array ? userData.cart : [];

                        // Read the item from the item's data
                        _data.read("items", itemId, function(err, itemData){
                        if(!err && itemData){

                            // Create the cart object
                            var cartId = helpers.createRandomString(20);
                            var cartObject ={
                                "email"       : userData.email,
                                "phone"       : userData.phone,
                                "name"        : itemData.name,
                                "cartId"      : cartId,
                                "itemId"      : itemData.id,  
                                "size"        : size,
                                "crust"       : crust,
                                "amount"      : helpers.calculateCartAmount(itemData.price[size],crust)
                            }                           

                            // Save the object
                            _data.create("cart", cartId, cartObject, function(err){
                                if(!err){
                                    // Add the cartId to the users' object
                                    userData.cart = userCart;
                                    userData.cart.push(cartId);

                                    // Save the new user data
                                    _data.update("users", phone, userData, function(err){
                                        if(!err){
                                            // Return the data about the new checkObject
                                            callback(200, cartObject);
                                        } else{
                                            callback(500, {"Error" : "Couldn't update the  specified users' data for new cart item"});
                                        }
                                    })
                                } else{
                                    callback(500, {"Error" : "Couldn't add the item to the specified users' cart"});
                                }         
                            })
                        } else{
                            callback(404, {"Error" : "Item Id not found"})
                        }
                    });
                
                    } else{
                        callback(404,{"Error" : "User not found"});
                    } 
                })
                    
            } else{
                callback(403, {"Error" : "Unauthorized Access"});
            }
        })       
    } else{
        callback(400, {"Error" : "Required fields missing or they were invalid"});
    }    
}


// Cart - Get
// Required Data - phone, tokenId
// Opptional data - none
cartHandlers._cart.get = function(data, callback){

   // Receive the phone no
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;

    if(phone){
        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
        
        // Verify that the token received is valid for the user
            tokenHandlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
                // Lookup the user 
                _data.read("users", phone, function(err, userData){
                    if(!err && userData){
                        // Give the information regarding cart items
                        var cartItems = typeof(userData.cart) == "object" && userData.cart instanceof Array ? userData.cart : false;
                       
                        cartHandlers.fetchCart(cartItems,function(err, cartData){
                           callback(err, cartData);
                        })
                                                               
                    } else{
                       callback(404,{"Error" : "User not found"}); 
                    }
                })
                } else{
                    callback(403, {"Error" : "Unauthorized Access"});
                }
            });

        } else{
               callback(400, {"Error" : "Required fields missing or they were invalid"});
        }
}


// Cart - Put
// Required Data - phone
// Optional data - size, crust (atleast one)
cartHandlers._cart.put = function(data, callback){

    // Required data
    var cartId = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim(): false;

    // Optional data
    var size = typeof(data.payload.size) == "string" && ["small","regular", "large"].indexOf(data.payload.size.toLowerCase()) > -1 ? data.payload.size : false;
    var crust = typeof(data.payload.crust) == "string" && ["wheat thin crust","cheese burst"].indexOf(data.payload.crust.toLowerCase()) > -1 ? data.payload.crust.toLowerCase() : "new hand tossed";


    if(cartId){
        // Look up the cart
        _data.read("cart", cartId, function(err, cartData){
            // Get the token from the users
            var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

            // Verify that the token received is valid for the user
            tokenHandlers._tokens.verifyToken(token, cartData.phone, function(isValidToken){
            if(isValidToken){
                if(size || crust){   
                    if(size){
                        cartData.size = size;
                    }
            
                    if(crust){
                        cartData.crust = crust;
                    }

                    // Update the total amount of cart
                    _data.read("items", cartData.itemId, function(err, itemData){
                        if(!err && itemData){
                            cartData.amount = helpers.calculateAmount(itemData.price[cartData.size],cartData.crust);
                            // Update the cart 
                            _data.update("cart", cartId, cartData, function(err){
                                if(!err){
                                    callback(200);
                                } else{
                                    callback(500,{"Error" : "Couldn't update users' data"});
                                }
                            })
                              
                        } else{
                            callback(500, {"Error": "Couln't update the cart data"});
                        }
                    });
                        
                } else{
                    callback(400, {"Error": "Required fields missing or they were invalid"});
                }
                                      
            } else{
                callback(403, {"Error": "Unauthorized Access"});
            }
            })
        })    
    } else{
        callback(400,{"Error": "Required fields missing or they were invalid"});
    }
}


// Cart - Delete
// Required Data - cartId
// Optional Data - none
cartHandlers._cart.delete = function(data, callback){

    // Check if the cartId is valid
    var cartId = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if(cartId){
        // Look up the cart for the user

        _data.read("cart", cartId, function(err, cartData){
            if(!err && cartData){

                // Get the token from the users
                var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

                // Verify that the token received is valid for the user
                tokenHandlers._tokens.verifyToken(token, cartData.phone, function(isValidToken){
                if(isValidToken){
                    // Delete the given cart
                    _data.delete("cart", cartId, function(err){
                        if(!err){
                            // Look up the user and remove the cart from user cartObject
                            _data.read("users", cartData.phone, function(err, userData){
                                if(!err && userData){
                                    var userCart = typeof(userData.cart) == "object" && userData.cart instanceof Array ? userData.cart : [];
                                    // Remove the given cart from the user
                                    var cartPosition = userCart.indexOf(cartId);
                                    if(cartPosition > -1){
                                        userCart = userCart.splice(cartPosition,1);
                                        // Re-save the userData
                                        _data.update("users", cartData.phone, userData, function(err){
                                            if(!err){
                                                callback(200);
                                            } else{
                                                callback(500, {"Error": "Couldn't update the users' data"});
                                            }
                                        })

                                    } else{
                                        callback(404, {"Error" : "Cart not present with the specified user"});
                                    }
                                } else{
                                    callback(500,{"Error" : "Could not find the user for the given cart"})
                                }
                            })

                        } else{
                            callback(500,{"Error" : "Couldn't delete the cart for the given user"})
                        }
                    })
                     
                } else{
                    callback(403,{"Error" : "Unauthorized Access"});
                }
            });
        } else{
            callback(404,{"Error": "Cart not found"});
        }
    });

    } else{
        callback(400, {"Error" : "The given cartId is invalid"})
    }
}


// Handler to fetch the cart items
cartHandlers.fetchCart = function(cartItems, callback){
    var data =[];
    var length = cartItems.length;
    if(length == undefined){
        callback(404, {"Error" : "Cart is empty"});
    }
    for(i=0; i<length; i++){
        _data.read("cart", cartItems[i], function(err, cartData){
            var email = cartData.email;
            var phone = cartData.phone;

            // Remove the cart id,item id,name,email before displaying to the user
            delete cartData.cartId;
            delete cartData.itemId;
            delete cartData.email;
            delete cartData.phone;

            data.push(cartData);
            if(data.length == cartItems.length){
                callback(200,
                    {"Email": email,
                    "Phone" : phone,
                    "Items": data});
            }
        })
    }
}


// Export the handlers
module.exports = cartHandlers;
