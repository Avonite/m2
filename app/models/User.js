const Games = require("../modules/Games");

function User(ws){
  this.ws = ws;
  console.log("A user connected");
  var user = this;

  this.ws.on("message", function(data){

    // Try to parse received data as JSON
    try{
      var data = JSON.parse(data);
    }catch(e){
      console.log("Couldn't parse json");
      return;
    }

    if(data.action == 'startGame'){
      Games.connectUser(user);
    }

  });

  this.getWebSocket = function(){
    return this.ws;
  }
}


module.exports = User;
