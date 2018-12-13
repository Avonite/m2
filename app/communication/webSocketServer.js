// ==========================================================================
// =  Websocket server module that holds two function:                      =            
// =  - start:     creates a new websocket server on port 8080.             =
// =               A new user is created when someone connects to this port.= 
// =  - broadcast: sends a message to all open websockets                   =
// ==========================================================================

const ws = require("ws");
const User = require("../models/User");

var wss = null;

// Starts the websocketserver 
module.exports.start = function(){
  wss = new ws.Server({port: 8080});

  // If someone connects, create new websocket connection
  wss.on("connection", function(ws){
    var user = new User(ws);
  });
}

// Sends a message to all current open websockets
module.exports.broadcast = function(data){
  if(wss == null){
    return false;
  }

  if(typeof data !== "String"){
    data = JSON.stringify(data);
  }

  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
}
