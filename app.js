var express = require("express");
var http = require("http");

var port = process.argv[2];
var app = express();

var indexRouter = require('./routes/index');

app.use('/', indexRouter);

app.use(express.static(__dirname + "/public"));
http.createServer(app).listen(port);