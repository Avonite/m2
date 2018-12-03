var express = require("express");
var http = require("http");
var path = require("path");

var port = process.argv[2];
var app = express();

app.set('views', path.join(__dirname, "/views"));
app.set("view engine", "ejs");

// implement routes
var router = require('./routes/game');
app.use('/', router);

// serve static files
app.use(express.static(__dirname + "/public"));

// Listen for incoming requests
http.createServer(app).listen(port);
