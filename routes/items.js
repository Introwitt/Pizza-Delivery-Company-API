/*
*
* API for User handlers
*
*/

// Dependencies
var _data   = require("../lib/data");
var helpers = require("../lib/helpers");
var config  = require("../lib/config");
var path    = require("path");
var fs      = require("fs");
var tokenHandlers = require("./tokens")

// Define items handlers
var itemHandlers = {};

// Items handlers
itemHandlers.items = function(data, callback){
    var acceptableMethods = ["get", "post", "put", "delete"];
    if(acceptableMethods.indexOf(data.method)> -1){
        itemHandlers._items[data.method](data, callback);
    } else{
        callback(405);
    }
}

// Container for the items submethods
itemHandlers._items = {};

// Items - Post
// Required Data - none
// Optional Data - none
itemHandlers._items.post = function(data, callback){
    var name = typeof(data.payload.name) == "string" && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
    var price = typeof(data.payload.price) == "object" && data.payload.price instanceof Array ? data.payload.price : false;
    if(name && price){        
        var itemId = helpers.createRandomString(20);
        var itemObject ={
            "id"      : itemId,
            "name"    : name,            
            "price"   : {
                "Small"   : data.payload.price[0],
                "Regular" : data.payload.price[1],
                "Large"   : data.payload.price[2]
            }
        }

        // Store the item
        _data.create("items", itemId, itemObject, function(err, data){
            if(!err){
                callback(200, itemObject);
            } else{
                callback(500, {"Error": "Couldn't create the item"});
            }
        })           

    } else{
        callback(400,{"Error" : "Required fields missing or they were invalid"});
    }
}


// Items - Get
// Required Data - itemId
// Opptional data - none
itemHandlers._items.get = function(data, callback){
    // Check if the itemId is valid
    var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if(id){
        // Look up the item
        _data.read("items", id, function(err, itemData){
            if(!err && itemData){            
                callback(200, itemData);
            } else{
                callback(404, {"Error" : "Item not found for the given id"});
            }
        });       
    } else{
        _data.list("items", function(err, itemsList){
            if(!err && itemsList){
                callback(200, itemsList);
            } else{
                callback(404,{"Error": "No items in the list"})
            }
        })
    }
}

// Items - Put
// Required Data - itemId
// Optional data - name, price
itemHandlers._items.put = function(data, callback){

    // Required data
    var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim(): false;

    // Optional data
    var name = typeof(data.payload.name) == "string" && data.payload.name.trim().length > 0 ? data.payload.name : false;
    var price = typeof(data.payload.price) == "object" && data.payload.successCodes instanceof Array ? data.payload.price : false;
    

    if(id){
        // Look up the item
        _data.read("items", id, function(err, itemData){
        if(!err && itemData){
            if(name || price){
                if(name){
                    itemData.name = name;
                }

                if(price){
                    itemData.price = price;
                }
                // Update the itemObject
                _data.update("items", id, itemData, function(err){
                    if(!err){
                        callback(200);
                    } else{
                        callback(500, {"Error": "Couldn't update the items' data"});
                    }
                })            
            } else{
                callback(400, {"Error" : "Required fields missing or they were invalid"});
            } 
        } else{
            callback(404,{"Error": "Item not found"});
        }
    });
    } else{
        callback(400, {"Error" : "Required fields missing or they were invalid"});
    }    
}

// Items - Delete
// Required Data - itemId
// Optional Data - none
itemHandlers._items.delete = function(data, callback){

    // Check if the item id is valid
    var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if(id){
        // Delete the given item
        _data.delete("items", id, function(err){
            if(!err){
                callback(200);
            } else{
                callback(500, {"Error": "Could not delete the item"});
            }
        })                               
    } else{
        callback(400, {"Error" : "The given itemId is invalid"})
    }
}

// Export the handlers
module.exports = itemHandlers;
