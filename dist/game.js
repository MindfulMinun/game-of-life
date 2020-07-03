"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Grid = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * JavaScript implementation of Conway's Game of Life
 * @author MindfulMinun
 * @since 2020-05-14
 */
var Grid = /*#__PURE__*/function () {
  /**
   * @param {Grid} [grid] The previous grid
   */
  function Grid(grid) {
    _classCallCheck(this, Grid);

    if (typeof BigUint64Array !== 'undefined') {
      /**
       * A 64x64 grid of alive or dead cells
       * @type {BigUint64Array | Uint32Array}
       */
      this.cells = new BigUint64Array(64);
      /** Number of vertical cells */

      this.height = 64;
      /** Number of horizontal cells */

      this.width = 64;
      /**
       * Checking if BigInts supported for progressive enhancement
       * @private
       */

      this._usingBigInts = true;
    } else {
      this.cells = new Uint32Array(32);
      this.height = 32;
      this.width = 32;
      this._usingBigInts = false;
    }
    /**
     * How should the state of the cells beyond the boundary react?
     * @type {'dead' | 'alive'}
     */


    this.beyondCellState = 'dead';
    /**
     * This grid state's current generation
     * @type {number}
     */

    this.currentGeneration = 0;

    if (grid) {
      this.cells = grid.cells.slice();
      this.currentGeneration = grid.currentGeneration + 1;
      this.beyondCellState = grid.beyondCellState;
    }
    /**
     * Keeps track of cells that may have changed state.
     * @type {Set<string>}
     */


    this.candidates = new Set();
  }
  /**
   * Calculates the next generation given the grid's current state
   * @returns {Grid} The next generation.
   */


  _createClass(Grid, [{
    key: "nextFrame",
    value: function nextFrame() {
      var next = new Grid(this);

      var actualCandidates = _toConsumableArray(this.candidates.values());

      for (var i = 0; i < actualCandidates.length; i++) {
        var _actualCandidates$i$s = actualCandidates[i].split(',').map(function (x) {
          return +x;
        }),
            _actualCandidates$i$s2 = _slicedToArray(_actualCandidates$i$s, 2),
            x = _actualCandidates$i$s2[0],
            y = _actualCandidates$i$s2[1];

        if (this.getState(x, y) !== this.nextStateOf(x, y)) {
          next.setState(x, y, this.nextStateOf(x, y));
        }
      }

      return next;
    }
    /**
     * Sets the state of the cell at (x, y)
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @param {boolean} state Whether to set to dead (false) or alive (true)
     */

  }, {
    key: "setState",
    value: function setState(x, y, state) {
      // Push eight neighbors as candidates
      // x x x
      // x O x   O is the cell that changed
      // x x x
      if (x < 0 || this.width <= x) return;
      if (y < 0 || this.height <= y) return; // Top row

      this.candidates.add("".concat(x - 1, ",").concat(y - 1));
      this.candidates.add("".concat(x + 0, ",").concat(y - 1));
      this.candidates.add("".concat(x + 1, ",").concat(y - 1)); // Center row

      this.candidates.add("".concat(x - 1, ",").concat(y + 0));
      this.candidates.add("".concat(x + 0, ",").concat(y + 0));
      this.candidates.add("".concat(x + 1, ",").concat(y + 0)); // Bottom row

      this.candidates.add("".concat(x - 1, ",").concat(y + 1));
      this.candidates.add("".concat(x + 0, ",").concat(y + 1));
      this.candidates.add("".concat(x + 1, ",").concat(y + 1));
      this.cells[y] = this.cells[y]; // What's better: (2 ** n) or (1 << n)?
      // Because (2 ** n) isn't bounded by JavaScript bitwise operations
      // and because the typed array inherently bounds our entries,
      // I'll be using 2 ** n operations so operations don't get bounded twice

      if (this._usingBigInts) {
        if (state) {
          this.cells[y] = this.cells[y] | BigInt(Math.pow(2, x));
        } else {
          this.cells[y] = this.cells[y] & BigInt(~Math.pow(2, x));
        }
      } else {
        if (state) {
          this.cells[y] = this.cells[y] | Math.pow(2, x);
        } else {
          this.cells[y] = this.cells[y] & ~Math.pow(2, x);
        }
      }
    }
    /**
     * Gets the state of the cell at (x, y)
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @returns {boolean} The state of the cell, dead (false) or alive (true)
     */

  }, {
    key: "getState",
    value: function getState(x, y) {
      // Assume cells past the border are always true
      if (x < 0 || this.width <= x) return this.beyondCellState === 'alive';
      if (y < 0 || this.height <= y) return this.beyondCellState === 'alive'; // return (this.cells[y] & BigInt((2 ** x))) !== 0n

      if (this._usingBigInts) {
        return (this.cells[y] & Math.pow(2n, BigInt(x))) != 0;
      }

      return (this.cells[y] & Math.pow(2, x)) != 0;
    }
    /**
     * Checks the 8 neighbors of the cell at (x, y), and determines whether the cell should be dead or alive in the next generation
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @returns {boolean} The next generation state of the cell, dead (false) or alive (true)
     */

  }, {
    key: "nextStateOf",
    value: function nextStateOf(x, y) {
      // Cell life/death is dependent on number of neighbors
      // Any live cell with two or three live neighbours survives.
      // Any dead cell with three live neighbours becomes a live cell.
      // All other live cells die in the next generation. Similarly, all other dead cells stay dead
      var alive = this.getState(x, y);
      var aliveNeighbors = [// Top row
      this.getState(x - 1, y - 1), this.getState(x + 0, y - 1), this.getState(x + 1, y - 1), // Center row
      this.getState(x - 1, y + 0), // this.getState(x + 0, y + 0),
      this.getState(x + 1, y + 0), // Bottom row
      this.getState(x - 1, y + 1), this.getState(x + 0, y + 1), this.getState(x + 1, y + 1)].filter(function (x) {
        return !!x;
      }); // If the cell is alive, then it stays alive if it has either 2 or 3 live neighbors
      // If the cell is dead, then it springs to life only in the case that it has 3 live neighbors

      if (alive) {
        return aliveNeighbors.length === 2 || aliveNeighbors.length === 3;
      } else {
        return aliveNeighbors.length === 3;
      }
    } // toString() {
    //     let out = ''
    //     for (let i = 0; i < this.cells.length; i++) {
    //         out += this.cells[i].toString(2).padStart(this.width, ' ')
    //             .replace(/0/g, ' ')
    //             .replace(/1/g, '*')
    //         out += '\n'
    //     }
    //     return out
    // }

  }]);

  return Grid;
}();

exports.Grid = Grid;