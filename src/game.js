import padStart from 'pad-start'

/**
 * JavaScript implementation of Conway's Game of Life
 * @author MindfulMinun
 * @since 2020-05-14
 */
export class Grid {
    /**
     * @param {Grid} [grid] The previous grid
     */
    constructor(grid) {
        /**
         * A 32x32 grid of alive or dead cells
         * @type {Uint32Array}
         */
        this.cells = new Uint32Array(32)

        /**
         * This grid state's current generation
         * @type {number}
         */
        this.currentGeneration = 0

        if (grid) {
            this.cells = grid.cells.slice()
            this.currentGeneration = grid.currentGeneration + 1
        }
        

        /**
         * Keeps track of cells that may have changed state.
         * @type {Set<string>}
         */
        this.candidates = new Set()
    }

    /**
     * Calculates the next generation given the grid's current state
     * @returns {Grid} The next generation.
     */
    nextFrame() {
        const next = new Grid(this)
        const actualCandidates = [...this.candidates.values()]
        for (let i = 0; i < actualCandidates.length; i++) {
            const [x, y] = actualCandidates[i].split(',').map(x => +x)
            if (this.getState(x, y) !== this.nextStateOf(x, y)) {
                next.setState(x, y, this.nextStateOf(x, y))
            }
        }
        return next
    }

    /**
     * Sets the state of the cell at (x, y)
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @param {boolean} state Whether to set to dead (false) or alive (true)
     */
    setState(x, y, state) {
        // Push eight neighbors as candidates
        // x x x
        // x O x   O is the cell that changed
        // x x x

        if (x < 0 || 32 < x) return
        if (y < 0 || 32 < y) return

        // Top row
        this.candidates.add(`${x - 1},${y - 1}`)
        this.candidates.add(`${x + 0},${y - 1}`)
        this.candidates.add(`${x + 1},${y - 1}`)

        // Center row
        this.candidates.add(`${x - 1},${y + 0}`)
        this.candidates.add(`${x + 0},${y + 0}`)
        this.candidates.add(`${x + 1},${y + 0}`)

        // Bottom row
        this.candidates.add(`${x - 1},${y + 1}`)
        this.candidates.add(`${x + 0},${y + 1}`)
        this.candidates.add(`${x + 1},${y + 1}`)


        this.cells[y] = this.cells[y]

        // What's better: (2 ** n) or (1 << n)?
        // Because (2 ** n) isn't bounded by JavaScript bitwise operations
        // and because the typed array inherently bounds our entries,
        // I'll be using 2 ** n operations so operations don't get bounded twice
        if (state) {
            this.cells[y] = (this.cells[y] | 2 ** x)
        } else {
            this.cells[y] = (this.cells[y] & ~(2 ** x))
        }
    }

    /**
     * Gets the state of the cell at (x, y)
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @returns {boolean} The state of the cell, dead (false) or alive (true)
     */
    getState(x, y) {
        // Assume cells past the border are always dead
        if (x < 0 || 32 < x) return false
        if (y < 0 || 32 < y) return false
        return (this.cells[y] & (2 ** x)) !== 0
    }

    /**
     * Checks the 8 neighbors of the cell at (x, y), and determines whether the cell should be dead or alive in the next generation
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @returns {boolean} The next generation state of the cell, dead (false) or alive (true)
     */
    nextStateOf(x, y) {
        // Cell life/death is dependent on number of neighbors
        // Any live cell with two or three live neighbours survives.
        // Any dead cell with three live neighbours becomes a live cell.
        // All other live cells die in the next generation. Similarly, all other dead cells stay dead

        const alive = this.getState(x, y)

        const aliveNeighbors = [
            // Top row
            this.getState(x - 1, y - 1),
            this.getState(x + 0, y - 1),
            this.getState(x + 1, y - 1),
    
            // Center row
            this.getState(x - 1, y + 0),
            // this.getState(x + 0, y + 0),
            this.getState(x + 1, y + 0),
    
            // Bottom row
            this.getState(x - 1, y + 1),
            this.getState(x + 0, y + 1),
            this.getState(x + 1, y + 1)
        ].filter(x => !!x)


        // If the cell is alive, then it stays alive if it has either 2 or 3 live neighbors
        // If the cell is dead, then it springs to life only in the case that it has 3 live neighbors
        if (alive) {
            return aliveNeighbors.length === 2 || aliveNeighbors.length === 3
        } else {
            return aliveNeighbors.length === 3
        }
    }

    toString() {
        let out = ''
        for (let i = 0; i < this.cells.length; i++) {
            out += padStart(this.cells[i].toString(2), 32, ' ')
                .replace(/0/g, ' ')
                .replace(/1/g, '*')
            out += '\n'
        }
        return out
    }
}
