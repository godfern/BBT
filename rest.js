/**
 * Created by godfrey.f on 16/12/16.
 */
var mysql = require("mysql");
function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}
//
REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    router.get("/",function(req,res){
        var productQuery = "SELECT * FROM ?? WHERE ??=?";
        var table = ["products","FSN",req.query.fsn];
        var productQuery = mysql.format(productQuery,table);
        var productDetailTry = {};
        connection.query(productQuery,function(err,rows){
            productDetailTry = rows;
            console.log(JSON.stringify(rows));
        });

        var query = "SELECT * FROM ?? WHERE ??=?";
        var table = ["fsn-user","FSN",req.query.fsn];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                if(rows[0]){
                    var tryCount = parseInt(rows[0].try)+1;
                    var query = "UPDATE  ?? SET ?? = ? WHERE ?? = ? AND ?? = ?";
                    var table = ["fsn-user","try",tryCount,"FSN",req.query.fsn,"userId",req.query.userId];
                    query = mysql.format(query,table);
                    connection.query(query,function(err,rows){
                        if(err) {
                            console.log(err);
                            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                        } else {
                            res.json({"Error" : false, "Message" : "fsn-user added !"});
                        }
                    });
                }else{
                    var tryCount = 1;
                    var query = "INSERT INTO ??(??,??,??) VALUES (?,?,?)";
                    var table = ["fsn-user","FSN","userId","try",req.query.fsn,req.query.userId,tryCount];
                    query = mysql.format(query,table);
                    connection.query(query,function(err,rows){
                        if(err) {
                            console.log(err);
                            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                        } else {
                            res.json({"Error" : false, "Message" : "fsn-user added !"});
                        }
                    });
                }

                productDetailTry['try'] = tryCount;

                console.log(JSON.stringify(productDetailTry));
            }
        });
    })
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
