function Game(maker){
  console.log("A new game was started");
  this.maker = maker;
  this.braker = null;
  this.active = false;

  this.maker.getWebSocket().on("message", receiveFromMaker.bind(this));
  this.maker.getWebSocket().on("close", makerDisconnected.bind(this));

  // Set the braker for this game
  this.setBraker = function(braker){
    console.log("A braker is added to a game");
    this.braker = braker;
    this.active = true;

    this.braker.getWebSocket().on("message", receiveFromBraker.bind(this));
    this.maker.getWebSocket().on("close", brakerDisconnected.bind(this));
  }

  // Check if braker is needed to start game
  this.isAvailable = function(){
    return this.braker == null;
  }

  this.isActive = function(){
    return this.active;
  }

}

function makerDisconnected(){
  this.active = false;
  console.log("Maker disconnected");
}

function brakerDisconnected(){
  this.active = false;
  console.log("Braker disconnected");
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
