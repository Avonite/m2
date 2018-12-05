const ws = require("ws");
const User = require("../models/User");

var wss = null;

module.exports.start = function(){
  wss = new ws.Server({port: 8080});

  wss.on("connection", function(ws){

    var user = new User(ws);

  });
}

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
