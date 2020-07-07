"use strict";

var _game = require("./game.js");

var _GamepadController = _interopRequireDefault(require("./GamepadController.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var game = new _game.Grid();
/** Keeps track of time */

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
/** Keeps track of the cursor, since it can be controlled by various interfaces (mouse, keyboard, gamepad, etc) */

var CursorController = {
  _x: Math.floor(game.width / 2),
  _y: Math.floor(game.height / 2),
  _isClicking: false,

  /**
   * @param {number} x
   * @param {number} y
   */
  setCoords: function setCoords(x, y) {
    this._x = x;
    this._y = y;
  },
  registerClick: function registerClick() {
    this._isClicking = true;
  },

  /**
   * @param {number} dx
   * @param {number} dy
   */
  move: function move(dx, dy) {
    this.x += dx;
    this.y += dy;
  },

  get x() {
    return this._x;
  },

  get y() {
    return this._y;
  },

  set x(pos) {
    this._x = Math.max(0, Math.min(game.width - 1, pos));
  },

  set y(pos) {
    this._y = Math.max(0, Math.min(game.height - 1, pos));
  },

  get coords() {
    return [this.x, this.y];
  },

  get didClick() {
    return this._isClicking;
  }

};
/** Keeps track of the gamepad */

var GC = new _GamepadController["default"]({
  log: true
});
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
var lastCursorCellState = false;
var controllerMoveSlow = false; // Get rid fuzziness on hi-res displays

canv.width = game.width * scaleFactor;
canv.height = game.height * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);
requestAnimationFrame(function _rAF(timeSinceStart) {
  requestAnimationFrame(_rAF);
  handleGamepad();
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

  for (var _x = 0; _x < game.width; _x++) {
    for (var _y = 0; _y < game.height; _y++) {
      // If the cell at x, y is alive, draw it
      if (game.getState(_x, _y)) {
        ctx.fillRect(_x, _y, 1, 1);
      }
    }
  } // Draw cursor


  var _CursorController$coo = _slicedToArray(CursorController.coords, 2),
      x = _CursorController$coo[0],
      y = _CursorController$coo[1];

  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = .25;
  var halfWidth = .25 / 2;
  ctx.strokeRect(x - halfWidth, y - halfWidth, 1 + halfWidth, 1 + halfWidth);

  if (shouldUpdate) {
    CursorController._isClicking = false;
  }

  if (CursorController.didClick) {
    game.setState(x, y, !game.getState(x, y));
    CursorController._isClicking = false;
  }
}

function updateDOM() {
  // Should happen on every frame
  var out = '';

  var _CursorController$coo2 = _slicedToArray(CursorController.coords, 2),
      x = _CursorController$coo2[0],
      y = _CursorController$coo2[1];

  out += "Cursor position: ".concat(x, ", ").concat(y, "\n");
  out += "  State of cell @ cursor: ".concat(game.getState(x, y) ? 'alive' : 'dead', "\n");
  out += "  Next state of cell: ".concat(game.nextStateOf(x, y) ? 'alive' : 'dead', "\n");
  out += "Grid size: ".concat(game.width, "x").concat(game.height, "\n"); // @ts-expect-error

  if (!game._usingBigInts) {
    out += '  Using Uint32 instead of BigUints, update your browser or switch to a desktop :)\n';
  }

  out += "  Current generation: ".concat(game.currentGeneration, "\n");
  out += "  Candidate cells: ".concat(game.candidates.size, "\n");
  out += "Frames per second (target): ".concat(+targetFPS.value, "\n");
  out += "Frames per second (actual): ".concat(TimeController.FPS.toFixed(3), "\n");
  out += "Milliseconds per generation: ".concat(TimeController.deltaTime.toFixed(3));
  info.innerHTML === out ? null : info.innerHTML = out;
}
/** Handles gamepad inputs */


function handleGamepad() {
  GC.initFrame(); // console.log(controllerController.state)

  if (!GC.state) return; // Move axes

  var _GC$getAxes$map = GC.getAxes().map(Math.round),
      _GC$getAxes$map2 = _slicedToArray(_GC$getAxes$map, 2),
      dx = _GC$getAxes$map2[0],
      dy = _GC$getAxes$map2[1];

  if (controllerMoveSlow) {
    var _GC$getAxes$map3 = GC.getAxes(GC.previousState).map(Math.round),
        _GC$getAxes$map4 = _slicedToArray(_GC$getAxes$map3, 2),
        ldx = _GC$getAxes$map4[0],
        ldy = _GC$getAxes$map4[1];

    if (dx !== ldx) {
      CursorController.move(dx, 0);
    }

    if (dy !== ldy) {
      CursorController.move(0, dy);
    }
  } else {
    CursorController.move(dx, dy);
  } // Check for clicks


  if (GC.didPress('A') || GC.didPress('B')) {
    CursorController.registerClick();
  }

  if (GC.didPress('Y')) {
    shouldUpdate = !shouldUpdate;
  }

  if (GC.didPress('X')) {
    game = game.nextFrame();
  } // GamepadController.getButton()


  if (GC.didPress('Lstick')) {
    controllerMoveSlow = !controllerMoveSlow;
  }

  if (GC.getButton('Rb').pressed || GC.getButton('Rt').pressed) {
    targetFPS.valueAsNumber += 1;
  }

  if (GC.getButton('Lb').pressed || GC.getButton('Lt').pressed) {
    targetFPS.valueAsNumber -= 1;
  } // D-Pad


  if (GC.didPress('Up')) {
    CursorController.move(0, -1);
  }

  if (GC.didPress('Down')) {
    CursorController.move(0, 1);
  }

  if (GC.didPress('Left')) {
    CursorController.move(-1, 0);
  }

  if (GC.didPress('Right')) {
    CursorController.move(1, 0);
  } // Do vibration


  var gp = GC.state; // If there's no vibration motor then just continue
  // @ts-expect-error

  if (!gp || !gp.vibrationActuator) return; // @ts-expect-error

  if (!gp.vibrationActuator && gp.vibrationActuator.playEffect) return; // If the state has changed, play a short vibration

  var _CursorController$coo3 = _slicedToArray(CursorController.coords, 2),
      x = _CursorController$coo3[0],
      y = _CursorController$coo3[1];

  if (lastCursorCellState !== game.getState(x, y)) {
    // @ts-expect-error
    gp.vibrationActuator.playEffect(gp.vibrationActuator.type, {
      strongMagnitude: .4,
      weakMagnitude: .4,
      duration: 15
    });
  }

  lastCursorCellState = game.getState(x, y);
} // Event listeners


pp.addEventListener('click', function () {
  shouldUpdate = !shouldUpdate;
  this.innerHTML = shouldUpdate ? 'Pause' : 'Play';
  step.disabled = shouldUpdate;
  clear.disabled = shouldUpdate;
  random.disabled = shouldUpdate;
});
step.addEventListener('click', function () {
  game = game.nextFrame();
  draw();
});
canv.addEventListener('mousemove', function (ev) {
  var rect = canv.getBoundingClientRect();
  var x = Math.floor((ev.clientX - rect.x) / rect.width * game.width);
  var y = Math.floor((ev.clientY - rect.y) / rect.height * game.height);
  CursorController.setCoords(x, y);
});
canv.addEventListener('click', function (ev) {
  var rect = canv.getBoundingClientRect();
  var x = Math.floor((ev.clientX - rect.x) / rect.width * game.width);
  var y = Math.floor((ev.clientY - rect.y) / rect.height * game.height);
  CursorController.setCoords(x, y);
  CursorController.registerClick();
});
document.addEventListener('keydown', function (ev) {
  // Keybindings (QWERTY)
  // Movement: WASD, Arrows
  // Toggle cell: J, 1, Z, Enter
  // Play/Pause: K, 2, X, Space
  // Step: L, 3, C
  switch (ev.code) {
    case "KeyW":
    case "ArrowUp":
      ev.preventDefault();
      return CursorController.move(0, -1);

    case "KeyA":
    case "ArrowLeft":
      ev.preventDefault();
      return CursorController.move(-1, 0);

    case "KeyS":
    case "ArrowDown":
      ev.preventDefault();
      return CursorController.move(0, 1);

    case "KeyD":
    case "ArrowRight":
      ev.preventDefault();
      return CursorController.move(1, 0);

    case "KeyJ":
    case "KeyZ":
    case "Digit1":
    case "Enter":
      ev.preventDefault();
      return CursorController.registerClick();

    case "KeyK":
    case "KeyX":
    case "Digit2":
    case "Space":
      shouldUpdate = !shouldUpdate;
      break;

    case "KeyL":
    case "KeyC":
    case "Digit3":
      game = game.nextFrame();
      break;
  }
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

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');