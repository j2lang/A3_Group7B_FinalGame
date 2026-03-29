let rectangles = [];

const rectHeight = 30; // minimum height for tap notes and hold note caps

// Each lane has its own width. Space is wider. All widths must sum to 600 (canvas width).
const laneWidths = { D: 100, F: 100, " ": 200, J: 100, K: 100 };

let level = 1;
let gameOver = false;
const maxLevels = 3;

let particles = [];

const hitBuffer = 20;
const barHeight = 12 + hitBuffer;

let laneGlow = { D: 0, F: 0, " ": 0, J: 0, K: 0 };

// Tracks which keys are currently held down by the player
let keysHeld = { D: false, F: false, " ": false, J: false, K: false };

let paused = false;
let bgMusic;

const synthLow = new Audio("assets/audio/beep.wav");
const synthHigh = new Audio("assets/audio/synthHigh.wav");

const levelCompleteScreen = document.getElementById("levelCompleteScreen");
let levelCompleteTimer = null;

/* ---------- Hit bar ---------- */
const barBaseY = 550;
let barBaseYValue;
const barOscillateStart = 30;
const barAmplitude = 25;
const barPeriod = 1.5;

function getBarY(songTime) {
  if (songTime < barOscillateStart) return barBaseYValue;
  const t = songTime - barOscillateStart;
  return barBaseYValue + barAmplitude * sin((TWO_PI * t) / barPeriod);
}

/* ---------- Beat / timing constants ---------- */
const BPM = 160;
const beatInterval = 60 / BPM;
const beatOffset = 8;
const leadin = 6;
const travelTime = leadin * beatInterval;
let pixelsPerSecond;

/* ---------- Lane layout ---------- */
const laneOrder = ["D", "F", " ", "J", "K"];

function getLaneX(key) {
  let x = 0;
  for (let lane of laneOrder) {
    if (lane === key) return x;
    x += laneWidths[lane];
  }
}

// Note and glow colours per lane
const laneColors = {
  D: [255, 0, 255],
  F: [0, 255, 255],
  " ": [255, 220, 0],
  J: [0, 255, 255],
  K: [255, 0, 255],
};

/* ---------- Beatmap ---------- */
const beatmap = generateBeatmap();

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
  levelCompleteScreen.style.display = "none";
  screen.style.display = "flex";
}

/* ---------- GAME SETUP ---------- */
function setup() {
  createCanvas(600, 600).parent("gameContainer");
  barBaseYValue = height - 50;
  pixelsPerSecond = (barBaseYValue + rectHeight) / travelTime;

  bgMusic = document.getElementById("bgMusic");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  synthLow.volume = 0.5;

  document.getElementById("homePlayButton").onclick = () => {
    showScreen(gameScreen);
    resetGame();
    playBackgroundMusic();
  };

  document.getElementById("instructionsPlayButton").onclick = () => {
    showScreen(gameScreen);
    resetGame();
    playBackgroundMusic();
  };

  document.getElementById("pauseButton").onclick = () => {
    paused = !paused;
    document.getElementById("pauseButton").innerText = paused
      ? "▶ PLAY"
      : "II PAUSE";
    if (paused) bgMusic.pause();
    else bgMusic.play().catch((err) => console.log("Music blocked:", err));
  };

  document.getElementById("retryButton").addEventListener("click", () => {
    const currentLevel = level;
    resetGame();
    level = currentLevel;
  });

  document.getElementById("instructionsButton").onclick = () =>
    showScreen(instructionsScreen);
  document.getElementById("instructionsBackButton").onclick = () =>
    showScreen(homeScreen);
  document.getElementById("backButton").onclick = () => showScreen(homeScreen);

  document.getElementById("nextLevelButton").onclick = () => {
    if (levelCompleteTimer) {
      clearTimeout(levelCompleteTimer);
      levelCompleteTimer = null;
    }
    level++;
    spawnedBeats = new Set();
    rectangles = [];
    particles = [];
    gameOver = false;
    paused = false;
    keysHeld = { D: false, F: false, " ": false, J: false, K: false };
    bgMusic.currentTime = 0;
    document.getElementById("message").innerText =
      "Hit the keys as rectangles reach the bar";
    showScreen(gameScreen);
    playBackgroundMusic();
  };

  document.getElementById("tryAgainButton").onclick = () => {
    if (levelCompleteTimer) {
      clearTimeout(levelCompleteTimer);
      levelCompleteTimer = null;
    }
    spawnedBeats = new Set();
    rectangles = [];
    particles = [];
    gameOver = false;
    paused = false;
    keysHeld = { D: false, F: false, " ": false, J: false, K: false };
    bgMusic.currentTime = 0;
    document.getElementById("message").innerText =
      "Hit the keys as rectangles reach the bar";
    showScreen(gameScreen);
    playBackgroundMusic();
  };

  document.getElementById("levelHomeButton").onclick = () => {
    if (levelCompleteTimer) {
      clearTimeout(levelCompleteTimer);
      levelCompleteTimer = null;
    }
    bgMusic.pause();
    bgMusic.currentTime = 0;
    level = 1;
    showScreen(homeScreen);
  };
}

function playBackgroundMusic() {
  if (bgMusic.paused) {
    bgMusic.play().catch((err) => console.log("Playback blocked:", err));
  }
}

/* ---------- RESET GAME ---------- */
function resetGame() {
  level = 1;
  gameOver = false;
  paused = false;
  rectangles = [];
  particles = [];
  laneGlow = { D: 0, F: 0, " ": 0, J: 0, K: 0 };
  keysHeld = { D: false, F: false, " ": false, J: false, K: false };
  spawnedBeats = new Set();
  levelCompleteTimer = null;
  bgMusic.currentTime = 0;
  document.getElementById("retryButton").style.display = "none";
  document.getElementById("hitFeedback").innerText = "";
  document.getElementById("message").innerText =
    "Hit the keys as rectangles reach the bar";
}

/* ---------- SPAWN NOTES FROM BEATMAP ---------- */
function spawnScheduledNotes() {
  const songTime = bgMusic.currentTime;

  for (let i = 0; i < beatmap.length; i++) {
    const entry = beatmap[i];
    if (entry.level !== level) continue;
    if (spawnedBeats.has(i)) continue;

    const targetTime = (entry.beat + beatOffset) * beatInterval;
    const spawnTime = targetTime - travelTime;

    if (songTime >= spawnTime) {
      const isHold = entry.holdBeats && entry.holdBeats > 0;
      const holdDuration = isHold ? entry.holdBeats * beatInterval : 0;
      const endTime = targetTime + holdDuration;
      // Hold note is taller: base cap height + the duration converted to pixels
      const holdHeight = rectHeight + holdDuration * pixelsPerSecond;

      rectangles.push({
        key: entry.key,
        targetTime, // when the TOP of the note should reach the bar
        endTime, // when the player should release (hold notes only)
        isHold, // true = hold note, false = tap note
        holdHeight, // total visual height of the note
        holdActive: false, // true while player is holding this note
        x: getLaneX(entry.key),
        w: laneWidths[entry.key],
        y: -holdHeight,
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

  // ---- Draw lanes ----
  const topAlpha = 102;
  const bottomAlpha = 255;
  const steps = 60;

  for (let lane of laneOrder) {
    const lx = getLaneX(lane);
    const lw = laneWidths[lane];
    const [r, g, b] = laneColors[lane];
    const isDark = lane === "D" || lane === " " || lane === "K";

    for (let i = 0; i < steps; i++) {
      const alphaValue = lerp(topAlpha, bottomAlpha, i / (steps - 1));
      const yPos = (height / steps) * i;
      const h = height / steps;

      strokeWeight(4);
      stroke(r, g, b, laneGlow[lane]);
      noFill();
      rect(lx, yPos, lw, h);

      noStroke();
      fill(
        isDark ? color(35, 35, 35, alphaValue) : color(60, 60, 60, alphaValue),
      );
      rect(lx, yPos, lw, h);
    }

    laneGlow[lane] = max(0, laneGlow[lane] - 5);
  }

  // ---- Hit bar ----
  const currentBarY = getBarY(bgMusic.currentTime);
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(255);
  fill(255, 200);
  rect(0, currentBarY, width, barHeight);
  drawingContext.shadowBlur = 0;

  // ---- Update and draw rectangles ----
  if (!gameOver) {
    const songTime = bgMusic.currentTime;

    rectangles.forEach((r) => {
      if (r.hit) return;

      // Position: top of note tracks to arrive at barY on targetTime
      const timeUntilHit = r.targetTime - songTime;
      r.y = getBarY(songTime) - timeUntilHit * pixelsPerSecond;

      const [rc, gc, bc] = laneColors[r.key];

      // ---- Hold note logic ----
      if (r.isHold) {
        if (r.holdActive) {
          // Player is currently holding — check if they held long enough
          if (songTime >= r.endTime) {
            r.hit = true;
            createBurst(r.x, r.y, r.w, color(rc, gc, bc));
            return;
          }
          // Player released too early
          if (!keysHeld[r.key]) {
            r.hit = true;

            showFeedback(hitType, hitType === "Perfect" ? "#00FFAA" : "yellow");

            return;
          }
          // Still holding — draw progress highlight over completed portion
          const elapsed = songTime - r.targetTime;
          const progressHeight = min(elapsed * pixelsPerSecond, r.holdHeight);
          fill(rc, gc, bc, 80); // dim highlight for held portion
          noStroke();
          rect(r.x, r.y, r.w, progressHeight, 12);
        }

        // Miss: entire note has passed the bar without being pressed
        const noteTailY = r.y + r.holdHeight;
        if (!r.holdActive && noteTailY > getBarY(songTime) + barHeight + 10) {
          r.hit = true;

          const hitFeedback = document.getElementById("hitFeedback");
hitFeedback.innerText = "Miss";
hitFeedback.style.color = "red";
hitFeedback.style.opacity = "1";
setTimeout(() => { hitFeedback.style.opacity = "0"; }, 250);

          return;
        }

        // Draw hold body (dimmed) with bright caps at top and bottom
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = color(rc, gc, bc);

        // Dim body
        fill(rc, gc, bc, 120);
        noStroke();
        rect(r.x, r.y, r.w, r.holdHeight, 12);

        // Bright top cap
        fill(rc, gc, bc);
        rect(r.x, r.y, r.w, rectHeight, 12);

        // Bright bottom cap
        rect(r.x, r.y + r.holdHeight - rectHeight, r.w, rectHeight, 12);

        drawingContext.shadowBlur = 0;
      } else {
        // ---- Tap note logic ----
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = color(rc, gc, bc);
        fill(rc, gc, bc);
        rect(r.x, r.y, r.w, rectHeight, 12);
        drawingContext.shadowBlur = 0;

        // Miss: note passed the bar
        if (r.y > getBarY(songTime) + barHeight + 10) {
          r.hit = true;

          const hitFeedback = document.getElementById("hitFeedback");
hitFeedback.innerText = "Miss";
hitFeedback.style.color = "red";
hitFeedback.style.opacity = "1";
setTimeout(() => { hitFeedback.style.opacity = "0"; }, 250);
        }
      }
    });

    // Check level complete
    const levelNotes = beatmap.filter((e) => e.level === level);
    const allSpawned = levelNotes.every((_, i) => {
      const globalIndex = beatmap.indexOf(levelNotes[i]);
      return spawnedBeats.has(globalIndex);
    });

    if (
      allSpawned &&
      rectangles.filter((r) => !r.hit).length === 0 &&
      !gameOver
    ) {
      gameOver = true;
      if (levelCompleteTimer === null) {
        const fourBeats = 4 * beatInterval * 1000;
        levelCompleteTimer = setTimeout(() => {
          bgMusic.pause();
          const title = document.getElementById("levelCompleteTitle");
          const nextBtn = document.getElementById("nextLevelButton");
          if (level < maxLevels) {
            title.innerText = "LEVEL COMPLETE!";
            nextBtn.style.display = "block";
          } else {
            title.innerText = "YOU WIN! 🎉";
            nextBtn.style.display = "none";
          }
          showScreen(levelCompleteScreen);
          levelCompleteTimer = null;
        }, fourBeats);
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

  const pressedKey = key === " " ? " " : key.toUpperCase();
  if (!laneGlow.hasOwnProperty(pressedKey)) return;

  laneGlow[pressedKey] = 80;
  keysHeld[pressedKey] = true;

  synthLow.currentTime = 0;
  synthLow.play().catch((err) => console.log("Sound blocked:", err));

  const songTime = bgMusic.currentTime;
  const currentBarY = getBarY(songTime);

  rectangles.forEach((r) => {
    if (r.hit || r.holdActive) return;
    if (r.key !== pressedKey) return;

    // Check if note is in the hit window
    const noteTop = r.y;
    const noteBottom = r.y + (r.isHold ? rectHeight : rectHeight); // top cap for holds
    if (
      noteBottom >= currentBarY - hitBuffer &&
      noteTop <= currentBarY + barHeight + hitBuffer
    ) {
      // Timing feedback based on press time vs targetTime
      const timingError = Math.abs(r.targetTime - songTime);
      let hitType;
      if (timingError < 0.05) hitType = "Perfect";
      else if (timingError < 0.12) hitType = "Early";
      else hitType = "Late";

      const hitFeedback = document.getElementById("hitFeedback");
      hitFeedback.innerText = hitType;
      hitFeedback.style.color = hitType === "Perfect" ? "#00FFAA" : "yellow";
      hitFeedback.style.opacity = "1";
      setTimeout(() => {
        hitFeedback.style.opacity = "0";
      }, 250);

      if (r.isHold) {
        // Start the hold — don't mark as hit yet, wait for release in draw()
        r.holdActive = true;
      } else {
        // Tap note — mark as hit immediately
        r.hit = true;
        const [rc, gc, bc] = laneColors[r.key];
        createBurst(r.x, r.y, r.w, color(rc, gc, bc));
      }
    }
  });

  if (key === " ") return false;
}

function keyReleased() {
  const releasedKey = key === " " ? " " : key.toUpperCase();
  if (keysHeld.hasOwnProperty(releasedKey)) {
    keysHeld[releasedKey] = false;
  }
  // Prevent space from scrolling on release too
  if (key === " ") return false;
}

function showFeedback(text, color) {
  const hitFeedback = document.getElementById("hitFeedback");
  hitFeedback.innerText = text;
  hitFeedback.style.color = color;
  hitFeedback.style.opacity = "1";

  setTimeout(() => {
    hitFeedback.style.opacity = "0";
  }, 250);
}

function createBurst(x, y, w, noteColor) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x + w / 2,
      y: y + rectHeight / 2,
      vx: random(-2, 2),
      vy: random(-2, -4),
      alpha: 255,
      color: noteColor,
      size: random(4, 8),
    });
  }
}
