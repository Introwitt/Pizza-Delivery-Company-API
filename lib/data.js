/*
*
* Library for storing and reading data
*
*/

// Dependencies
var fs = require("fs");
var path = require("path");
var helpers = require("./helpers");

// Container for the module (to be exported)
var lib = {};

// Base directory for the data folder
lib.baseDir = path.join(__dirname, "/../.data/");


// Write data to a file
lib.create = function(dir,file,data,callback){
    // Open the file for writing
    fs.open(lib.baseDir + dir + "/" + file + ".json", "wx", function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to a string
            var stringData = JSON.stringify(data);
            // Write data to the file
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        } else{
                            callback("Error closing new file")
                        }
                    })
                } else{
                    callback("Error writing to new file");
                }
            })
        } else{
            callback("Couldn't create the new file as it may already exist");
        }
    }) 
}

// Read data to a file
lib.read = function(dir, file, callback){
    fs.readFile(lib.baseDir + dir + "/" + file + ".json", "utf8", function(err,data){
        if(!err && data){
            var parsedData = helpers.parseJsonToObject(data);
            callback(false,parsedData);
        } else{
            callback(err,data);
        }
        
    });
}

// Update data inside a file
lib.update = function(dir, file, data, callback){
    // Open the existing file to update
    fs.open(lib.baseDir + dir + "/" + file + ".json", "r+", function(err, fileDescriptor){
        if(!err && fileDescriptor){
            // Convert the data to string
            var stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(fileDescriptor, function(err){
                if(!err){
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false);
                                } else{
                                    callback("Couldn't close the existing file");
                                }
                            })
                        } else{
                            callback("Couldn't write to the existing file");
                        }
                    });
                } else{
                    callback("Couldn't truncate the existing file");
                }
            })
        } else{
            callback("Couldn't open the file, it may not exist");
        }
    });
}

// Delete a file
lib.delete = function(dir, file, callback){
    // Unlink the file
    fs.unlink(lib.baseDir + dir + "/" + file + ".json", function(err){
        if(!err){
            callback(false);
        } else{
            callback("Error deleting the file");
        }
    });
}

// List all the files in a directory
lib.list = function(dir, callback){
    // List the files
    fs.readdir(lib.baseDir + dir + "/", function(err, data){
        if(!err && data && data.length > 0){
            var trimmedFileName = [];
            data.forEach(function(fileName){
                trimmedFileName.push(fileName.replace(".json", ""));
            });
            callback(false, trimmedFileName);
        } else{
            callback(err, data);
        }
    })
}






// Export the module
module.exports = lib;