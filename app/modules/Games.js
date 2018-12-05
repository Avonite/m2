const Game = require("../models/Game");

module.exports = (function(){

  var games = [];

  function connectUser(user) {
    // Check for games without braker
    for(var i = 0; i < games.length; i++){
      var game = games[i];
      if(game.isAvailable()){
        // if found, set this user as braker
        game.setBraker(user);
        return;
      }
    }

    // if not found, create a new game
    // this user will be the maker
    var game = new Game(user);
    games.push(game);
  }

  return {
    connectUser: connectUser,
  }

})();
