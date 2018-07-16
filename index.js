/*
*
* Primary file for API
*
*/

// Dependencies
var server = require("./lib/server");
var workers = require("./lib/workers");
var helpers = require("./lib/helpers");

// Declare the app object
var app = {};

// Init the function
app.init = function(){
    // Start the server
    server.init();
}

// Execute
app.init();

// Export the app
module.exports = app;
