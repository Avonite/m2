function Game(maker){
  console.log("A new game was started");
  this.maker = maker;
  this.braker = null;
  this.active = false;

  this.maker.getWebSocket().on("message", receiveFromMaker.bind(this));
  this.maker.getWebSocket().on("close", makerDisconnected.bind(this));

  this.maker.getWebSocket().send(JSON.stringify({action: "yourRole", props: {role: "maker"}}));

  // Set the braker for this game
  this.setBraker = function(braker){
    console.log("A braker is added to a game");
    this.braker = braker;
    this.active = true;

    this.braker.getWebSocket().on("message", receiveFromBraker.bind(this));
    this.braker.getWebSocket().on("close", brakerDisconnected.bind(this));

    if(this.isActive()){
      this.braker.getWebSocket().send(JSON.stringify({action: "yourRole", props: {role: "braker"}}));

      this.maker.getWebSocket().send(JSON.stringify({action: "started", props: {}}));
      this.braker.getWebSocket().send(JSON.stringify({action: "started", props: {}}));
    }

  }

  // Check if braker is needed to start game
  this.isAvailable = function(){
    return this.maker != null && this.braker == null;
  }

  this.isActive = function(){
    return this.active;
  }

  this.reverse = function(){
    this.maker.getWebSocket()._events = {};
    this.braker.getWebSocket()._events = {};

    var maker = this.maker;
    this.maker = this.braker;
    this.braker = maker;

    this.maker.getWebSocket().on("message", receiveFromMaker.bind(this));
    this.maker.getWebSocket().on("close", makerDisconnected.bind(this));

    this.braker.getWebSocket().on("message", receiveFromBraker.bind(this));
    this.braker.getWebSocket().on("close", brakerDisconnected.bind(this));

    this.maker.getWebSocket().send(JSON.stringify({action: "resetGame", props: {}}));
    this.braker.getWebSocket().send(JSON.stringify({action: "resetGame", props: {}}));

    this.maker.getWebSocket().send(JSON.stringify({action: "yourRole", props: {role: "maker"}}));
    this.braker.getWebSocket().send(JSON.stringify({action: "yourRole", props: {role: "braker"}}));
  }

}

function makerDisconnected(){
  this.active = false;
  this.maker = null;
  if(this.braker != null){
    this.braker.getWebSocket().send(JSON.stringify({action: 'disconnected', props: {}}));
  }
  console.log("Maker disconnected");
}

function brakerDisconnected(){
  this.active = false;
  this.braker = null;
  if(this.maker != null){
    this.maker.getWebSocket().send(JSON.stringify({action: 'disconnected', props: {}}));
  }
  console.log("Braker disconnected");
}

function receiveFromMaker(data){
  if(!this.isActive()){
    return false;
  }
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
    case "codeReady":
      this.braker.getWebSocket().send(JSON.stringify({
        action: 'codeReady',
        props: {}
      }));
    break;

    case "verifiedPinline":
      this.braker.getWebSocket().send(JSON.stringify({
        action: 'verifiedPinline',
        props: data.props
      }));
    break;

    case "brakerWins":
      this.braker.getWebSocket().send(JSON.stringify({
        action: 'brakerWins',
        props: data.props
      }));

      var me = this;
      setTimeout(function(){
        me.reverse();
      }, 3000);
    break;

    case "brakerLoses":
      this.braker.getWebSocket().send(JSON.stringify({
        action: 'brakerLoses',
        props: data.props
      }));

      var me = this;
      setTimeout(function(){
        me.reverse();
      }, 3000);
    break;

    default:
      console.log("Unknown action from maker: '" +action+ "'");
    break;
  }
}

function receiveFromBraker(data){
  if(!this.isActive()){
    return false;
  }
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
    case "verifyPinline":
      this.maker.getWebSocket().send(JSON.stringify(data));
    break;
  }
}

module.exports = Game;
