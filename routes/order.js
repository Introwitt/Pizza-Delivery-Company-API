/*
*
* API for Order handlers
*
*/

// Dependencies
var _data         = require("../lib/data");
var helpers       = require("../lib/helpers");
var config        = require("../lib/config");
var path          = require("path");
var fs            = require("fs");
var https         = require("https");
var queryString   = require("querystring");
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
                // Get the cart items from the user
                _data.read("users", phone, function(err, userData){
                    if(!err && userData){
                        // Give the information regarding cart items
                        var cartItems = typeof(userData.cart) == "object" && userData.cart instanceof Array ? userData.cart : false;
                      
                        if(cartItems.length !== 0){
                            cartHandlers.fetchCart(cartItems,function(err, cartData){

                                // Create orderObject for the specified user
                                var orderId = helpers.createRandomString(20);

                                var orderObject = {
                                    "name"        : userData.name,
                                    "phone"       : userData.phone,
                                    "email"       : userData.email,
                                    "orderId"     : orderId,
                                    "items"       : cartData.Items,
                                    "cartId"      : cartData.cartId,
                                    "totalAmount" : helpers.calculateOrderAmount(cartData.Items),    
                                    "paymentProcessed" : false                           
                                }
                                
                                // Process the payment using STRIPE
                                
                                // Configure the request payload
                                var stripePayload = {
                                    "currency"    : "usd",
                                    "amount"      : orderObject.totalAmount,
                                    "description" : "charges for this orderId" ,
                                    "source"      : "tok_visa"
                                }

                                var stringStripePayload = queryString.stringify(stripePayload);
                                
                                // Configure the request details
                                var stripeRequestDetails = {
                                    "protocol" : "https:",
                                    "hostname" : "api.stripe.com",
                                    "method"   : "POST",
                                    "port"     : 443,
                                    "path"     : "/v1/charges",
                                    "headers"  : {
                                        "Content-Type"  :"application/x-www-form-urlencoded",
                                        "Content-Length": Buffer.byteLength(stringStripePayload),
                                        "Authorization" : "Bearer "+ config.stripe.secret
                                    }
                                }

                                // Instantiate the request object
                                var stripeReq = https.request(stripeRequestDetails,function(res){
                                    // Grab the status of the sent request
                                    var status =  res.statusCode;
                                    // Callback successfully if the request went through
                                    if(status == 200 || status == 201){

                                        // Set the payment status
                                        orderObject.paymentProcessed = true;
                                        // Save the object
                                        _data.create("order", orderId, orderObject, function  (err){
                                            if(!err){
                                                
                                                // Notify the user using MAILGUN

                                                // Configure the request payload
                                                var mailgunPayload = {
                                                    "from" : config.mailgun.from,
                                                    "to"   : userData.email,
                                                    "subject" : "Payment Info for orderid " + orderId,
                                                    "text"     : "Payment succesfully done for " + orderObject  
                                                }

                                                var stringMailgunPayload = queryString.stringify(mailgunPayload);

                                                // Configure the request details
                                                var mailgunRequestDetails = {
                                                    "protocol" : "https:",
                                                    "hostname" : "api.mailgun.net",
                                                    "path"      : "/v3/sandbox4494b3e8468445cd81f94823537b614e.mailgun.org",
                                                    "port"      : 443,
                                                    "method"    : "POST",
                                                    "headers": {
                                                        "Content-Type": "application/x-www-form-urlencoded",
                                                        "Content-Length": Buffer.byteLength(stringMailgunPayload),
                                                        "auth" : "api:"+ config.mailgun.apiKey
                                                    }
                                                }

                                                // Instantiate the request object
                                                var mailgunReq = https.request(mailgunRequestDetails,function(res){
                                                    // Grab the status of the sent request
                                                    var status =  res.statusCode;
                                                   
                                                    // Callback successfully if the request went through
                                                    if(status == 200 || status == 201){
                                                        // Remove all the cart items
                                                        userData.cart=[];                                      
                                                        // Add the orderId to the users' data
                                                        var userOrders = typeof(userData.orders) == "object" && userData.orders instanceof Array ? userData.orders : [];

                                                        userData.orders = userOrders;
                                                        userData.orders.push(orderId);

                                                        // Save the new user data
                                                        _data.update("users", phone, userData, function(err){
                                                            if(!err){
                                    
                                                                orderObject.totalAmount += " cents";
                                                                callback(200,{"Your Order" : orderObject});
                                                            } else{
                                                                callback(500, {"Error" : "Couldn't update the users' data for new order"});
                                                            }
                                                        })                                                        
                                                    } else{
                                                        callback(500, {"Error": "Could not email the order receipt"})
                                                    }
                                                });

                                                // Bind to the error event so it doesn't get thrown
                                                mailgunReq.on('error',function(e){
                                                    callback(e);
                                                });
  
                                                // Add the payload
                                                mailgunReq.write(stringMailgunPayload);
  
                                                // End the mailgunRequest
                                                mailgunReq.end();

                                            } else{
                                                callback(500, {"Error" : "Could not create the order for the user"})
                                            }
                                        })
                                        
                                    } else {
                                        callback(400,{"Error" : "Transaction failure"});
                                    }
                                });

                                // Bind to the error event so it doesn't get thrown
                                stripeReq.on('error',function(e){
                                    callback(e);
                                });
  
                                // Add the payload
                                stripeReq.write(stringStripePayload);
  
                                // End the stripeRequest
                                stripeReq.end();
                            });

                        } else{
                            callback(404,{"Error": "No items in the cart to place order"})
                        }                        
                                                               
                    } else{
                       callback(404,{"Error" : "User not found"}); 
                    }
                })
            } else{
                callback(403, {"Error" : "Unauthorized Access"});
            }
            });                            
    } else{
        callback(400,{"Error" : "Required fields missing or they were invalid"});
    }
}

// Order - Get
// Required Data - orderId, token
// Optional Data - None

orderHandlers._order.get = function(data, callback){

    // Receive the required fields
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
                        // Give the information regarding orders
                        var orders = typeof(userData.orders) == "object" && userData.orders instanceof Array ? userData.orders : false;
                       
                        orderHandlers.fetchOrders(orders,function(err, orders){
                                callback(err, orders);
                        })
                    } else{
                        callback(404,{"Error" : "User not found"}); 
                    }
                })
            } else{
                callback(403,{"Error" : "Unauthorized Access"});
            }
        })            
    } else{
        callback(400,{"Error" : "Required fields missing or they were invalid"});
    }
}

// Handler to fetch the cart items
orderHandlers.fetchOrders = function(orders, callback){
    var data =[];
    var length = orders.length;
    if(length == undefined || length == 0){
        callback(404, {"Error" : "No items to place order"});
    }
    for(i=0; i<length; i++){
        _data.read("order", orders[i], function(err, orderData){

            orderData.items.forEach(function(order){
                delete order.cartId;
            })
            data.push(orderData.items);
           
            if(data.length == (orders.length)){
                callback(200,{"Your Orders": data});
            }
        })
    }
}
        

// Export the order handler
module.exports = orderHandlers;
