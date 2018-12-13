// renders splash.ejs template with current number of games

const Games = require("../modules/Games");

module.exports.show = function(req, res){
  res.render("splash", {games: Games.size(),});
}
