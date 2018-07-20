/*
*
* API for Menu handler
*
*/


// Dependencies
var _data   = require("../lib/data");
var helpers = require("../lib/helpers");
var config  = require("../lib/config");
var path    = require("path");
var fs      = require("fs");
var tokenHandlers = require("./tokens")

// Define menu handler
var menuHandlers = {};


// Menu handler
menuHandlers.menu = function(data, callback){
    // Check if the phone no is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;

    if(phone){
        // Get the token from the users
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        // Verify that the token received is valid for the user
        tokenHandlers._tokens.verifyToken(token, phone, function(isValidToken){
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
module.exports = menuHandlers;