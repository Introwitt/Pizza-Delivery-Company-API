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
    "stripe" : {
        "publishable": "pk_test_z9deNpcKHvx1EhhWtsCShN6h",
        "secret": "sk_test_q6yHeiLS4PAg6pP3zffiKn2o"
    },
    "mailgun" : {
        "from" : "sandbox4494b3e8468445cd81f94823537b614e.mailgun.org",
        "apiKey" : "b46e35acb54490bb543891df70bed586-3b1f59cf-1ca84da3"        
    },
    "templateGlobals" : {
        "appName"     : "Pizza-Delivery",
        "companyName" : "KBROS, Inc",
        "yearCreated" : "2018",
        "baseUrl"     : "http://localhost:5000/"
    }
}

// Production Environment
environments.production = {
    "httpPort" : 3000,
    "httpsPort" : 3001,
    "envName" : "production",
    "hashingSecret" : "this is also secret key",
    "stripe" : {
        "publishable": "",
        "secret": ""
    },
    "mailgun" : {
        "from" : "",
        "apiKey" : ""        
    },
    "templateGlobals" : {
        "appName"     : "Pizza-Delivery",
        "companyName" : "KBROS, Inc",
        "yearCreated" : "2018",
        "baseUrl"     : "http://localhost:3000/"
    }
}

// Determine which environment was called as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check that the current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == "object" ? environments[currentEnvironment] : environments.staging;

// Export the environment variable
module.exports = environmentToExport;

