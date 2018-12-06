function Game() {
  this.started = false;         // whether both players are connected
  this.type = null;             // type of this player, either maker or braker
  this.myTurn = false;          // is it this users turn?
  this.codeline = null;         // codeline of maker
  this.pinlines = [];           // all pinlines for braker
  this.ws = null;               // socket to webserver
  this.messageElement = null;   // message html element

  // will be run at the when new Game object is created
  this.init = function(){
    // setup websocket to server
    this.ws = new WebSocket("ws://localhost:8080");
    // add listener for incoming data
    this.ws.addEventListener("message", this.receive.bind(this));
    // tell server to participate in game
    this.send('startGame', {});

    // get all pin-line html elements
    var pinlines = document.getElementsByClassName("braker-screen")[0].getElementsByClassName("pin-line");

    // loop over pin-line html elements
    for(var i = 0; i < pinlines.length; i++){
      // create Pinline object for every pin-line html element and add it to the pinlines array
      this.pinlines.push(new Pinline(pinlines[i], this));
    }

    // store the codeline html element
    this.codeline = new Pinline(document.getElementsByClassName("maker-screen")[0].getElementsByClassName("pin-line")[0], this);
    // store the message html element
    this.messageElement = document.querySelector(".message-board p");
  }

  // whether this user is a braker
  this.isBraker = function(){
    return this.type == "braker";
  }

  // whether this user is a maker
  this.isMaker = function(){
    return this.type == "maker";
  }

  // whether it is this user's turn
  this.isMyTurn = function(){
    return this.myTurn;
  }

  // whether both users are connected
  this.isStarted = function(){
    return this.started;
  }

  // get the current pinline on the brakers-screen
  this.currentPinline = function(){
    for(var i = 0; i < this.pinlines.length; i++){
      var pinline = this.pinlines[i];
      if(!pinline.isDone()){
        return pinline;
      }
    }
    return null;
  }

  // set the color of the next pin
  // in case of a braker the next pin is on the braker-screen
  // for a maker it'll be used to set the codeline
  this.setNextPinColor = function(color){
    if(this.isBraker()){
      var pinline = this.currentPinline();
      if(pinline == null) return false;
    }else{
      var pinline = this.codeline;
      if(pinline == null) return false;
    }

    var pin = pinline.nextPin();
    if(pin == null) return false;

    pin.setColor(color);
  }

  // switch turns of users
  this.switchTurns = function(){
    this.myTurn = !this.myTurn;
  }

  // set the role of this user at the start of a new game
  this.setRole = function(role){
    this.type = role;
    if(this.type == "maker"){
      this.myTurn = true;
      this.message("Come up with a code");
    }else{
      this.myTurn = false;
      this.message("Your opponent is thinking of a code");
    }
  }

  // display a message in the message html element
  this.message = function(m){
    this.messageElement.innerHTML = m;
  }

  // send action and props as JSON to webserver via websocket
  // if the connection is not yet opened, wait for it.
  this.send = function(action, props){
    if(this.ws.readyState == this.ws.OPEN){
      this.ws.send(JSON.stringify({action: action, props: props}));
    }else{
      this.ws.addEventListener("open", () => {
        this.ws.send(JSON.stringify({action: action, props: props}));
      });
    }
  }

  // handler of incoming websocket calls
  this.receive = function(e){
    var data = JSON.parse(e.data);
    var action = data.action;
    var props = data.props;

    switch(action){
      // both users are connected
      case "started":
        this.started = true;
        if(this.isMaker()){
          this.message("Your opponent is ready");
        }
      break;

      // a role is assigned to you
      case "yourRole":
        this.setRole(props.role);
      break;

      // maker has set up a code
      case "codeReady":
        this.message("It's your first turn");
        this.switchTurns();
      break;

      // braker has set up a guess
      // braker asks maker to verify his or her guess
      case "verifyPinline":
        this.currentPinline().forceColors(props.colors);
        this.message("Please verify the pinline");
        this.switchTurns();
      break;
    }

  }

  // braker: check current pinline, aka ask maker for verification
  // maker: confirm code line
  this.check = function(){
    if(this.isBraker()){
      this.currentPinline().check();
    }else{
      this.codeline.check();
    }
  }

  // execution of 'constructor'
  this.init();
}

// object representation of pin-line in the game
function Pinline(pinline, game) {
  this.game = game;               // Game instance this Pinline belongs to
  this.element = pinline;         // html element which this Pinline instance represents
  this.done = false;              // whether this Pinline is done, so it cannot be changed anymore
  this.checked = false;           // whether the maker has verified this guess
  this.correct_position = 0;      // how many pins are in the correct position
  this.correct_color = 0;         // how many pins have the right color
  this.pins = [];                 // all the pins in this pinline

  // 'constructor'
  // will be executed when new Pinline is instanciated
  this.init = function(){
    var pins = this.element.getElementsByClassName("pin");

    for(var i = 0; i < pins.length; i++){
      this.pins.push(new Pin(pins[i], this));
    }
  }

  // whether or not this Pinline is done, so whether or not it can still be changed
  this.isDone = function(){
    return this.done;
  }

  // whether the maker has verified this Pinline
  this.isChecked = function(){
    return this.checked
  }

  // get the first uncolored pin in this line
  this.nextPin = function(){
    for(var i = 0; i < this.pins.length; i++){
      var pin = this.pins[i];
      if(!pin.isColored()){
        return pin;
      }
    }
    return null;
  }

  // braker: validate input and then tell maker to verify this guess
  // maker: tell braker you're ready with making a code
  this.check = function(){
    if(!this.game.isStarted()){
      this.game.message("Wait for an opponent");
      return;
    }

    if(this.game.isBraker()){
      var colors = [];
      for(var i = 0; i < this.pins.length; i++){
        var color = this.pins[i].getColor();
        if(color == null){
          this.game.message("Fill all pins");
          return false;
        }
        colors.push(color);
      }
      this.game.switchTurns();
      this.done = true;
      this.game.message("Opponent will verify");
      this.game.send("verifyPinline", {colors: colors});
    }

    if(this.game.isMaker()){
      for(var i = 0; i < this.pins.length; i++){
        var color = this.pins[i].getColor();
        if(color == null){
          this.game.message("Fill all pins");
          return false;
        }
      }
      this.game.switchTurns();
      this.done = true;
      this.game.message("Now, wait...");
      this.game.send("codeReady", {});
    }
  }

  // set colors of pins in this pinline
  // forced = even when it's not this user's turn
  this.forceColors = function(colors){
    for(var i = 0; i < this.pins.length; i++){
      this.pins[i].forceColor(colors[i]);
    }
  }

  // call to 'constructor'
  this.init();
}

// object representing pin html element
function Pin(pin, pinline) {
  this.pinline = pinline;           // Pinline of which this Pin is part
  this.game = this.pinline.game;    // Game of which this Pin is part
  this.element = pin;               // html element this object represents
  this.color = null;                // textual representation of the pin's color

  // 'constructor'
  // sets event listener for click on this pin
  this.init = function(){
    this.element.addEventListener("click", this.unsetColor.bind(this));
  }

  // whether or not this pin has a color
  this.isColored = function(){
    return this.color !== null;
  }

  // set this pin's color, if it is this user's turn
  this.setColor = function(c){
    if(!this.game.isMyTurn() || this.pinline.isDone()){
      return;
    }
    this.forceColor(c);
  }

  // set this pin's color
  // force = even though it's not this user's turn
  this.forceColor = function(c){
    this.color = c;
    this.element.classList.add(c);
  }

  // unset the color of this pin
  // only if this pipeline is not yet done
  this.unsetColor = function(e){
    if(!this.game.isMyTurn() || this.pinline.isDone()){
      return;
    }
    this.color = null;

    this.element.classList.remove("red");
    this.element.classList.remove('yellow');
    this.element.classList.remove('blue');
    this.element.classList.remove('green');
    this.element.classList.remove('gray');
    this.element.classList.remove('purple');
    this.element.classList.remove('black');
    this.element.classList.remove('orange');
  }

  // get the color of this pin
  this.getColor = function(){
    return this.color;
  }

  // run the 'constructor'
  this.init();
}

window.game = new Game();
