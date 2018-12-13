// ==========================================================================
// =  Games (IIFE) that returns two functions:                              =            
// =  - connectUser:              =
// =               A new user is created when someone connects to this port.= 
// =  - broadcast: sends a message to all open websockets                   =
// ==========================================================================



const Game = require("../models/Game");
const wss = require("../communication/webSocketServer");

module.exports = (function(){

  var games = [];

  function connectUser(user) {
    // Check for games without braker
    for(var i = 0; i < games.length; i++){
      var game = games[i];
      if(game.isAvailable()){
        // if found, set this user as braker
        game.setBraker(user);
        wss.broadcast({action: 'playerWaitingChange', props: {playerIsWaiting: false}});
        return;
      }
    }

    // if not found, create a new game
    // this user will be the maker
    var game = new Game(user);
    games.push(game);
    wss.broadcast({action: 'playerWaitingChange', props: {playerIsWaiting: true}});
  }

  // get amount of active games
  function size(){
    var size = 0;

    for(var i = 0; i < games.length; i++){
      if(games[i].isActive()){
        size++;
      }
    }

    return size;
  }

  return {
    connectUser: connectUser,
    size: size,
  }

})();
