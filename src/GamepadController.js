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
export default class GamepadController {
    constructor(settings) {
        /**
         * @type {?Gamepad}
         * @private
         */
        this._previousState = null
        /**
         * @type {?Gamepad}
         * @private
         */
        this._currentState = null
        this.log = !!(settings && settings.log)
    }

    /**
     * Initializes the controller state for this frame. This method must be called on every actionable frame.
     */
    initFrame() {
        const controller = this.previousState ?
            navigator.getGamepads()[this.previousState.index] :
            Array.from(navigator.getGamepads()).find(g => g && g.mapping === 'standard')
        this._previousState = this._currentState
        this._currentState = controller

        if (this.log) {
            let out = ''
            for (let i = 0; i < GamepadController.standardNameMap.length; i++) {
                const name = GamepadController.standardNameMap[i]
                const btn = this.getButton(i)
                const last = this.getButton(i, this.previousState)
                if (btn.pressed && !last.pressed) out += name + ' '
            }
            out && console.log(`Pressed: ${out}`)
        }
    }
    /** 
     * The state of the gamepad as it was the previous frame
     */
    get previousState() {
        return this._previousState
    }

    /** The state of the gamepad this current frame */
    get state() {
        return this._currentState
    }

    /**
     * Gets the button on the current controller, or the provided one.
     * @param {GamepadStandardButtonName|number} button 
     * @param {Gamepad} [controller] 
     * @returns {GamepadButton}
     */
    getButton(button, controller) {
        controller = controller || this.state
        if (!controller) return {
            pressed: false,
            touched: false,
            value: 0
        }
        const index = typeof button === 'number' ?
            button : GamepadController.standardNameMap.indexOf(button)
        if (index < 0) throw Error("Invalid button")
        return controller.buttons[index]
    }

    /**
     * Gets the axes for the current controller, or the provided one
     * @param {Gamepad} [controller] 
     */
    getAxes(controller) {
        controller = controller || this.state
        if (!controller) return [0, 0, 0, 0]
        return controller.axes.slice(0, 4)
    }

    /**
     * Returns true if the given button is pressed now, but wasn't previously.
     * @param {GamepadStandardButtonName|number} button 
     * @returns {boolean}
     */
    didPress(button) {
        if (!this.state) return false
        const prev = this.getButton(button, this.previousState).pressed
        const now = this.getButton(button).pressed

        // Pressed now, but not previously
        return now && !prev
    }

    /**
     * Returns true if the given button was pressed previously, but isn't anymore.
     * @param {GamepadStandardButtonName|number} button
     * @returns {boolean} 
     */
    didRelease(button) {
        if (!this.state) return false
        const prev = this.getButton(button, this.previousState).pressed
        const now = this.getButton(button).pressed

        // Pressed previously, but not anymore
        return prev && !now
    }

    /** 
     * Maps names of standard gamepad buttons to indexes
     * @type {GamepadStandardButtonName[]}
     */
    static standardNameMap = [
       // Face cluster
       'B', 'A', 'Y', 'X',
       // Triggers & bumpers
       'Lb', 'Rb', 'Lt', 'Rt',
       // Center cluster
       'Select', 'Start',
       // Sticks
       'Lstick', 'Rstick',
       // D-pad cluster
       'Up', 'Down', 'Left', 'Right',
       // Center button
       'Home'
   ]
}
