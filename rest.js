/**
 * Created by godfrey.f on 16/12/16.
 */
var mysql = require("mysql");
var _ = require('lodash');
var dbConn;
function REST_ROUTER(router, connection, md5) {
    var self = this;
    self.handleRoutes(router, connection, md5);
    dbConn = connection;
}
//
REST_ROUTER.prototype.handleRoutes = function (router, connection, md5) {
    router.get("/discountHistory", function (req, res) {
        var query = "SELECT * FROM ?? WHERE ??= ?";
        var table = ["discount_history", "FSN", req.query.fsn];
        query = mysql.format(query, table);
        dbConn.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.json({"Error": true, "Message": err});
            } else {
                _.each(rows, function (item, index) {
                    rows[index].price_saved = (item.mrp - item.selling_price) - item.set_discount;
                });
                //res.render('fsnHistory',{rows: rows});
                res.send({rows: rows});
            }
        });
    });
    router.get("/FSNList", function (req, res) {
        var query = "SELECT * FROM ??";
        var table = ["products"];
        query = mysql.format(query, table);
        dbConn.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.json({"Error": true, "Message": err});
            } else {
                res.render('fsnList', {rows: rows});
            }
        });
    });
    router.post("/checkout", function (req, res) {
        var query = "SELECT * FROM ??";
        var table = ["products"];
        query = mysql.format(query, table);
        dbConn.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.json({"Error": true, "Message": err});
            } else {
                res.render('fsnList', {rows: rows});
            }
        });
    });
    router.post('/bargain/', function (req, res) {
        var productQuery = "SELECT * FROM ?? WHERE ??=?";
        var table = ["products", "FSN", req.body.fsn];
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
                                bLogic(productDetailTry, req, res);
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
                                console.log({x:productDetailTry});
                                bLogic(productDetailTry, req, res);
                            }
                        });
                    }
                }

            });

        });
    });
};
function bLogic(result, req, res) {
    var tempResult = result;
    result = result[0];
    var mrp = result.mrp;
    var max_discount = result.max_discount;
    var variable_discount = result.variable_discount;
    var discount_limit = result.discount_limit;
    var selling_price = parseInt(mrp);
    var bargain_status;
    var bargain_price = req.body.bargain_price;

    // TODO Update the tries
    if (bargain_price > variable_discount) {
        bargain_status = false;
        // should return tries alse
    } else {
        // Yay! we have him some discount
        if (bargain_price <= variable_discount) {
            if (bargain_price < max_discount) {
                var bargain_difference = max_discount - bargain_price;
                if ((variable_discount + bargain_difference) > discount_limit) {
                    updateVariableDiscount(req.body.fsn, discount_limit);
                } else {
                    updateVariableDiscount(req.body.fsn, variable_discount + (max_discount - bargain_price));
                }
                bargain_status = true;
                selling_price = mrp - bargain_price;
            }

            if (bargain_price >= max_discount) {
                bargain_status = true;
                selling_price = mrp - bargain_price;
                updateVariableDiscount(req.body.fsn, variable_discount - (bargain_price - max_discount));
            }
        }
    }

    res.json({
        bargain_status: bargain_status,
        selling_price: selling_price,
        result: tempResult,
        attempts: tempResult["try"]
    });
}



function insertHistory(req, res, object) {
    var fsn = object.fsn,
        mrp = object.mrp,
        set_discount = object.set_discount,
        selling_price = object.selling_price,
        variable_discount = object.variable_discount,
        discount_limit = object.discount_limit;
    var query = "INSERT INTO ??(??,??,??,??,??,??) VALUES (?,?,?,?,?,?)";
    var table = ["discount_history", "fsn", "mrp", "set_discount", "selling_price", "variable_discount", "discount_limit", fsn, mrp, set_discount, selling_price, variable_discount, discount_limit];
    query = mysql.format(query, table);
    dbConn.query(query, function (err, rows) {

    });
}
function updateVariableDiscount(fsn, vd) {
    var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    var table = ["products", "variable_discount", vd, "FSN", fsn];
    query = mysql.format(query, table);
    dbConn.query(query, function (err, rows) {
        console.log(err);
    });
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
