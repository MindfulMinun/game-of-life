# game-of-life

Conway’s Game of Life, running right in your browser. [Give it a try on Glitch](https://mm-game-of-life.glitch.me/)

Runs a 64x64 grid of Conway’s Life in JavaScript, using `BigUint64Array`s and falling back to `Uint32Array` if unsupported.

While there’s a Browser UI, this repository also exports an API as a class via `src/game.js` (ES6 modules) or `dist/game.js` (Node.js). TypeScript typings included :) (`dist/game.d.ts`)


## License

[MIT](https://github.com/MindfulMinun/game-of-life/blob/master/LICENSE)
