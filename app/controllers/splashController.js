// ==========================================================================
// = Renders splash.ejs template with current number of games and total     = 
// =     visits. Sets a cookie to track user visits.                        =
// ==========================================================================

const Games = require("../modules/Games");

module.exports.show = function(req, res){
  // Set visits cookie
  var visits;
  // If cookie has not been set, set cookie
  if (req.cookies.visits == undefined) {
    res.cookie('visits', 1, { maxAge: 90000000000 });
    visits = 1;
  } 
  else {
    res.cookie('visits', parseInt(req.cookies.visits) + 1, { maxAge: 9000000000});
    visits = parseInt(req.cookies.visits) + 1;
  }

  res.render("splash", {games: Games, numberOfVisits: visits});
}
