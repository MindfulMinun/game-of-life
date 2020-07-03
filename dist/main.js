"use strict";

var _game = require("./game.js");

var game = new _game.Grid();
var TimeController = {
  /** @private */
  lastTime: 0,
  penultimate: 0,

  /** The current relative time */
  get now() {
    return performance && performance.now ? performance.now() : +new Date();
  },

  /**
   * Call this function after a redraw.
   * 
   * If used in a `requestAnimationFrame` callback, please pass the timestamp for higher accuracy
   * @param {number} [time]
   */
  update: function update(time) {
    this.penultimate = this.lastTime;
    this.lastTime = time || TimeController.now;
  },

  /** The time difference between two calls */
  get deltaTime() {
    return this.lastTime - this.penultimate;
  },

  /**
   * Calculates the time since the last update relative to the given time
   * @param {number} time
   */
  deltaSince: function deltaSince(time) {
    return time - this.lastTime;
  },

  /** Approximate number of calls in a second */
  get FPS() {
    return 1000 / this.deltaTime;
  }

};
var canv = document.querySelector('canvas');
var info = document.getElementById('info');
/** @type {HTMLInputElement} */

var targetFPS =
/** @type {HTMLInputElement} */
document.getElementById('targetfps');
/** @type {HTMLButtonElement} */

var pp =
/** @type {HTMLButtonElement} */
document.getElementById('pp');
/** @type {HTMLButtonElement} */

var step =
/** @type {HTMLButtonElement} */
document.getElementById('step');
/** @type {HTMLButtonElement} */

var clear =
/** @type {HTMLButtonElement} */
document.getElementById('clear');
/** @type {HTMLButtonElement} */

var random =
/** @type {HTMLButtonElement} */
document.getElementById('random');
var ctx = canv.getContext('2d');
var dpr = window.devicePixelRatio || 1; // Scale factor = Pixel density * width of output / width of coord sys

var scaleFactor = dpr * (640 / game.width);
var shouldUpdate = false;
/** @type {MouseEvent} */

var lastMouseEvent = null;
/** @type {MouseEvent} */

var lastClick = null; // Get rid fuzziness on hi-res displays

canv.width = game.width * scaleFactor;
canv.height = game.height * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);
requestAnimationFrame(function _rAF(timeSinceStart) {
  requestAnimationFrame(_rAF);
  updateDOM();
  draw();
  if (TimeController.deltaSince(timeSinceStart) < 1000 / +targetFPS.value) return;
  TimeController.update(timeSinceStart);

  if (shouldUpdate) {
    game = game.nextFrame();
  }
});

function draw() {
  // Coordinate system: 64x64
  ctx.clearRect(0, 0, game.width, game.height); // Draw the boxes on the grid

  ctx.fillStyle = '#9e9e9e';

  for (var x = 0; x < game.width; x++) {
    for (var y = 0; y < game.height; y++) {
      // If the cell at x, y is alive, draw it
      if (game.getState(x, y)) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  } // Draw cursor


  var rect = canv.getBoundingClientRect();

  if (!shouldUpdate && lastMouseEvent) {
    var _x = Math.floor((lastMouseEvent.clientX - rect.x) / rect.width * game.width);

    var _y = Math.floor((lastMouseEvent.clientY - rect.y) / rect.height * game.height);

    ctx.fillStyle = 'yellow';
    ctx.fillRect(_x, _y, 1, 1);
  }

  if (!shouldUpdate && lastClick) {
    var _x2 = Math.floor((lastMouseEvent.clientX - rect.x) / rect.width * game.width);

    var _y2 = Math.floor((lastMouseEvent.clientY - rect.y) / rect.height * game.height);

    game.setState(_x2, _y2, !game.getState(_x2, _y2));
    lastClick = null;
  }
}

function updateDOM() {
  // Should happen on every frame
  var out = '';
  out += "Grid size: ".concat(game.width, "x").concat(game.height, "\n"); // @ts-expect-error

  if (!game._usingBigInts) {
    out += '    Using Uint32 instead of BigUints, update your browser or switch to a desktop :)\n';
  }

  out += "Frames per second (target): ".concat(+targetFPS.value, "\n");
  out += "Frames per second (actual): ".concat(TimeController.FPS.toFixed(3), "\n");
  out += "Milliseconds per generation: ".concat(TimeController.deltaTime.toFixed(3));
  info.innerHTML === out ? null : info.innerHTML = out;
} // Event listeners


pp.addEventListener('click', function () {
  this.innerHTML = shouldUpdate ? 'Play' : 'Pause';
  shouldUpdate = !shouldUpdate;
  step.disabled = shouldUpdate;
  clear.disabled = shouldUpdate;
  random.disabled = shouldUpdate;
});
step.addEventListener('click', function () {
  game = game.nextFrame();
  draw();
});
canv.addEventListener('mousemove', function (ev) {
  lastMouseEvent = ev;
});
canv.addEventListener('click', function (ev) {
  lastMouseEvent = ev;
  lastClick = ev;
});
clear.addEventListener('click', function () {
  game = new _game.Grid();
});
random.addEventListener('click', function () {
  game = new _game.Grid();

  for (var i = 0; i < game.width; i++) {
    for (var j = 0; j < game.height; j++) {
      var chance = Math.floor(Math.random() * 2);

      if (chance) {
        game.setState(i, j, true);
      }
    }
  }
});
pp.disabled = false;
step.disabled = false;
clear.disabled = false;
random.disabled = false // Draw some cells on the grid so the user doesn't just sit there with nothing to do
// Infinite growth thingy
;

(function (minigrid) {
  var OFFSET = game.width / 2 - 3;

  for (var i = 0; i < minigrid.length; i++) {
    var y = i + OFFSET;

    for (var j = 0; j < 5; j++) {
      var x = j + OFFSET;

      if (minigrid[i] & Math.pow(2, j)) {
        game.setState(x, y, true);
      }
    }
  }
})([29, 16, 3, 13, 21]);
