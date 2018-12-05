function Game(maker){
  console.log("A new game was started");
  this.maker = maker;
  this.braker = null;

  this.maker.getWebSocket().on("message", receiveFromMaker.bind(this));


  this.setBraker = function(braker){
    console.log("A braker is added to a game");
    this.braker = braker;

    this.braker.getWebSocket().on("message", receiveFromBraker.bind(this));
  }

  this.isAvailable = function(){
    return this.braker == null;
  }

}

function receiveFromMaker(data){
  // Try to parse received data as JSON
  try{
    var data = JSON.parse(data);
  }catch(e){
    console.log("Couldn't parse json received from maker");
    return;
  }

  // Determine the action
  var action = data.action;
  if(typeof action == 'undefined'){
    console.log("Undefined action was received from maker");
    return;
  }

  switch(action){
    case "ready":

    break;

    default:
      console.log("Unknown action from maker: '" +action+ "'");
    break;
  }
}

function receiveFromBraker(data){
    // Try to parse received data as JSON
  try{
    var data = JSON.parse(data);
  }catch(e){
    console.log("Couldn't parse json received from maker");
    return;
  }

  // Determine the action
  var action = data.action;
  if(typeof action == 'undefined'){
    console.log("Undefined action was received from maker");
    return;
  }
}

module.exports = Game;
