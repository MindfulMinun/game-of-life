//@ts-check
import { Grid } from './game.js'
import GamepadController from './GamepadController.js'
let game = new Grid()


/** Keeps track of time */
const TimeController = {
    /** @private */
    lastTime: 0,
    penultimate: 0,
    /** The current relative time */
    get now() {
        return (performance && performance.now) ? performance.now() : +new Date
    },
    /**
     * Call this function after a redraw.
     * 
     * If used in a `requestAnimationFrame` callback, please pass the timestamp for higher accuracy
     * @param {number} [time]
     */
    update(time) {
        this.penultimate = this.lastTime
        this.lastTime = time || TimeController.now
    },
    /** The time difference between two calls */
    get deltaTime() {
        return (this.lastTime - this.penultimate)
    },
    /**
     * Calculates the time since the last update relative to the given time
     * @param {number} time
     */
    deltaSince(time) {
        return (time - this.lastTime)
    },
    /** Approximate number of calls in a second */
    get FPS() {
        return 1000 / this.deltaTime
    }
}

/** Keeps track of the cursor, since it can be controlled by various interfaces (mouse, keyboard, gamepad, etc) */
const CursorController = {
    _x: Math.floor(game.width / 2),
    _y: Math.floor(game.height / 2),
    _isClicking: false,
    /**
     * @param {number} x
     * @param {number} y
     */
    setCoords(x, y) {
        this._x = x
        this._y = y
    },
    registerClick() {
        this._isClicking = true
    },
    /**
     * @param {number} dx
     * @param {number} dy
     */
    move(dx, dy) {
        this.x += dx
        this.y += dy
    },
    get x() {
        return this._x
    },
    get y() {
        return this._y
    },
    set x(pos) { this._x = Math.max(0, Math.min(game.width - 1, pos)) },
    set y(pos) { this._y = Math.max(0, Math.min(game.height - 1, pos)) },
    get coords() {
        return [this.x, this.y]
    },
    get didClick() {
        return this._isClicking
    }
}

/** Keeps track of the gamepad */
const GC = new GamepadController({ log: true })

const canv = document.querySelector('canvas')
const info = document.getElementById('info')

/** @type {HTMLInputElement} */
const targetFPS = (/** @type {HTMLInputElement} */ document.getElementById('targetfps'))
/** @type {HTMLButtonElement} */
const pp = (/** @type {HTMLButtonElement} */ document.getElementById('pp'))
/** @type {HTMLButtonElement} */
const step = (/** @type {HTMLButtonElement} */ document.getElementById('step'))
/** @type {HTMLButtonElement} */
const clear = (/** @type {HTMLButtonElement} */ document.getElementById('clear'))
/** @type {HTMLButtonElement} */
const random = (/** @type {HTMLButtonElement} */ document.getElementById('random'))

const ctx = canv.getContext('2d')
const dpr = window.devicePixelRatio || 1
// Scale factor = Pixel density * width of output / width of coord sys
const scaleFactor = dpr * (640 / game.width)

let shouldUpdate = false
let lastCursorCellState = false
let controllerMoveSlow = false

// Get rid fuzziness on hi-res displays
canv.width = game.width * scaleFactor
canv.height = game.height * scaleFactor
ctx.scale(scaleFactor, scaleFactor)

requestAnimationFrame(function _rAF(timeSinceStart) {
    requestAnimationFrame(_rAF)
    handleGamepad()
    updateDOM()
    draw()

    if (TimeController.deltaSince(timeSinceStart) < 1000 / +targetFPS.value) return
    TimeController.update(timeSinceStart)

    if (shouldUpdate) { game = game.nextFrame() }
})

function draw() {
    // Coordinate system: 64x64
    ctx.clearRect(0, 0, game.width, game.height)
    // Draw the boxes on the grid
    ctx.fillStyle = '#9e9e9e'
    for (let x = 0; x < game.width; x++) {
        for (let y = 0; y < game.height; y++) {
            // If the cell at x, y is alive, draw it
            if (game.getState(x, y)) {
                ctx.fillRect(x, y, 1, 1)
            }
        }
    }
    
    // Draw cursor
    const [x, y] = CursorController.coords
    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = .25
    const halfWidth = .25 / 2
    ctx.strokeRect(x - halfWidth , y - halfWidth , 1 + halfWidth, 1 + halfWidth)

    if (shouldUpdate) {
        CursorController._isClicking = false
    }
    if (CursorController.didClick) {
        game.setState(x, y, !game.getState(x, y))
        CursorController._isClicking = false
    }
}

function updateDOM() {
    // Should happen on every frame
    let out = ''
    const [x, y] = CursorController.coords
    out += `Cursor position: ${x}, ${y}\n`
    out += `  State of cell @ cursor: ${game.getState(x, y) ? 'alive': 'dead'}\n`
    out += `  Next state of cell: ${game.nextStateOf(x, y) ? 'alive': 'dead'}\n`
    out += `Grid size: ${game.width}x${game.height}\n`
    // @ts-expect-error
    if (!game._usingBigInts) {
        out += '  Using Uint32 instead of BigUints, update your browser or switch to a desktop :)\n'
    }
    out += `  Current generation: ${game.currentGeneration}\n`
    out += `  Candidate cells: ${game.candidates.size}\n`
    out += `Frames per second (target): ${+targetFPS.value}\n`
    out += `Frames per second (actual): ${TimeController.FPS.toFixed(3)}\n`
    out += `Milliseconds per generation: ${TimeController.deltaTime.toFixed(3)}`
    info.innerHTML === out ? null : info.innerHTML = out
}

/** Handles gamepad inputs */
function handleGamepad() {
    GC.initFrame()
    // console.log(controllerController.state)

    if (!GC.state) return

    // Move axes
    const [dx, dy] = GC.getAxes().map(Math.round)
    if (controllerMoveSlow) {
        const [ldx, ldy] = GC.getAxes(GC.previousState).map(Math.round)
        if (dx !== ldx) {
            CursorController.move(dx, 0)
        }
        if (dy !== ldy) {
            CursorController.move(0, dy)
        }
    } else {
        CursorController.move(dx, dy)
    }

    // Check for clicks
    if (GC.didPress('A') || GC.didPress('B')) {
        CursorController.registerClick()
    }
    if (GC.didPress('Y')) {
        shouldUpdate = !shouldUpdate
    }
    if (GC.didPress('X')) {
        game = game.nextFrame()
    }
    // GamepadController.getButton()
    if (GC.didPress('Lstick')) {
        controllerMoveSlow = !controllerMoveSlow
    }
    if (GC.getButton('Rb').pressed || GC.getButton('Rt').pressed) {
        targetFPS.valueAsNumber += 1
    }
    if (GC.getButton('Lb').pressed || GC.getButton('Lt').pressed) {
        targetFPS.valueAsNumber -= 1
    }

    // D-Pad
    if (GC.didPress('Up')) { CursorController.move(0, -1); }
    if (GC.didPress('Down')) { CursorController.move(0, 1); }
    if (GC.didPress('Left')) { CursorController.move(-1, 0); }
    if (GC.didPress('Right')) { CursorController.move(1, 0); }

    // Do vibration
    const gp = GC.state
    // If there's no vibration motor then just continue
    // @ts-expect-error
    if (!gp || !gp.vibrationActuator) return
    // @ts-expect-error
    if (!gp.vibrationActuator && gp.vibrationActuator.playEffect) return
    
    // If the state has changed, play a short vibration
    const [x, y] = CursorController.coords
    if (lastCursorCellState !== game.getState(x, y)) {
        // @ts-expect-error
        gp.vibrationActuator.playEffect(gp.vibrationActuator.type, {
            strongMagnitude: .4,
            weakMagnitude: .4,
            duration: 15
        })
    }
    lastCursorCellState = game.getState(x, y)
}

// Event listeners
pp.addEventListener('click', function () {
    shouldUpdate = !shouldUpdate
    this.innerHTML = shouldUpdate ? 'Pause': 'Play'
    step.disabled = shouldUpdate
    clear.disabled = shouldUpdate
    random.disabled = shouldUpdate
})
step.addEventListener('click', function () {
    game = game.nextFrame()
    draw()
})
canv.addEventListener('mousemove', function (ev) {
    const rect = canv.getBoundingClientRect()
    const x = Math.floor((ev.clientX - rect.x) / rect.width * game.width)
    const y = Math.floor((ev.clientY - rect.y) / rect.height * game.height)
    CursorController.setCoords(x, y)
})
canv.addEventListener('click', function (ev) {
    const rect = canv.getBoundingClientRect()
    const x = Math.floor((ev.clientX - rect.x) / rect.width * game.width)
    const y = Math.floor((ev.clientY - rect.y) / rect.height * game.height)
    CursorController.setCoords(x, y)
    CursorController.registerClick()
})
document.addEventListener('keydown', function (ev) {
    // Keybindings (QWERTY)
    // Movement: WASD, Arrows
    // Toggle cell: J, 1, Z, Enter
    // Play/Pause: K, 2, X, Space
    // Step: L, 3, C
    switch (ev.code) {
        case "KeyW":
        case "ArrowUp":
            ev.preventDefault()
            return CursorController.move(0, -1)
        case "KeyA":
        case "ArrowLeft":
            ev.preventDefault()
            return CursorController.move(-1, 0)
        case "KeyS":
        case "ArrowDown":
            ev.preventDefault()
            return CursorController.move(0, 1)
        case "KeyD":
        case "ArrowRight":
            ev.preventDefault()
            return CursorController.move(1, 0)
        case "KeyJ":
        case "KeyZ":
        case "Digit1":
        case "Enter":
            ev.preventDefault()
            return CursorController.registerClick()
        case "KeyK":
        case "KeyX":
        case "Digit2":
        case "Space":
            shouldUpdate = !shouldUpdate
            break
        case "KeyL":
        case "KeyC":
        case "Digit3":
            game = game.nextFrame()
            break
    }
})
clear.addEventListener('click', function () {
    game = new Grid()
})
random.addEventListener('click', function () {
    game = new Grid()
    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            const chance = Math.floor(Math.random() * 2)
            if (chance) {
                game.setState(i, j, true)
            }
        }
    }
})
pp.disabled = false
step.disabled = false
clear.disabled = false
random.disabled = false


// Draw some cells on the grid so the user doesn't just sit there with nothing to do
// Infinite growth thingy
;(minigrid => {
    const OFFSET = game.width / 2 - 3
    for (let i = 0; i < minigrid.length; i++) {
        const y = i + OFFSET
        for (let j = 0; j < 5; j++) {
            const x = j + OFFSET
            if (minigrid[i] & (2 ** j)) {
                game.setState(x, y, true)
            }
        }
    }
})([
    0b11101,
    0b10000,
    0b00011,
    0b01101,
    0b10101
])

document.documentElement.classList.remove('no-js')
document.documentElement.classList.add('js')
