var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();
var uncaught = require('uncaught');
const token = '517410530:AAEvpf2rDtfCfqUEwKrLDhOVHFBc30rZ9DE';

var bot = require('./bot/telegram.bot');
var routes = require('./router/router');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// app.use('/',routes);

uncaught.start();
uncaught.addListener(function (error) {
    console.log('Uncaught error or rejection: ', error);
});

module.exports = app;
