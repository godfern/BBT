var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql      = require('mysql');
var rest = require("./REST.js");
var md5 = require('MD5');

//var index = require('./routes/index');
//var users = require('./routes/users');

var app = express();

function REST(){
  var self = this;
  self.connectMysql();
};

REST.prototype.connectMysql = function() {
  var self = this;
  var pool      =    mysql.createPool({
    connectionLimit : 100,
    host     : 'srm-db1.stage.ch.flipkart.com',
    user     : 'root',
    password : '',
    database : 'bbt',
    debug    :  false
  });
  pool.getConnection(function(err,connection){
    if(err) {
      self.stop(err);
    } else {
      self.configureExpress(connection);
    }
  });
}

REST.prototype.configureExpress = function(connection) {
  var self = this;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');
  var router = express.Router();
  app.use('/api', router);
  app.use('/discount-history', router);
  var rest_router = new rest(router,connection,md5);
  self.startServer();
}

REST.prototype.startServer = function() {
  app.listen(3000,function(){
    console.log("All right ! I am alive at Port 3000.");
  });
}

REST.prototype.stop = function(err) {
  console.log("ISSUE WITH MYSQL n" + err);
  process.exit(1);
}

new REST();

//var connection = mysql.createConnection({
//  host     : 'srm-db1.stage.ch.flipkart.com',
//  user     : 'root',
//  password : '',
//  database : 'bbt'
//});
//
//connection.connect(function(err){
//  if(err){
//    console.log('Error connecting to Db');
//    return;
//  }
//  console.log('Connection established');
//});

//connection.end(function(err) {
//  // The connection is terminated gracefully
//  // Ensures all previously enqueued queries are still
//  // before sending a COM_QUIT packet to the MySQL server.
//});


//connection.query('SELECT * FROM products',function(err,rows){
//  if(err) throw err;
//
//  console.log('Data received from Db:\n');
//  console.log(rows);
//});

//connection.end();

//app.get('/products',function(req,res){
//  var data = {
//    "error":1,
//    "Books":""
//  };
//
//  connection.query("SELECT * from products where FSN=",function(err, rows, fields){
//    if(rows.length != 0){
//      data["error"] = 0;
//      data["Products"] = rows;
//      res.json(data);
//    }else{
//      data["products"] = 'No products Found..';
//      res.json(data);
//    }
//  });
//});

//BBT.prototype.getProductDetails= function(req,res) {
  //router.get("/",function(req,res){
  //    res.json({"Message" : "Hello World !"});
  //})
  //var query = "SELECT * FROM ?? WHERE ??=?";
  ////var query = "INSERT INTO ??(??,??) VALUES (?,?)";
  ////var table = ["user_login","user_email","user_password",req.body.email,md5(req.body.password)];
  //var table = ["products","FSN",req.params.fsn];
  //query = mysql.format(query,table);
  //connection.query(query,function(err,rows){
  //    if(err) {
  //        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
  //    } else {
  //        res.json({"Error" : false, "Message" : "Products fetched !"});
  //    }
  //});
//}


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//
//app.use('/', index);
//app.use('/users', users);
//
//// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

// error handler
//app.use(function(err, req, res, next) {
//  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//  // render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});

//module.exports = app;
