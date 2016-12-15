/**
 * Created by godfrey.f on 16/12/16.
 */
var mysql = require("mysql");
var dbConn;
function REST_ROUTER(router, connection, md5) {
    var self = this;
    self.handleRoutes(router, connection, md5);
    dbConn= connection;
}
//
REST_ROUTER.prototype.handleRoutes = function (router, connection, md5) {
    router.get("/", function (req, res) {

    });
    router.post('/bargain/', function (req, res) {
        var productQuery = "SELECT * FROM ?? WHERE ??=?";
        var table = ["products", "FSN", 'SHOEG2Y9D6Q7FGFU1'];
        productQuery = mysql.format(productQuery, table);
        var productDetailTry = {};
        connection.query(productQuery, function (err, rows) {
            productDetailTry = rows;
            console.log(JSON.stringify(rows));
            var query = "SELECT * FROM ?? WHERE ??=?";
            var table = ["fsn-user", "FSN", req.body.fsn];
            query = mysql.format(query, table);
            connection.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing MySQL query"});
                } else {
                    if (rows[0]) {
                        var tryCount = parseInt(rows[0].try) + 1;
                        var query = "UPDATE  ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
                        var table = ["fsn-user", "try", tryCount, "FSN", req.body.fsn, "userId", req.body.userId];
                        query = mysql.format(query, table);
                        connection.query(query, function (err, rows) {
                            if (err) {
                                console.log(err);
                                res.json({"Error": true, "Message": "Error executing MySQL query"});
                            } else {
                                productDetailTry['try'] = tryCount;
                                bLogic(productDetailTry,req,res);
                            }
                        });
                    }
                    else {
                        var tryCount = 1;
                        var query = "INSERT INTO ??(??,??,??) VALUES (?,?,?)";
                        var table = ["fsn-user", "FSN", "userId", "try", req.body.fsn, req.body.userId, tryCount];
                        query = mysql.format(query, table);
                        connection.query(query, function (err, rows) {
                            if (err) {
                                console.log(err);
                                res.json({"Error": true, "Message": "Error executing MySQL query"});
                            } else {
                                productDetailTry['try'] = tryCount;
                                bLogic(productDetailTry,req,res);
                            }
                        });
                    }
                }

            });

        });
    });
};
function bLogic(result, req,res) {
    var mrp = result.mrp;
    var max_discount = result.max_discount;
    var variable_discount = result.variable_discount;
    var discount_limit = result.discount_limit;
    var selling_price = mrp;
    var bargain_status;
console.log(req.body);
    // TODO Update the tries
    console.log(bargain_price);
    if (bargain_price > variable_discount) {
        bargain_status = false;
        // should return tries alse
    } else {
        // Yay! we have him some discount
        if (bargain_price <= variable_discount) {

            if (bargain_price < max_discount) {
                var bargain_difference = max_discount - bargain_price;
                if (variable_discount + bargain_difference > discount_limit) {
                    // TODO update discount to table vd = dl;
                }
            }
            if (bargain_price < max_discount) {
                bargain_status = true;
                selling_price = mrp - bargain_price;
            }
        }
    }

    res.json({
        bargain_status: bargain_status,
        selling_price: selling_price
    });
}
function updateVariableDiscount(req,res){

}
module.exports = REST_ROUTER;


//function BBT(router,connection,md5) {
//    var self = this;
//    self.handleRoutes(router,connection,md5);
//}

//BBT.prototype.getProductDetails= function(req,res) {
//router.get("/",function(req,res){
//    res.json({"Message" : "Hello World !"});
//})

//var query = "INSERT INTO ??(??,??) VALUES (?,?)";
//var table = ["user_login","user_email","user_password",req.body.email,md5(req.body.password)];
//query = mysql.format(query,table);
//connection.query(query,function(err,rows){
//    if(err) {
//        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
//    } else {
//        res.json({"Error" : false, "Message" : "User Added !"});
//    }
//});


//}

//module.exports = BBT;
