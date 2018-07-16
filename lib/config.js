/*
* Create and export environment variables
*
*/

// Container for all the enviroments

var environments = {};

// Staging(default) Environment
environments.staging ={
    "httpPort" : 5000,
    "httpsPort" : 5001,
    "envName" : "staging",
    "hashingSecret" : "this is a secret key",
}

// Production Environment
environments.production = {
    "httpPort" : 3000,
    "httpsPort" : 3001,
    "envName" : "production",
    "hashingSecret" : "this is also secret key",
}

// Determine which environment was called as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check that the current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == "object" ? environments[currentEnvironment] : environments.staging;

// Export the environment variable
module.exports = environmentToExport;

