# Pizza-Delivery-Company API

RESTful JSON API for Pizza Delivering Company

## Routes

* [Users](#users)
* [Tokens](#tokens)
* [Menu](#menu)
* [Items](#items)
* [Cart](#cart)
* [Order](#order)

### Users
#### Methods
- **[<code>GET</code> ](#userget)** /api/users
- **[<code>POST</code> ](#userpost)** /api/users
- **[<code>PUT</code> ](#userput)** /api/users
- **[<code>DELETE</code> ](#userdelete)** /api/users

#### User/GET      
##### Path:
    /api/users?phone=********789
##### Parameters:
    phone* (Required)
##### Headers:
    token* (Required)
##### Response
    {   name,
        email,
        phone,
        address,
        cart, // may or may not be present
        orders  // may or may not be present
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: User not Found
   
#### User/POST      
##### Path:
    /api/users
##### Parameters:
    email* (Required)
    password* (Required)
    name* (Required)
    phone* (Required)
    address* (Required)
##### Headers:
    none
##### Response
    { }
##### Errors
    400: User with that phone no already exists
    400: Required fields missing or they were invalid    
    500: Couldn't create the new user, Couldn't hash the password

#### User/PUT      
##### Path:
    /api/users
##### Parameters:
    phone*(Required)
    (Atleast one of the below fields)
    email
    password
    name
    address
##### Headers:
    token* (Required)
##### Response
    { }    
##### Errors
    404: User not found
    400: Required fields missing or they were invalid
    403: Unauthorized Access
    500: Couldn't update users' data
    
#### User/DELETE      
##### Path:
    /api/users?phone=********789
##### Parameters:
    phone* (Required)   
##### Headers:
    token* (Required)
##### Response
    { }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: User not found    
    500: Could not delete the users' data

### Tokens
#### Methods
- **[<code>GET</code> ](#tokenget)** /api/tokens
- **[<code>POST</code> ](#tokenpost)** /api/tokens
- **[<code>PUT</code> ](#tokenput)** /api/tokens
- **[<code>DELETE</code> ](#tokendelete)** /api/tokens

#### Token/GET      
##### Path:
    /tokens?id=string
##### Parameters:
    id* (Required)
##### Headers:
    none
##### Response
    {
        phone,
        id,
        expires
    }
##### Errors
    400: Invalid phone no
    404: Token not Found

#### Token/POST      
##### Path:
    /api/tokens
##### Parameters:
    phone* (Required)
    password* (Required)
##### Headers:
    none
##### Response
    {
        phone,
        id,
        expires
    }
##### Errors
    400: Required fields missing or they were invalid
    400: Invalid password
    500: Could not create the token for the user
    404: User not found   
        
#### Token/PUT      
##### Path:
    /api/tokens?id=string
##### Parameters:    
    expires* (required)
##### Headers:
    none
##### Response
    { }
##### Errors
    400: Required fields missing or they were invalid
    400: Token has already expired, and can't be extended
    404: Token not found    
    500: Couldn't extend tokens' expiration  
    
#### Token/DELETE      
##### Path:
    /api/tokens?id=string
##### Parameters:
    id* (required)    
##### Headers:
    none
##### Response
    { }
##### Errors
    400: Required fields missing or they were invalid
    404: Token not found    
    500: Couldn't delete the specified token


### Menu
#### Methods
- **[<code>GET</code> ](#menuget)** /menu

#### Menu/GET      
##### Path:
    /api/menu?phone=********789
##### Parameters:
    none
##### Headers:
    token
##### Response
![screen shot 2018-07-26 at 11 13 02 pm](https://user-images.githubusercontent.com/35345474/43301066-73dbf8f2-9180-11e8-93ba-a4481f5488bf.png)
![screen shot 2018-07-26 at 11 13 11 pm](https://user-images.githubusercontent.com/35345474/43301069-76cda006-9180-11e8-82d6-9699c17cc588.png)


##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    405: Mehod not allowed

### Items
// No Authorization is needed
#### Methods
- **[<code>GET</code> ](#itemget)** /api/items
- **[<code>POST</code> ](#itempost)** /api/items
- **[<code>PUT</code> ](#itemput)** /api/items
- **[<code>DELETE</code> ](#itemdelete)** /api/items

#### Item/GET      
##### Path:
    /items?id=string
##### Parameters:
    id (optional) // if id is not present, will return the list of items in storage
##### Headers:
    none
##### Response
    {
        // will either give the information about an item
        id,
        name,
        price:{
           small,
           regular,
           large
        }

        // or will represent all the itemId's in a list
    }
##### Errors
    404: Item not found for the given id
    404: No items in the list

#### Item/POST      
##### Path:
    /api/items
##### Parameters:
    {
        name* (Required)    
        price* (Required) // price is an array for the amount of each size (small, regular, medium)...
        Example -> price = [10,20,30]
    } 
##### Headers:
    none
##### Response
    {   
        id,
        name,
        price:{
           small,
           regular,
           large
        }
    }
##### Errors
    400: Required fields missing or they were invalid    
    400: Couldn't create the item

#### Item/PUT      
##### Path:
    /api/items?id=string
##### Parameters:
    id* (Required)
    (Atleast one of the below fields)
    name* 
    price* 
##### Headers:
    none
##### Response
    { }
##### Errors
    400: Required fields missing or they were invalid
    404: Item not found        
    500: Couldn't update the items' data   
    
#### Item/DELETE       
##### Path:
    /items?id=string
##### Parameters:
    id* (Required)    
##### Headers:
    none
##### Response
    { }
##### Errors
    400: Invalid item Id 
    500: Could not delete the item


### Cart
#### Methods
- **[<code>GET</code> ](#cartget)** /api/cart
- **[<code>POST</code> ](#cartpost)** /api/cart
- **[<code>PUT</code> ](#cartput)** /api/cart
- **[<code>DELETE</code> ](#cartdelete)** /api/cart

#### Cart/GET      
##### Path:
    /api/cart?phone=********789
##### Parameters:
    phone* (Required)    
##### Headers:
    token* (Required)
##### Response
    {   
        Email,
        Phone,
        items // will contain an array of object(s) containing details of each item
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Cart is empty
    404: User not found

#### Cart/POST
Will add the cart id in the users' cart field      
##### Path:
    /api/cart?phone=********789
##### Parameters:
    phone* (Required)
    itemId* (Required)
    size* (Required) // small, regular or large
    crust (Optional) // new hand tossed(default), wheat thin crust or cheese burst
##### Headers:
    token* Required
##### Response
    {   
        email,    
        phone, 
        name,
        cartId,
        itemId,  
        size,
        crust,
        amount    
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: User not found
    404: Item not found
    500: Couldn't update the specified users' data for new cart item
    500: Couldn't add the item to the specified users' cart 

#### Cart/PUT      
##### Path:
    /api/cart?id=string // cartId
##### Parameters:
    id* (Required)
    (Atleast one of the below fields)
    size  // small, regular or large
    crust  // new hand tossed(default), wheat thin crust or cheese burst
##### Headers:
    token* Required
##### Response
    { }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    500: Couldn't update users' data
    500: Couln't update the cart data

#### Cart/DELETE
Will delete the cartId from the users' cart field
##### Path:
    /api/cart?id=string
##### Parameters:
    id* (Required) // cartId
##### Headers:
    token* (Required)
##### Response
    { }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Cart not found 
    404: Cart not present with the specified user  
    500: Couldn't delete the cart for the given user
    500: Could not find the user for the given cart
    500: Couldn't update the users' data


### Orders
#### Methods
- **[<code>GET</code> ](#orderget)** /orders
- **[<code>POST</code> ](#orderpost)** /orders

#### Order/GET      
##### Path:
    /api/orders?phone=********789
##### Parameters:
    phone* (Required)  
##### Headers:
    token* (Required)
##### Response
    {   
        name,
        phone,
        email,
        orderId,
        items, // an array of objects containing detail of each item
        totalAmount,
        paymentProcessed
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Order not found
    500: Insufficient Permissions

#### Order/POST    
    Will create the order with all the items on the cart  
##### Path:
    /api/orders?phone=********789
##### Parameters:
    phone* (Required)
##### Headers:
    token* (Required)
##### Response
    {   
        Your Order : {
            name,
            phone,
            email,
            orderId,
            items, // an array of objects containing detail of each item
            totalAmount,
            paymentProcessed
        }
    }
##### Errors
    400: Required fields missing or they were invalid 
    403: Unauthorized Access
    404: No items in the cart to place order
    404: User not found    
    500: Transaction failure
    500: Could not create the order for the user
    500: Could not email the order receipt
    500: Couldn't update the users' data for new order
        
    





    


