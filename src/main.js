import { Grid } from './game.js'
let game = new Grid()

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
/** @type {MouseEvent} */
let lastMouseEvent = null
/** @type {MouseEvent} */
let lastClick = null

// Get rid fuzziness on hi-res displays
canv.width = game.width * scaleFactor
canv.height = game.height * scaleFactor
ctx.scale(scaleFactor, scaleFactor)

requestAnimationFrame(function _rAF(timeSinceStart) {
    requestAnimationFrame(_rAF)
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
    const rect = canv.getBoundingClientRect()
    if (!shouldUpdate && lastMouseEvent) {
        const x = Math.floor((lastMouseEvent.clientX - rect.x) / rect.width * game.width)
        const y = Math.floor((lastMouseEvent.clientY - rect.y) / rect.height * game.height)
        ctx.fillStyle = 'yellow'
        ctx.fillRect(x, y, 1, 1)
    }
    if (!shouldUpdate && lastClick) {
        const x = Math.floor((lastMouseEvent.clientX - rect.x) / rect.width * game.width)
        const y = Math.floor((lastMouseEvent.clientY - rect.y) / rect.height * game.height)
        game.setState(x, y, !game.getState(x, y))
        lastClick = null
    }
}

function updateDOM() {
    // Should happen on every frame
    let out = ''
    out += `Grid size: ${game.width}x${game.height}\n`
    // @ts-expect-error
    if (!game._usingBigInts) {
        out += '    Using Uint32 instead of BigUints, update your browser or switch to a desktop :)\n'
    }
    out += `Frames per second (target): ${+targetFPS.value}\n`
    out += `Frames per second (actual): ${TimeController.FPS.toFixed(3)}\n`
    out += `Milliseconds per generation: ${TimeController.deltaTime.toFixed(3)}`
    info.innerHTML === out ? null : info.innerHTML = out
}

// Event listeners
pp.addEventListener('click', function () {
    this.innerHTML = shouldUpdate ? 'Play': 'Pause'
    shouldUpdate = !shouldUpdate
    step.disabled = shouldUpdate
    clear.disabled = shouldUpdate
    random.disabled = shouldUpdate
})
step.addEventListener('click', function () {
    game = game.nextFrame()
    draw()
})
canv.addEventListener('mousemove', function (ev) {
    lastMouseEvent = ev
})
canv.addEventListener('click', function (ev) {
    lastMouseEvent = ev
    lastClick = ev
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
