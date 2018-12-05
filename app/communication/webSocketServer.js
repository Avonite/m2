const ws = require("ws");
const User = require("../models/User");
const Games = require("../modules/Games");

module.exports.start = function(){
  var wss = new ws.Server({port: 8080});

  wss.on("connection", function(ws){

    var user = new User(ws);
    Games.connectUser(user);

  });
}
