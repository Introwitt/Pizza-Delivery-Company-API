/*
*
* Helper functions
*
*/

// Dependencies
var config      = require("./config");
var crypto      = require("crypto");
var https       = require("https");
var querystring = require("querystring");
var path        = require("path");
var fs          = require("fs");


// Container for all the helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str)== "string" && str.length> 0){
        var hash = crypto.createHmac("sha256",config.hashingSecret).update(str).digest("hex");
        return hash;
    } else{
        return false;
    }
}

// Parse JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    } catch(e){
        return {};
    }
};

// Create TokenId
helpers.createRandomString= function(strlength){
    var strlength = typeof(strlength) == "number" && strlength > 0 ? strlength : false;
    if(strlength){
        // Define all the possible characters that can go into a string
        var possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

        // Start the final string
        var string = "";

        for(i=1; i<=strlength; i++){
            // Get a random character from the possible characters
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            // Append the result to final string
            string+= randomCharacter;
        }

        return string;

    } else{
        return false;
    }
}



    
// Export the module
module.exports = helpers;


