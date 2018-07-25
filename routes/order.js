/*
*
* API for Order handlers
*
*/

// Dependencies
var _data   = require("../lib/data");
var helpers = require("../lib/helpers");
var config  = require("../lib/config");
var path    = require("path");
var fs      = require("fs");
var https   = require("https");
var queryString = require("querystring");
var tokenHandlers = require("./tokens");
var cartHandlers  = require("./cart");


// Define Order handlers
var orderHandlers = {};


// Order handler
orderHandlers.order = function(data, callback){
    var acceptableMethods = ["get", "post"];
    if(acceptableMethods.indexOf(data.method)> -1){
        orderHandlers._order[data.method](data, callback);
    } else{
        callback(405);
    }    
}

// Container for the order submethods
orderHandlers._order = {};


// Order - Post
// Required Data - None
// Optional Data - None

orderHandlers._order.post = function(data, callback){

    // Receive the required fields
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;

    if(phone){
        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        tokenHandlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
                // Get the cart items fromthe user
                _data.read("users", phone, function(err, userData){
                    if(!err && userData){
                        // Give the information regarding cart items
                        var cartItems = typeof(userData.cart) == "object" && userData.cart instanceof Array ? userData.cart : false;

                        if(cartItems){
                            cartHandlers.fetchCart(cartItems,function(err, cartData){

                                // Create orderObject for the specified user
                                var orderId = helpers.createRandomString(20);

                                var orderObject = {
                                    "name"        : userData.name,
                                    "phone"       : userData.phone,
                                    "email"       : userData.email,
                                    "orderId"     : orderId,
                                    "items"       : cartData.Items,
                                    "paymentProcessed" : false,
                                    "totalAmount" : helpers.calculateOrderAmount(cartData.Items)                                    
                                }
                                
                                // Process the payment using STRIPE
                                
                                // Configure the request payload
                                var payload = {
                                    "currency"    : "usd",
                                    "amount"      : orderObject.totalAmount,
                                    "description" : "charges for this orderId" ,
                                    "source"      : "tok_visa"
                                }

                                var stringPayload = queryString.stringify(payload);
                                
                                // Configure the request details
                                var requestDetails = {
                                    "protocol" : "https:",
                                    "hostname" : "api.stripe.com",
                                    "method"   : "POST",
                                    "port"     : 443,
                                    "path"     : "/v1/charges",
                                    "headers"  : {
                                        "Content-Type"  :"application/x-www-form-urlencoded",
                                        "Content-Length": Buffer.byteLength(stringPayload),
                                        "Authorization" : "Bearer "+ config.stripe.secret
                                    }
                                }

                                // Instantiate the request object
                                var req = https.request(requestDetails,function(res){
                                    // Grab the status of the sent request
                                    var status =  res.statusCode;
                                    // Callback successfully if the request went through
                                    if(status == 200 || status == 201){

                                        // Set the payment status
                                        orderObject.paymentProcessed = true;
                                        // Save the object
                                        _data.create("order", orderId, orderObject, function  (err){
                                            if(!err){
                                                callback(200,orderObject);
                                            } else{
                                                callback(500, {"Error" : "Could not create the order"})
                                            }
                                        })
                                    } else {
                                        callback(400,{"Error" : "Transaction failure"});
                                    }
                                });

                                // Bind to the error event so it doesn't get thrown
                                req.on('error',function(e){
                                    callback(e);
                                });
  
                                // Add the payload
                                req.write(stringPayload);
  
                                // End the request
                                req.end();
                            });

                        } else{
                            callback(400,{"Error": "No items in the cart to place order"})
                        }                        
                                                               
                    } else{
                       callback(404,{"Error" : "User not found"}); 
                    }
                })
            } else{
                callback(404, {Error : "Invalid Token or token missing"});
            }
            });                            
    } else{
        callback(400,{"Error" : "Phone no missing or invalid"});
    }
}


// Export the order handler
module.exports = orderHandlers;
