/**
 * JavaScript implementation of Conway's Game of Life
 * @author MindfulMinun
 * @since 2020-05-14
 */
export class Grid {
    /**
     * @param {Grid} [grid] The previous grid
     */
    constructor(grid?: Grid);
    /**
     * A 32x32 grid of alive or dead cells
     * @type {Uint32Array}
     */
    cells: Uint32Array;
    /**
     * This grid state's current generation
     * @type {number}
     */
    currentGeneration: number;
    /**
     * Keeps track of cells that may have changed state.
     * @type {Set<string>}
     */
    candidates: any;
    /**
     * Calculates the next generation given the grid's current state
     * @returns {Grid} The next generation.
     */
    nextFrame(): Grid;
    /**
     * Sets the state of the cell at (x, y)
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @param {boolean} state Whether to set to dead (false) or alive (true)
     */
    setState(x: number, y: number, state: boolean): void;
    /**
     * Gets the state of the cell at (x, y)
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @returns {boolean} The state of the cell, dead (false) or alive (true)
     */
    getState(x: number, y: number): boolean;
    /**
     * Checks the 8 neighbors of the cell at (x, y), and determines whether the cell should be dead or alive in the next generation
     * @param {number} x The cell's x coordinate
     * @param {number} y The cell's y coordinate
     * @returns {boolean} The next generation state of the cell, dead (false) or alive (true)
     */
    nextStateOf(x: number, y: number): boolean;
    toString(): string;
}
