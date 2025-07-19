// index.js

const { spawn } = require('child_process');

const game = spawn('node', ['src/game.js'], { stdio: 'inherit' });

game.on('error', err => {
  console.error('[game] Error:', err);
});
