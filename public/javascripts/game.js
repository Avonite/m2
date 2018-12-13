function Game() {
  this.started = false;         // whether both players are connected
  this.type = null;             // type of this player, either maker or braker
  this.myTurn = false;          // is it this users turn?
  this.codeline = null;         // codeline of maker
  this.pinlines = [];           // all pinlines for braker
  this.ws = null;               // socket to webserver
  this.messageElement = null;   // message html element
  this.muted = false;           // whether sound must be muted;
  this.mute_btn = null;         // the mute button
  this.fullscreenOn = false;    // whether fullscreen is on or off

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
      this.pinlines.push(new Pinline(pinlines[i], this, false));
    }

    this.pinlines.reverse();

    // store the codeline html element
    this.codeline = new Pinline(document.getElementsByClassName("maker-screen")[0].getElementsByClassName("pin-line")[0], this, true);
    // store the message html element
    this.messageElement = document.querySelector(".message-board p");

    this.mute_btn = document.querySelector(".volume");
    this.mute_btn.addEventListener("click", this.changeMute.bind(this));
    
    new Audio('/audio/bleep1.wav');
    new Audio('/audio/bleep2.wav');

    var $this = this;

    document.addEventListener('fullscreenchange', function(event) {
      var fullscreenButton = document.getElementById('fullscreen-button');
      if ($this.fullscreenOn) {      
        fullscreenButton.src = "/images/expand.svg";
      } else {
        fullscreenButton.src = "/images/exit.svg";
      }
      $this.fullscreenOn = !$this.fullscreenOn;      
    });
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

  // change visual appearance of mute button
  this.changeMute = function(){
    this.muted = !this.muted;
    if(this.isMuted()){
      this.mute_btn.classList.add('muted');
    }else{
      this.mute_btn.classList.remove('muted');
    }
  }

  this.isMuted = function(){
    return this.muted;
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
    var pinline
    if(this.isBraker()){
      pinline = this.currentPinline();
      if(pinline == null) return false;
    }else{
      pinline = this.codeline;
      if(pinline == null) return false;
    }

    var pin = pinline.nextPin();
    if(pin == null) return false;

    if (!this.isMuted()) {
        var bleep = new Audio('/audio/bleep1.wav');
        bleep.play();
    }

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
    document.title = m;
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
        this.currentPinline().setDone(true);
        this.message("Please verify the pinline");
        this.switchTurns();
      break;

      // other player disconnected
      // redirect to splash screen
      case "disconnected":
        let i = 5
        let $this = this;
        setInterval(function () {
            if (i == 0) {
                window.location = "/"           
            }
            $this.message("Opponent disconnected, abort mission in: " + i)
            i--;
        }, 1000);        
    }
  }

  // braker: check current pinline, aka ask maker for verification
  // maker: confirm code line
  this.check = function(){
    if (!this.isMuted()) {
        var bleep = new Audio('/audio/bleep2.wav');
        bleep.play();
    }
    if(this.isBraker()){
      this.currentPinline().check();
    }else{
      this.codeline.check();
    }
  }

  // clear the current pinline
  this.clear = function(){
    if (!this.isMuted()) {
        var bleep = new Audio('/audio/bleep2.wav');
        bleep.play();
    }
    if(this.isBraker()){
      this.currentPinline().clear();
    }else{
      this.codeline.clear();
    }
  }

  this.random = function(){

    if (!this.isMuted()) {
        var bleep = new Audio('/audio/bleep2.wav');
        bleep.play();
    }
    if(this.isBraker()){
      this.currentPinline().random();
    }else{
      this.codeline.random();
    }
  }

  this.exit = function() {
    if (!this.isMuted()) {
        var bleep = new Audio('/audio/bleep2.wav');
        bleep.play();
    }
    if (window.confirm("Do you really want to quit this awesome game?")) {
        window.location = "/";
    }         
  }

  this.fullscreen = function() {
    if (!this.isMuted()) {
        var bleep = new Audio('/audio/bleep2.wav');
        bleep.play();
    }

    var elem = document.documentElement;
    var fullscreenButton = document.getElementById('fullscreen-button');

    if(!this.fullscreenOn) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            elem.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        }
    }       
  }

  // execution of 'constructor'
  this.init();
}

// object representation of pin-line in the game
function Pinline(pinline, game, codeline) {
  this.game = game;               // Game instance this Pinline belongs to
  this.element = pinline;         // html element which this Pinline instance represents
  this.done = false;              // whether this Pinline is done, so it cannot be changed anymore
  this.checked = false;           // whether the maker has verified this guess
  this.correct_position = 0;      // how many pins are in the correct position
  this.correct_color = 0;         // how many pins have the right color
  this.correct_position_slider = null;
  this.correct_color_slider = null;
  this.pins = [];                 // all the pins in this pinline
  this.codeline = codeline;

  // 'constructor'
  // will be executed when new Pinline is instanciated
  this.init = function(){
    var pins = this.element.getElementsByClassName("pin");

    for(var i = 0; i < pins.length; i++){
      this.pins.push(new Pin(pins[i], this));
    }

    this.correct_color_slider = this.element.querySelector(".slider-left");
    this.correct_position_slider = this.element.querySelector(".slider-right");

    if(this.correct_color_slider != null && this.correct_position_slider != null){
      this.correct_color_slider.addEventListener("click", this.changeCorrectColor.bind(this));
      this.correct_position_slider.addEventListener("click", this.changeCorrectPosition.bind(this));
    }
  }

  // whether or not this Pinline is done, so whether or not it can still be changed
  this.isDone = function(){
    return this.done;
  }

  this.setDone = function(done){
    this.done = done;
  }

  // whether the maker has verified this Pinline
  this.isChecked = function(){
    return this.checked
  }

  // whether this pinline is the codeline
  this.isCodeline = function() {
      return this.codeline;
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

  this.random = function(){

    var available_colors = ["red", "yellow", "blue", "green", "gray", "purple", "black", "orange"];
    this.clear();
    for(var i = 0; i < this.pins.length; i++){
      var index = Math.floor(Math.random() * 8);
      var color = available_colors[ index ];
      this.pins[i].setColor(color);
    }
  }

  // set colors of pins in this pinline
  // forced = even when it's not this user's turn
  this.forceColors = function(colors){
    for(var i = 0; i < this.pins.length; i++){
      this.pins[i].forceColor(colors[i]);
    }
  }

  // clear all pins in this pinline
  this.clear = function(){
    for(var i = 0; i < this.pins.length; i++){
      this.pins[i].unsetColor();
    }
  }

  this.changeCorrectColor = function(){
    if(!this.game.isMaker() || !this.isDone() || this.checked){
      return false;
    }
    var cl = this.correct_color_slider.classList;

    this.correct_color = this.updateSlider(cl, this.correct_color);
  }

  this.changeCorrectPosition = function(){
    if(!this.game.isMaker() || !this.isDone() || this.checked){
      return false;
    }
    var cl = this.correct_position_slider.classList;

    this.correct_position = this.updateSlider(cl, this.correct_position);
  }

  this.updateSlider = function(cl, current){
    if(current == 0){
      cl.remove('slider-four');
      cl.add("slider-one");
    }
    if(current == 1){
      cl.remove('slider-one');
      cl.add("slider-two");
    }
    if(current == 2){
      cl.remove('slider-two');
      cl.add("slider-three");
    }
    if(current == 3){
      cl.remove('slider-three');
      cl.add("slider-four");
    }
    if(current == 4){
      cl.remove('slider-four');
      current = -1;
    }
    current++;
    return current;
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

    this.forceUnsetColor();
  }

  // unset the color of this pin
  // even if it's not this user's turn
  this.forceUnsetColor = function(){
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
