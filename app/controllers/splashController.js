// ==========================================================================
// = Renders splash.ejs template with current number of games               =
// ==========================================================================

const Games = require("../modules/Games");

module.exports.show = function(req, res){
  // If cookie has not been set, set cookie
  if (req.cookies.visits == undefined) {
    res.cookie('visits', 1, { maxAge: 90000000000 });
  } 
  else {
    res.cookie('visits', parseInt(req.cookies.visits) + 1, { maxAge: 9000000000});
  }
  res.render("splash", {games: Games.size(),});
}
