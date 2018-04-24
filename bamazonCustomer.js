var mysql = require("mysql");
var inquirer = require("inquirer");
var arrayofIDs = [];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "test",
    database: "products"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    displayDB();
});

function displayDB() {
    connection.query("SELECT * FROM categories", function (error, response) {
        if (error) {
            console.log(error);
        }
        //console.log(response);
        for (var i = 0; i < response.length; i++) {
            console.log("ID: " + response[i].item_id + " | " + response[i].product_name + " | " + "$" + response[i].price + " | " + "Quantity: " + response[i].stock_quantity + "\n");
            arrayofIDs.push(response[i].item_id);
        }
        purchaseAsk();
    });
}

// function which prompts the user for what action they should take
function purchaseAsk() {
    inquirer
        .prompt([
            {
                name: "itemID",
                type: "input",
                message: "What is the product ID of the item you wish to buy?",
                validate: function (input) {
                    if (arrayofIDs.indexOf(parseInt(input)) === -1) {
                        console.log("\n" + "Please choose a valid product ID");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How many units of the product would you like to buy?"
            },

        ])
        .then(function (answer) {
            connection.query("SELECT * FROM categories", function (error, response) {
                if (error) {
                    console.log(error);
                }
                // get the information of the chosen item
        

                //var results;
                for (var i = 0; i < response.length; i++) {
                    if ((response[i].item_id == answer.itemID) && (response[i].stock_quantity < answer.quantity)) {
                        console.log("Insufficient quantity!");
                    }

                    else if ((response[i].item_id == answer.itemID) && (response[i].stock_quantity >= answer.quantity)) {
                        var sql = `UPDATE categories SET stock_quantity = stock_quantity - ${answer.quantity} WHERE (item_id = ${answer.itemID})`;
                        var pricePer = response[i].price
                        // run the start function after the connection is made to prompt the user
                        //updateQuantity();

                        connection.query("SELECT * FROM categories", function (error, response) {
                            if (error) {
                                console.log(error);
                            }
                            //console.log(response.price)

                            connection.query(sql, function (err, result) {
                                if (err) throw err;
                                console.log(result.affectedRows + " record(s) updated");
                                //console.log(price)
                                console.log("\n" + "Your total is: $" + answer.quantity*pricePer + "\n")
                                displayDB();
                            });
                        })
                    }
                }


            })
        })
}
