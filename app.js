// ==========================================================================
// = Creates and starts up server                                           =
// ==========================================================================

// external modules
var express = require("express");
var http = require("http");
var path = require("path");
var cookieParser = require('cookie-parser')

// module that hold web socket server logic
var wss = require("./app/communication/webSocketServer");

// set port
var port = process.argv[2];
var app = express();

// set view and view engine
app.set('views', path.join(__dirname, "/views"));
app.set("view engine", "ejs");

// cookie-parser
app.use(cookieParser());

// implement routes
var router = require('./routes/game');
app.use('/', router);

// serve static files
app.use(express.static(__dirname + "/public"));

// listen for incoming requests
http.createServer(app).listen(port);


// setup websocket server
wss.start();
