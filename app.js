var express = require("express");
var http = require("http");
var websocket = require("ws");

var port = process.argv[2];
var app = express();

var indexRouter = require('./routes/index');

app.use(express.static(__dirname + "/public"));

app.use('/', indexRouter);

var server = http.createServer(app).listen(port);

// const wss = new websocket.Server({ server });

// let connections = 0;

// wss.on("connection", function(ws) {
        
//     //let's slow down the server response time a bit to make the change visible on the client side
//     console.log("Connection state: "+ ws.readyState);
//     connections += 1;
//     ws.send("Hello connection " + connections);
//     ws.close();
//     console.log("Connection state: "+ ws.readyState);    
//     console.log("Number of connections: " + connections);
        
//     ws.on("message", function incoming(message) {
//         console.log("[LOG] " + message);
//     });
// });