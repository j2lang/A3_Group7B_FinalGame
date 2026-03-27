let rectangles = [];
let barY;

const rectWidth = 100;
const rectHeight = 30;

let level = 1;
let gameOver = false;
const maxLevels = 3;

let particles = [];

const hitBuffer = 20;
const barHeight = 12 + hitBuffer;

let laneGlow = { F: 0, J: 0 };

let paused = false;
let bgMusic;

const synthLow = new Audio("assets/audio/beep.wav");
const synthHigh = new Audio("assets/audio/synthHigh.wav");

/* ---------- Beat / timing constants ---------- */
const BPM = 160;
const beatInterval = 60 / BPM;       // seconds per beat (~0.375s)
const leadin = 6;                     // how many beats before the hit bar a note spawns
const travelTime = leadin * beatInterval; // seconds a note takes to cross the screen
let pixelsPerSecond;                  // calculated in setup() once barY is known
const beatOffset = 8; // beats of delay at the start

/* ---------- Beatmap ---------- */
// Each entry: { beat: <beat number>, key: "F" or "J" }
// Beat 0 = the very first beat of the song.
// Add/remove entries to design your level.
const beatmap = generateBeatmap();

function generateBeatmap() {
  const map = [];
  const keys = ["F", "J"];

  // Level 1: beats 0–95 (24 bars of 4/4 at 160bpm)
  // Simple alternating pattern with some doubles
  for (let b = 0; b < 96; b++) {
    // Hit on every beat
    map.push({ beat: b, key: keys[b % 2], level: 1 });

    // Add an off-beat (half-beat) every 4 beats for variety
    if (b % 4 === 2) {
      map.push({ beat: b + 0.5, key: keys[(b + 1) % 2], level: 1 });
    }
  }

  // Level 2: beats 96–191, faster pattern
  for (let b = 96; b < 192; b++) {
    map.push({ beat: b, key: keys[b % 2], level: 2 });
    // Off-beats every 2 beats
    if (b % 2 === 0) {
      map.push({ beat: b + 0.5, key: keys[(b + 1) % 2], level: 2 });
    }
  }

  // Level 3: beats 192+, dense pattern
  for (let b = 192; b < 288; b++) {
    map.push({ beat: b, key: keys[b % 2], level: 3 });
    map.push({ beat: b + 0.5, key: keys[(b + 1) % 2], level: 3 });
  }

  return map;
}

/* ---------- Track which beatmap notes have been spawned ---------- */
let spawnedBeats = new Set();

/* ---------- SCREEN NAVIGATION ---------- */
const homeScreen = document.getElementById("homeScreen");
const instructionsScreen = document.getElementById("instructionsScreen");
const gameScreen = document.getElementById("gameScreen");

function showScreen(screen) {
  homeScreen.style.display = "none";
  instructionsScreen.style.display = "none";
  gameScreen.style.display = "none";
  screen.style.display = "flex";
}

/* ---------- GAME SETUP ---------- */
function setup() {
  createCanvas(600, 600).parent("gameContainer");
  barY = height - 50;

  // Calculate how many pixels per second a note travels
  // Notes travel from y = -rectHeight to y = barY in travelTime seconds
  pixelsPerSecond = (barY + rectHeight) / travelTime;

  bgMusic = document.getElementById("bgMusic");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  synthLow.volume = 0.5;

  // Home Play button
  document.getElementById("homePlayButton").onclick = () => {
    showScreen(gameScreen);
    resetGame();
    playBackgroundMusic();
  };

  // Instructions Play button
  document.getElementById("instructionsPlayButton").onclick = () => {
    showScreen(gameScreen);
    resetGame();
    playBackgroundMusic();
  };

  // Pause button
  document.getElementById("pauseButton").onclick = () => {
    paused = !paused;
    document.getElementById("pauseButton").innerText = paused ? "▶ PLAY" : "II PAUSE";
    if (paused) bgMusic.pause();
    else bgMusic.play().catch(err => console.log("Music blocked:", err));
  };

  document.getElementById("retryButton").addEventListener("click", resetGame);
  document.getElementById("instructionsButton").onclick = () => showScreen(instructionsScreen);
  document.getElementById("instructionsBackButton").onclick = () => showScreen(homeScreen);
  document.getElementById("backButton").onclick = () => showScreen(homeScreen);
}

function playBackgroundMusic() {
  if (bgMusic.paused) {
    bgMusic.play().catch(err => console.log("Playback blocked:", err));
  }
}

/* ---------- RESET GAME ---------- */
function resetGame() {
  level = 1;
  gameOver = false;
  paused = false;
  rectangles = [];
  particles = [];
  laneGlow = { F: 0, J: 0 };
  spawnedBeats = new Set();

  bgMusic.currentTime = 0;

  document.getElementById("retryButton").style.display = "none";
  document.getElementById("hitFeedback").innerText = "";
  document.getElementById("message").innerText = "Hit F or J as rectangles reach the bar";
}

/* ---------- SPAWN NOTES FROM BEATMAP ---------- */
// Called every frame. Spawns a note when the song clock is leadin beats
// before its scheduled hit time.
function spawnScheduledNotes() {
  const songTime = bgMusic.currentTime;

  for (let i = 0; i < beatmap.length; i++) {
    const entry = beatmap[i];
    if (entry.level !== level) continue;
    if (spawnedBeats.has(i)) continue;

    const targetTime = (entry.beat + beatOffset) * beatInterval; // when note should hit barY (seconds)
    const spawnTime = targetTime - travelTime;    // when note should appear (seconds)

    if (songTime >= spawnTime) {
      const laneX = entry.key === "F"
        ? width / 4 - rectWidth / 2
        : (3 * width) / 4 - rectWidth / 2;

      rectangles.push({
        key: entry.key,
        targetTime: targetTime,
        x: laneX,
        y: -rectHeight,
        hit: false,
      });

      spawnedBeats.add(i);
    }
  }
}

/* ---------- GAME LOOP ---------- */
function draw() {
  background(0);
  noStroke();

  if (!gameOver && !paused) {
    spawnScheduledNotes();
  }

  // ---- Draw neon lanes ----
  const topAlpha = 102;
  const bottomAlpha = 255;
  const steps = 60;

  for (let i = 0; i < steps; i++) {
    const alphaValue = lerp(topAlpha, bottomAlpha, i / (steps - 1));
    const yPos = (height / steps) * i;
    const h = height / steps;

    strokeWeight(4);

    stroke(0, 255, 255, laneGlow.F);
    noFill();
    rect(width / 4 - rectWidth / 2, yPos, rectWidth, h);

    stroke(255, 0, 255, laneGlow.J);
    noFill();
    rect((3 * width) / 4 - rectWidth / 2, yPos, rectWidth, h);

    noStroke();
    fill(60, 60, 60, alphaValue);
    rect(width / 4 - rectWidth / 2, yPos, rectWidth, h);
    rect((3 * width) / 4 - rectWidth / 2, yPos, rectWidth, h);
  }

  laneGlow.F = max(0, laneGlow.F - 5);
  laneGlow.J = max(0, laneGlow.J - 5);

  // ---- Hit bar ----
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(255);
  fill(255, 200);
  rect(0, barY, width, barHeight);
  drawingContext.shadowBlur = 0;

  // ---- Update and draw rectangles ----
  if (!gameOver) {
    const songTime = bgMusic.currentTime;

    rectangles.forEach(r => {
      if (!r.hit) {
        // KEY CHANGE: position is calculated from song time, not accumulated speed
        // timeUntilHit > 0 means note hasn't reached bar yet
        const timeUntilHit = r.targetTime - songTime;
        r.y = barY - timeUntilHit * pixelsPerSecond;

        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = r.key === "F" ? color(0, 255, 255) : color(255, 0, 255);
        fill(r.key === "F" ? color(0, 255, 255) : color(255, 0, 255));
        rect(r.x, r.y, rectWidth, rectHeight, 12);
        drawingContext.shadowBlur = 0;

        // Miss: note passed the bar without being hit
        if (r.y > barY + barHeight + 10) {
          gameOver = true;
          document.getElementById("message").innerText = "Game Over! You missed a note.";
          document.getElementById("retryButton").style.display = "block";
        }
      }
    });

    // Check level complete: all notes for this level are spawned and hit
    const levelNotes = beatmap.filter(e => e.level === level);
    const allSpawned = levelNotes.every((_, i) => {
      // find this entry's global index
      const globalIndex = beatmap.indexOf(levelNotes[i]);
      return spawnedBeats.has(globalIndex);
    });
    const allHit = rectangles.filter(r => beatmap.findIndex(
      (e, i) => e.level === level
    ) !== -1).every(r => r.hit);

    if (allSpawned && rectangles.filter(r => !r.hit).length === 0 && !gameOver) {
      if (level < maxLevels) {
        level++;
        document.getElementById("message").innerText =
          `Level ${level - 1} Complete! Get ready for Level ${level}`;
      } else {
        gameOver = true;
        document.getElementById("message").innerText = "All Levels Complete! 🎉";
        document.getElementById("retryButton").style.display = "block";
      }
    }
  }

  // ---- Particles ----
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    fill(red(p.color), green(p.color), blue(p.color), p.alpha);
    noStroke();
    ellipse(p.x, p.y, p.size);

    if (!paused) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 10;
    }

    if (p.alpha <= 0) particles.splice(i, 1);
  }

  // ---- Pause overlay ----
  if (paused) {
    noStroke();
    fill(0, 0, 0, 120);
    rect(0, 0, width, height);
  }
}

/* ---------- INPUT ---------- */
function keyPressed() {
  if (paused || gameOver) return;

  const pressedKey = key.toUpperCase();

  if (pressedKey === "F") laneGlow.F = 80;
  if (pressedKey === "J") laneGlow.J = 80;

  synthLow.currentTime = 0;
  synthLow.play().catch(err => console.log("Sound blocked:", err));

  const songTime = bgMusic.currentTime;

  rectangles.forEach(r => {
    if (!r.hit && r.key === pressedKey) {
      if (r.y + rectHeight >= barY - hitBuffer && r.y <= barY + barHeight + hitBuffer) {
        r.hit = true;

        // Timing accuracy based on how close to the beat the player was
        const timingError = Math.abs(r.targetTime - songTime); // seconds off
        let hitType;
        if (timingError < 0.05)       hitType = "Perfect";
        else if (timingError < 0.12)  hitType = "Early";
        else                          hitType = "Late";

        const hitFeedback = document.getElementById("hitFeedback");
        hitFeedback.innerText = hitType;
        hitFeedback.style.color = hitType === "Perfect" ? "#00FFAA" : "yellow";
        hitFeedback.style.opacity = "1";
        setTimeout(() => { hitFeedback.style.opacity = "0"; }, 250);

        createBurst(r.x, r.y, r.key === "F" ? color(0, 255, 255) : color(255, 0, 255));
      }
    }
  });
}

function createBurst(x, y, noteColor) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x + rectWidth / 2,
      y: y + rectHeight / 2,
      vx: random(-2, 2),
      vy: random(-2, -4),
      alpha: 255,
      color: noteColor,
      size: random(4, 8),
    });
  }
}