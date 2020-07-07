"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Names of buttons on a standard gamepad
 * @typedef GamepadStandardButtonName
 * @type {
    'A'|
    'B'|
    'X'|
    'Y'|
    'Lb'|
    'Rb'|
    'Lt'|
    'Rt'|
    'Start'|
    'Select'|
    'Home'|
    'Lstick'|
    'Rstick'|
    'Up'|
    'Down'|
    'Left'|
    'Right'
}
 */
var GamepadController = /*#__PURE__*/function () {
  function GamepadController(settings) {
    _classCallCheck(this, GamepadController);

    /**
     * @type {?Gamepad}
     * @private
     */
    this._previousState = null;
    /**
     * @type {?Gamepad}
     * @private
     */

    this._currentState = null;
    this.log = !!(settings && settings.log);
  }
  /**
   * Initializes the controller state for this frame. This method must be called on every actionable frame.
   */


  _createClass(GamepadController, [{
    key: "initFrame",
    value: function initFrame() {
      var controller = this.previousState ? navigator.getGamepads()[this.previousState.index] : Array.from(navigator.getGamepads()).find(function (g) {
        return g && g.mapping === 'standard';
      });
      this._previousState = this._currentState;
      this._currentState = controller;

      if (this.log) {
        var out = '';

        for (var i = 0; i < GamepadController.standardNameMap.length; i++) {
          var name = GamepadController.standardNameMap[i];
          var btn = this.getButton(i);
          var last = this.getButton(i, this.previousState);
          if (btn.pressed && !last.pressed) out += name + ' ';
        }

        out && console.log("Pressed: ".concat(out));
      }
    }
    /** 
     * The state of the gamepad as it was the previous frame
     */

  }, {
    key: "getButton",

    /**
     * Gets the button on the current controller, or the provided one.
     * @param {GamepadStandardButtonName|number} button 
     * @param {Gamepad} [controller] 
     * @returns {GamepadButton}
     */
    value: function getButton(button, controller) {
      controller = controller || this.state;
      if (!controller) return {
        pressed: false,
        touched: false,
        value: 0
      };
      var index = typeof button === 'number' ? button : GamepadController.standardNameMap.indexOf(button);
      if (index < 0) throw Error("Invalid button");
      return controller.buttons[index];
    }
    /**
     * Gets the axes for the current controller, or the provided one
     * @param {Gamepad} [controller] 
     */

  }, {
    key: "getAxes",
    value: function getAxes(controller) {
      controller = controller || this.state;
      if (!controller) return [0, 0, 0, 0];
      return controller.axes.slice(0, 4);
    }
    /**
     * Returns true if the given button is pressed now, but wasn't previously.
     * @param {GamepadStandardButtonName|number} button 
     * @returns {boolean}
     */

  }, {
    key: "didPress",
    value: function didPress(button) {
      if (!this.state) return false;
      var prev = this.getButton(button, this.previousState).pressed;
      var now = this.getButton(button).pressed; // Pressed now, but not previously

      return now && !prev;
    }
    /**
     * Returns true if the given button was pressed previously, but isn't anymore.
     * @param {GamepadStandardButtonName|number} button
     * @returns {boolean} 
     */

  }, {
    key: "didRelease",
    value: function didRelease(button) {
      if (!this.state) return false;
      var prev = this.getButton(button, this.previousState).pressed;
      var now = this.getButton(button).pressed; // Pressed previously, but not anymore

      return prev && !now;
    }
    /** 
     * Maps names of standard gamepad buttons to indexes
     * @type {GamepadStandardButtonName[]}
     */

  }, {
    key: "previousState",
    get: function get() {
      return this._previousState;
    }
    /** The state of the gamepad this current frame */

  }, {
    key: "state",
    get: function get() {
      return this._currentState;
    }
  }]);

  return GamepadController;
}();

exports["default"] = GamepadController;

_defineProperty(GamepadController, "standardNameMap", [// Face cluster
'B', 'A', 'Y', 'X', // Triggers & bumpers
'Lb', 'Rb', 'Lt', 'Rt', // Center cluster
'Select', 'Start', // Sticks
'Lstick', 'Rstick', // D-pad cluster
'Up', 'Down', 'Left', 'Right', // Center button
'Home']);