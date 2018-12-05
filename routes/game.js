var express = require("express");
var router = express.Router();

var game_controller     = require("../app/controllers/gameController");
var splash_controller   = require("../app/controllers/splashController");

/* GET Splash Screen */
router.get("/splash", splash_controller.show);

/* GET Game Screen */
router.get("/game", game_controller.show);

module.exports = router;
