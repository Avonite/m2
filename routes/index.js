var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/splash", function (req, res) {
    res.sendFile("index.html", {root: "./public"});
});

/* GET game screen */
router.get("/game", function (req, res) {
    res.sendFile("game.html", {root: "./public"});
});

module.exports = router;
