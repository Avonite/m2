function User(ws){
  this.ws = ws;
  console.log("A new user connected");

  this.getWebSocket = function(){
    return this.ws;
  }
}


module.exports = User;
