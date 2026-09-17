window.CLONE_WARS_GAME = true;

const DEFAULTS = { title: 'Flap Clone', fix: 'none', canvasWidth: 360, canvasHeight: 640, gravity: 1400, flapStrength: 420, birdSize: 34, pipeWidth: 64, pipeGap: 150, pipeSpacing: 260, pipeSpeed: 150, groundHeight: 80, modes: { easy: { pipeGap: 190, pipeSpeed: 110 }, normal: { pipeGap: 150, pipeSpeed: 150 } } };
const CONFIG = Object.assign({}, DEFAULTS, window.GAME_CONFIG || {});
const ART_NAMES = ['drawBackground', 'drawGround', 'drawBird', 'drawPipe'];
const SOUND_NAMES = ['flap', 'score', 'crash'];
const missing = [];
if (!window.GAME_CONFIG) missing.push('settings');
else for (const key of Object.keys(DEFAULTS)) { if (!(key in window.GAME_CONFIG)) missing.push(key); }
if (!window.SPRITES) missing.push('art');
else for (const name of ART_NAMES) { if (typeof window.SPRITES[name] !== 'function') missing.push(name); }
if (!window.SOUNDS) missing.push('sound');
else for (const name of SOUND_NAMES) { if (typeof window.SOUNDS[name] !== 'function') missing.push(name); }
document.getElementById('missing-label').textContent = missing.length ? 'placeholder: ' + missing.join(', ') + ' missing' : '';

function placeholderBackground(ctx, width, height) { ctx.save(); ctx.fillStyle = '#79c8e8'; ctx.fillRect(0, 0, width, height); ctx.restore(); }
function placeholderGround(ctx, width, height, groundHeight) { ctx.save(); ctx.fillStyle = '#4b8b42'; ctx.fillRect(0, height - groundHeight, width, groundHeight); ctx.restore(); }
function placeholderBird(ctx, x, y, size) { ctx.save(); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - size / 2, y - size / 2, size, size); ctx.restore(); }
function placeholderPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) { ctx.save(); ctx.fillStyle = '#54a64b'; ctx.fillRect(x, 0, pipeWidth, gapTop); ctx.fillRect(x, gapBottom, pipeWidth, height - gapBottom); ctx.restore(); }
const drawBackground = (window.SPRITES && typeof window.SPRITES.drawBackground === 'function') ? window.SPRITES.drawBackground : placeholderBackground;
const drawGround = (window.SPRITES && typeof window.SPRITES.drawGround === 'function') ? window.SPRITES.drawGround : placeholderGround;
const drawBird = (window.SPRITES && typeof window.SPRITES.drawBird === 'function') ? window.SPRITES.drawBird : placeholderBird;
const drawPipe = (window.SPRITES && typeof window.SPRITES.drawPipe === 'function') ? window.SPRITES.drawPipe : placeholderPipe;
let muted = false;
function play(name) {
  if (muted) return;
  const sound = window.SOUNDS && window.SOUNDS[name];
  if (typeof sound === 'function') { try { sound(); } catch (error) {} }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const fixButtons = document.getElementById('fix-buttons');
const sr = document.getElementById('sr');
let state = 'ready', y = CONFIG.canvasHeight / 2, velocity = 0, pipes = [], hawks = [], pipesMade = 0, groundOffset = 0, lastGapTop = (CONFIG.canvasHeight - CONFIG.groundHeight) / 2 - CONFIG.pipeGap / 2, score = 0, checkpoint = 0, bestScore = 0, secondsSinceCrash = 0, currentMode = 'normal', lastTime = 0, reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
try { bestScore = parseInt(localStorage.getItem('cloneWarsBest'), 10) || 0; } catch (error) {}

function showReady() { overlay.hidden = false; overlayTitle.textContent = CONFIG.title; overlayText.textContent = 'Press Space, click or tap to start.\nPress M to turn sound ' + (muted ? 'on.' : 'off.'); }
function showGameOver() { overlay.hidden = false; overlayTitle.textContent = 'Game over'; const lines = ['Score ' + score + '   ·   Best ' + bestScore, 'Press Space, click or tap to play again.', 'Press M to turn sound ' + (muted ? 'on.' : 'off.')]; if (checkpoint > 0) lines.push('Next game starts at checkpoint ' + checkpoint + '.'); overlayText.textContent = lines.join('\n'); }
function startGame() { state = 'playing'; y = (CONFIG.canvasHeight - CONFIG.groundHeight) / 2; velocity = -CONFIG.flapStrength; pipes = []; hawks = []; pipesMade = 0; groundOffset = 0; lastGapTop = (CONFIG.canvasHeight - CONFIG.groundHeight) / 2 - CONFIG.pipeGap / 2; score = checkpoint; secondsSinceCrash = 0; overlay.hidden = true; play('flap'); }
function press() { if (state === 'ready') startGame(); else if (state === 'playing') { velocity = -CONFIG.flapStrength; play('flap'); } else if (state === 'gameover' && secondsSinceCrash >= 0.4) startGame(); }
window.addEventListener('keydown', (event) => {
  if (event.target && event.target.closest && event.target.closest('button')) return;
  if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); press(); } else if (event.code === 'KeyM') { muted = !muted; if (state === 'ready') showReady(); if (state === 'gameover') showGameOver(); }
});
window.addEventListener('pointerdown', (event) => { if (event.target && event.target.closest && event.target.closest('button')) return; press(); });
if (CONFIG.fix === 'custom') fixButtons.textContent = 'Hawks swoop across the sky.';
function addPipe(pipeGap) {
  const gap = pipeGap + (CONFIG.fix === 'gentle-start' && pipesMade < 3 ? 70 : 0);
  const lowest = CONFIG.canvasHeight - CONFIG.groundHeight - 60 - gap;
  const gapTop = Math.max(60, Math.min(lowest, lastGapTop + (Math.random() * 360 - 180)));
  const gapBottom = gapTop + gap;
  lastGapTop = gapTop;
  pipes.push({ x: CONFIG.canvasWidth, gapTop: gapTop, gapBottom: gapBottom, scored: false });
  pipesMade += 1;
}
function crash() { if (state !== 'playing') return; state = 'gameover'; secondsSinceCrash = 0; play('crash'); if (score > bestScore) bestScore = score; try { localStorage.setItem('cloneWarsBest', String(bestScore)); } catch (error) {} checkpoint = CONFIG.fix === 'checkpoints' ? Math.floor(score / 10) * 10 : 0; sr.textContent = 'Game over. Score ' + score + '. Best ' + bestScore + '.'; showGameOver(); }
function frame(now) {
  const seconds = Math.min((now - lastTime) / 1000 || 0, 0.05); lastTime = now;
  if (state === 'playing') { velocity += CONFIG.gravity * seconds; y += velocity * seconds; const birdX = CONFIG.canvasWidth / 4; const mode = CONFIG.fix === 'easy-mode' ? CONFIG.modes[currentMode] : CONFIG; const pipeGap = mode.pipeGap; const pipeSpeed = mode.pipeSpeed * (CONFIG.fix === 'gentle-start' && score < 3 ? 0.75 : 1); groundOffset += pipeSpeed * seconds; if (pipes.length === 0) addPipe(pipeGap); else if (pipes[pipes.length - 1].x <= CONFIG.canvasWidth - CONFIG.pipeSpacing) addPipe(pipeGap); for (const pipe of pipes) { pipe.x -= pipeSpeed * seconds; if (!pipe.scored && pipe.x + CONFIG.pipeWidth < birdX) { pipe.scored = true; score += 1; play('score'); } if (birdX + CONFIG.birdSize / 2 > pipe.x && birdX - CONFIG.birdSize / 2 < pipe.x + CONFIG.pipeWidth && (y - CONFIG.birdSize / 2 < pipe.gapTop || y + CONFIG.birdSize / 2 > pipe.gapBottom)) crash(); } pipes = pipes.filter((pipe) => pipe.x + CONFIG.pipeWidth > 0); if (pipesMade % 2 === 0 && !hawks.some((hawk) => hawk.pipeCount === pipesMade)) hawks.push({ x: CONFIG.canvasWidth + 20, y: 100 + ((pipesMade * 97) % 380), pipeCount: pipesMade, phase: pipesMade }); for (const hawk of hawks) { hawk.x -= 230 * seconds; hawk.y += Math.sin(now / 260 + hawk.phase) * 55 * seconds; if (Math.abs(hawk.x - birdX) < 30 && Math.abs(hawk.y - y) < 28) crash(); } hawks = hawks.filter((hawk) => hawk.x > -50); if (y + CONFIG.birdSize / 2 >= CONFIG.canvasHeight - CONFIG.groundHeight || y - CONFIG.birdSize / 2 <= 0) crash(); } else if (state === 'gameover') secondsSinceCrash += seconds;
  drawBackground(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, reduceMotion ? 0 : now / 1000); for (const pipe of pipes) drawPipe(ctx, pipe.x, pipe.gapTop, pipe.gapBottom, CONFIG.pipeWidth, CONFIG.canvasHeight - CONFIG.groundHeight); for (const hawk of hawks) { ctx.save(); ctx.translate(hawk.x, hawk.y); ctx.fillStyle = '#4b2940'; ctx.strokeStyle = '#171525'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-24, 4); ctx.quadraticCurveTo(-10, -14, 0, -2); ctx.quadraticCurveTo(10, -14, 24, 4); ctx.quadraticCurveTo(9, -1, 0, 9); ctx.quadraticCurveTo(-9, -1, -24, 4); ctx.fill(); ctx.stroke(); ctx.restore(); } drawGround(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, CONFIG.groundHeight, groundOffset); drawBird(ctx, CONFIG.canvasWidth / 4, y, CONFIG.birdSize, velocity); if (state === 'playing') { ctx.save(); ctx.font = 'bold 42px sans-serif'; ctx.textAlign = 'center'; ctx.strokeStyle = '#18324a'; ctx.lineWidth = 6; ctx.strokeText(String(score), CONFIG.canvasWidth / 2, 65); ctx.fillStyle = '#fff'; ctx.fillText(String(score), CONFIG.canvasWidth / 2, 65); ctx.restore(); } requestAnimationFrame(frame);
}
showReady();
requestAnimationFrame(frame);
