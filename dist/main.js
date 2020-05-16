"use strict";

var _game = require("./game.js");

var game = new _game.Grid();
game.setState(2, 1, true);
game.setState(3, 1, true);
game.setState(4, 1, true);
game.setState(1, 2, true);
game.setState(2, 2, true);
game.setState(3, 2, true);
setInterval(function () {
  game = game.nextFrame();
  console.log(game.toString());
}, 0);