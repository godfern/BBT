var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql      = require('mysql');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var connection = mysql.createConnection({
  host     : 'srm-db1.stage.ch.flipkart.com',
  user     : 'root',
  password : '',
  database : 'bbt'
});

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

//connection.end(function(err) {
//  // The connection is terminated gracefully
//  // Ensures all previously enqueued queries are still
//  // before sending a COM_QUIT packet to the MySQL server.
//});


connection.query('SELECT * FROM products',function(err,rows){
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
});

connection.end();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
