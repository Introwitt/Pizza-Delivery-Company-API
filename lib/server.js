/*
*
* Server related work
*
*/

// Dependencies
var http = require("http");
var https = require("https");
var url  = require("url");
var stringDecoder = require("string_decoder").StringDecoder;
var config = require("./config");
var fs = require("fs");
var path = require("path");
var helpers = require("./helpers");
var userHandlers = require("../routes/users");
var tokenHandlers = require("../routes/tokens");
var itemHandlers = require("../routes/items");
var menuHandlers = require("../routes/menu");
var cartHandlers = require("../routes/cart");
var orderHandlers = require("../routes/order");



// Instantiate the Server module
var server = {};


// Instantiate http server 
server.httpServer = http.createServer(function(req,res){
    server.unifiedServer(req,res);
});


// Define https server options
server.httpsServerOptions = {
    "key" : fs.readFileSync(path.join(__dirname, "../https/key.pem" )),
    "cert" : fs.readFileSync(path.join(__dirname, "../https/cert.pem"))
};

// Instantiate the https server 
server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
    server.unifiedServer(req,res);
});

// All the server logic for both http and https
server.unifiedServer = function(req,res){
    
    // Parse the url
    var parsedUrl = url.parse(req.url,true);

    
    // Get the Pathname
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
 
 
    // Get the HTTP Method
    var method = req.method.toLowerCase();
 
    // Get the queryString as object
    var queryStringObject = parsedUrl.query;
 
    // Get the headers as object
    var headers = req.headers;
 
    // Get the Payloads,if any
    var decoder = new stringDecoder("utf-8");
    var buffer = '';
 
    req.on("data",function(data){
        buffer += decoder.write(data);
    });
 
    req.on("end",function(){
        buffer += decoder.end();
   

      
    // Choose the handler to route the request to
    var chosenHandler = typeof(server.router[trimmedPath]) !== "undefined" ? server.router[trimmedPath] : handlers.notFound;
    

    // Construct the data object to be sent to the handler
    var data = {
        "path" : trimmedPath,
        "queryStringObject" : queryStringObject,
        "method" : method,
        "headers" : headers,
        "payload" : helpers.parseJsonToObject(buffer)
    }
    
    // Route the request to the specified handler in the router
    chosenHandler(data, function(statusCode, payload, contentType){
        // Use the statusCode called back by handler or default statusCode if not any
        var statusCode = typeof(statusCode) == "number" ? statusCode : 200;
        
        // Determine the type of response (fallback to json)
        var contentType = typeof(contentType) == "string" ? contentType : "json";
 
        // Return the response parts that are content specific
        var payloadString = "";
        if(contentType == "json"){
            res.setHeader("Content-Type","application/json");
              
            // Use the payload called back by handler or default payload if not any
            var payload = typeof(payload) == "object" ? payload : {};
  
            // Convert the payload object into string
            var payloadString = JSON.stringify(payload);
            
        }

        if(contentType == "plain"){
            res.setHeader("Content-Type","text/plain");
            payloadString = typeof(payload) !== "undefined" ? payload : "";
        }

        // Return the response parts that are common to all content-types
        res.writeHead(statusCode);
        res.end(payloadString);
        
        
 
        // If the response is 200, press green otherwise red
        if(statusCode == 200){
            console.log("\x1b[32m%s\x1b[0m", method.toUpperCase() + " /" + trimmedPath + " " + statusCode);
        }
        else{
            console.log("\x1b[31m%s\x1b[0m", method.toUpperCase() + " /" + trimmedPath + " " + statusCode);
        }             
        });    
    });
}


// Define routers
server.router = {
    "api/users"        : userHandlers.users,
    "api/tokens"       : tokenHandlers.tokens,
    "api/items"        : itemHandlers.items,
    "api/menu"         : menuHandlers.menu,
    "api/cart"         : cartHandlers.cart,
    "api/order"        : orderHandlers.order
}

// Init Script
server.init = function(){

    //Start the http server
    server.httpServer.listen(config.httpPort, function(){
        console.log("\x1b[36m%s\x1b[0m","The server is listening on port " +config.httpPort+ " now in " +config.envName+ " mode" );
    });

    //Start the https server
    server.httpsServer.listen(config.httpsPort, function(){
        console.log("\x1b[35m%s\x1b[0m", "The server is listening on port " +config.httpsPort+ " now in " +config.envName+ " mode" );
    });
}

// Define the handlers
var handlers = {};


// Not found Handler
handlers.notFound = function(data, callback){
    callback(404, {"Error" : "Page not found"});
} 


// Export the Server
module.exports = server;
