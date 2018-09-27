/*
*
* Primary file for API
*
*/

// Dependencies
var server = require("./lib/server");

// Declare the app object
var app = {};

// Init the function
app.init = function(){
    // Start the server
    server.init();

    // Start the CLI but make sure it lasts
    setTimeout(function(){
        cli.init();
    }, 50)
}

// Execute
app.init();

// Export the app
module.exports = app;
