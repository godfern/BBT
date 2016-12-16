/**
 * Created by godfrey.f on 16/12/16.
 */
var mysql = require("mysql");
function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    router.get("/",function(req,res){
        var query = "SELECT * FROM ?? WHERE ??= ?";
        var table = ["discount_history","FSN",req.query.fsn];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                console.log(err);
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "discount-history fetched !"});
            }
        });
    });
}

module.exports = REST_ROUTER;
