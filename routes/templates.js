/*
*
* API for Template handlers
*
*/

// Dependencies
var _data   = require("../lib/data");
var helpers = require("../lib/helpers");
var config  = require("../lib/config");
var path    = require("path");
var fs      = require("fs");
var tokenHandlers = require("./tokens")


// Define template handlers
var templateHandlers = {};

// Index Handler
templateHandlers.index = function(data, callback){

    // Reject the request that isn't GET
    if(data.method == "get"){

        // Prepare data for interpolation
        var templateData = {
            "head.title"       : "Pizza-Delivery - Made Fast",
            "head.description" : "We deal with all kinds of pizzas with exclusive discounts and taste you have never experienced before...",
            "body.class"       : "index"

        };

        // Read in a template as a string
        helpers.getTemplate("index",templateData, function(err, str){
            if(!err && str){
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        callback(200, str, "html");
                    } else{
                        callback(500, undefined, "html");
                    }
                });
                             
            } else{
                callback(500, undefined, "html"); 
            }
        });
    } else{
        callback(405, undefined, "html");
    }
}

// Create Account
templateHandlers.accountCreate = function(data, callback){

    // Reject the request that isn't GET
    if(data.method == "get"){

        // Prepare data for interpolation
        var templateData = {
            "head.title"       : "Create an Account",
            "head.description" : "Signup is easy and only take few seconds",
            "body.class"       : "accountCreate"

        };

        // Read in a template as a string
        helpers.getTemplate("accountCreate",templateData, function(err, str){
            if(!err && str){
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        callback(200, str, "html");
                    } else{
                        callback(500, undefined, "html");
                    }
                });
                             
            } else{
                callback(500, undefined, "html"); 
            }
        });
    } else{
        callback(405, undefined, "html");
    }
}


// Create Session
templateHandlers.sessionCreate = function(data, callback){

    // Reject the request that isn't GET
    if(data.method == "get"){

        // Prepare data for interpolation
        var templateData = {
            "head.title"       : "Logged In",
            "head.description" : "Login easily",
            "body.class"       : "sessionCreate"

        };

        // Read in a template as a string
        helpers.getTemplate("sessionCreate",templateData, function(err, str){
            if(!err && str){
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        callback(200, str, "html");
                    } else{
                        callback(500, undefined, "html");
                    }
                });
                             
            } else{
                callback(500, undefined, "html"); 
            }
        });
    } else{
        callback(405, undefined, "html");
    }

}


// Delete Session
templateHandlers.sessionDeleted = function(data, callback){

    // Reject the request that isn't GET
    if(data.method == "get"){

        // Prepare data for interpolation
        var templateData = {
            "head.title"       : "Logged Out",
            "head.description" : "You have been logged out of you account",
            "body.class"       : "sessionDeleted"

        };

        // Read in a template as a string
        helpers.getTemplate("sessionDeleted",templateData, function(err, str){
            if(!err && str){
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        callback(200, str, "html");
                    } else{
                        callback(500, undefined, "html");
                    }
                });
                             
            } else{
                callback(500, undefined, "html"); 
            }
        });
    } else{
        callback(405, undefined, "html");
    }
}

// Edit Account
templateHandlers.accountEdit = function(data, callback){

    // Reject the request that isn't GET
    if(data.method == "get"){

        // Prepare data for interpolation
        var templateData = {
            "head.title"       : "Account Settings",
            "body.class"       : "accountEdit"
        };

        // Read in a template as a string
        helpers.getTemplate("accountEdit",templateData, function(err, str){
            if(!err && str){
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        callback(200, str, "html");
                    } else{
                        callback(500, undefined, "html");
                    }
                });
                             
            } else{
                callback(500, undefined, "html"); 
            }
        });
    } else{
        callback(405, undefined, "html");
    }
}

// Delete Account
templateHandlers.accountDeleted = function(data, callback){

    // Reject the request that isn't GET
    if(data.method == "get"){

        // Prepare data for interpolation
        var templateData = {
            "head.title"       : "Account Deleted",
            "head.description" : "Your account has been deleted",
            "body.class"       : "accountDeleted"

        };

        // Read in a template as a string
        helpers.getTemplate("accountDeleted",templateData, function(err, str){
            if(!err && str){
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        callback(200, str, "html");
                    } else{
                        callback(500, undefined, "html");
                    }
                });
                             
            } else{
                callback(500, undefined, "html"); 
            }
        });
    } else{
        callback(405, undefined, "html");
    }
}


// Menu
templateHandlers.menu = function(data, callback){

    // Reject the request that isn't GET
    if(data.method == "get"){

        // Prepare data for interpolation
        var templateData = {
            "head.title"       : "Menu",
            "head.description" : "Choose your favourite Pizza",
            "body.class"       : "menu"

        };

        // Read in a template as a string
        helpers.getTemplate("menu",templateData, function(err, str){
            if(!err && str){
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        callback(200, str, "html");
                    } else{
                        callback(500, undefined, "html");
                    }
                });
                             
            } else{
                callback(500, undefined, "html"); 
            }
        });
    } else{
        callback(405, undefined, "html");
    }
}




// Favicon
templateHandlers.favicon = function(data, callback){
    // Reject the request that isn't GET
    if(data.method == "get"){
        // Read in the favicon's data
        helpers.getStaticAsset("favicon.ico", function(err, data){
            if(!err && data){
                callback(200, data, 'favicon');
            } else{
                callback(500);
            }
        })
    } else{
        callback(405);
    }
}


// Public Assets
templateHandlers.public = function(data, callback){
    // Reject the request that isn't GET
    if(data.method == "get"){
        // Get the filename being requested
        var trimmedAssetName = data.path.replace("public/", "").trim();
        if(trimmedAssetName.length > 0){
            // Read the asset's data
            helpers.getStaticAsset(trimmedAssetName, function(err, data){
                if(!err && data){
                    // Determine the content-type (default to plain-text)
                    var contentType = "plain";

                    if(trimmedAssetName.indexOf(".css")> -1){
                        contentType = "css";
                    }

                    if(trimmedAssetName.indexOf(".jpg")> -1){
                        contentType = "jpg";
                    }

                    if(trimmedAssetName.indexOf(".png")> -1){
                        contentType = "png";
                    }

                    if(trimmedAssetName.indexOf(".ico")> -1){
                        contentType = "favicon";
                    }

                    // Callback the data
                    callback(200, data, contentType);
                } else{
                    callback(404);
                }
            })
        } else{
            callback(404);
        }
       
       
    } else{
        callback(405);
    }
}



// Export the template
module.exports = templateHandlers;
