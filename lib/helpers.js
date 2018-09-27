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

// Calculate the amount of an item in the cart
helpers.calculateCartAmount = function(size, crust){
    var amount = size;
    if(crust == "wheat thin crust"){
        amount += 50;
    }
    if(crust == "cheese burst"){
        amount += 199;
    }
    return amount;    
}

// Calculate the total amount of all the items in the cart
helpers.calculateOrderAmount = function(cartItems){
    var totalAmount = 0;
    cartItems.forEach(function(cartItem){
        totalAmount += cartItem.amount;
    })
    return totalAmount;
}

// Get the string content of a template
helpers.getTemplate = function(templateName, data, callback){

    templateName = typeof(templateName) == "string" &&templateName.length > 0 ? templateName : false;
    data = typeof(data) == "object" && data != null ? data : {};

    // console.log(data);

    if(templateName){
        var templatesDir = path.join(__dirname, "/../templates/");
        fs.readFile(templatesDir + templateName + ".html", "utf8", function(err, str){
            if(!err && str && str.length >0){
                // Do the string interpolation
                var finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else{
                callback("No template could be found");
            }
        })
    } else{
        callback("A valid template name was not specified");
    }
}

// Add the universal header and footer to the string and pass the data object to interpolate
helpers.addUniversalTemplates = function(str, data, callback){
    str = typeof(str) == "string" && str.length > 0 ? str : "";
    data = typeof(data) == "object" && data != null ? data : {};

    // Get the header
    helpers.getTemplate("_header", data, function(err, headerString){
        if(!err && headerString){
            // Get the footer
            helpers.getTemplate("_footer", data, function(err, footerString){
                if(!err && footerString){
                    var fullString = headerString + str + footerString;
                    callback(false, fullString); 
                } else{
                    callback("Could not find the header template");
                }
            })
        } else{
            callback("Could not find the header template");
        }
    })
} 

helpers.interpolate = function(str,data){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ?data : {};
  
    // Add the templateGlobals to the data object, prepending their key name with "global."
    for(var keyName in config.templateGlobals){
       if(config.templateGlobals.hasOwnProperty(keyName)){
         data['global.'+keyName] = config.templateGlobals[keyName]
       }
    }
   
    // For each key in the data object, insert its value into the string at the corresponding placeholder
    for(var key in data){
       if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
          var replace = data[key];
          var find = '{'+key+'}';
          str = str.replace(find,replace);
         
       }
    }
    return str;
  };

// Get the contents of public asset
helpers.getStaticAsset = function(filename, callback){
    filename = typeof(filename) == "string" && filename.length > 0 ? filename : false;
    if(filename){
        var publicDir = path.join("__dirname", "../public/");
        // Read the contents of the file
        fs.readFile(publicDir + filename, function(err, data){
            if(!err && data){
                callback(false, data);
            } else{
                callback("No file could be found");
            }
        })
    
    } else{
        callback("A valid file name was not specified");
    }    
}
    


// Export the module
module.exports = helpers;


