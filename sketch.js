let rectangles = [];

const rectWidth = 100;
const rectHeight = 30;

let level = 1;
let gameOver = false;
const maxLevels = 3;

let particles = [];

const hitBuffer = 20;
const barHeight = 12 + hitBuffer;

let laneGlow = { D: 0, F: 0, " ": 0, J: 0, K: 0 };

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
// 5 lanes dividing the canvas into 6 equal columns:
// D=col1, F=col2, Space=col3, J=col4, K=col5
const laneColumns = { "D": 0.5, "F": 1.5, " ": 2.5, "J": 3.5, "K": 4.5 };

// Returns the left X of a lane's rectangle
function getLaneX(key) {
  return (width / 6) * laneColumns[key] - rectWidth / 2;
}

// Note colour per lane
const laneColors = {
  "D": [0, 255, 255],
  "F": [0, 255, 255],
  " ": [255, 255, 0],
  "J": [255, 0, 255],
  "K": [255, 0, 255],
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
    document.getElementById("pauseButton").innerText = paused ? "▶ PLAY" : "II PAUSE";
    if (paused) bgMusic.pause();
    else bgMusic.play().catch((err) => console.log("Music blocked:", err));
  };

  document.getElementById("retryButton").addEventListener("click", resetGame);
  document.getElementById("instructionsButton").onclick = () => showScreen(instructionsScreen);
  document.getElementById("instructionsBackButton").onclick = () => showScreen(homeScreen);
  document.getElementById("backButton").onclick = () => showScreen(homeScreen);

  document.getElementById("nextLevelButton").onclick = () => {
    if (levelCompleteTimer) { clearTimeout(levelCompleteTimer); levelCompleteTimer = null; }
    level++;
    spawnedBeats = new Set();
    rectangles = [];
    particles = [];
    gameOver = false;
    paused = false;
    bgMusic.currentTime = 0;
    document.getElementById("message").innerText = "Hit the keys as rectangles reach the bar";
    showScreen(gameScreen);
    playBackgroundMusic();
  };

  document.getElementById("tryAgainButton").onclick = () => {
    if (levelCompleteTimer) { clearTimeout(levelCompleteTimer); levelCompleteTimer = null; }
    spawnedBeats = new Set();
    rectangles = [];
    particles = [];
    gameOver = false;
    paused = false;
    bgMusic.currentTime = 0;
    document.getElementById("message").innerText = "Hit the keys as rectangles reach the bar";
    showScreen(gameScreen);
    playBackgroundMusic();
  };

  document.getElementById("levelHomeButton").onclick = () => {
    if (levelCompleteTimer) { clearTimeout(levelCompleteTimer); levelCompleteTimer = null; }
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
  spawnedBeats = new Set();
  levelCompleteTimer = null;
  bgMusic.currentTime = 0;
  document.getElementById("retryButton").style.display = "none";
  document.getElementById("hitFeedback").innerText = "";
  document.getElementById("message").innerText = "Hit the keys as rectangles reach the bar";
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
      rectangles.push({
        key: entry.key,
        targetTime: targetTime,
        x: getLaneX(entry.key),
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

  // ---- Draw lanes ----
  const topAlpha = 102;
  const bottomAlpha = 255;
  const steps = 60;
  const lanes = ["D", "F", " ", "J", "K"];
  const greyLanes = new Set(["F", "J"]); // F and J are grey; rest are black

  for (let lane of lanes) {
    const lx = getLaneX(lane);
    const [r, g, b] = laneColors[lane];

    for (let i = 0; i < steps; i++) {
      const alphaValue = lerp(topAlpha, bottomAlpha, i / (steps - 1));
      const yPos = (height / steps) * i;
      const h = height / steps;

      // Glow outline
      strokeWeight(4);
      stroke(r, g, b, laneGlow[lane]);
      noFill();
      rect(lx, yPos, rectWidth, h);

      // Lane fill: grey for F/J, black for D/Space/K
      noStroke();
      fill(greyLanes.has(lane) ? color(60, 60, 60, alphaValue) : color(0, 0, 0, alphaValue));
      rect(lx, yPos, rectWidth, h);
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
      if (!r.hit) {
        const timeUntilHit = r.targetTime - songTime;
        r.y = getBarY(songTime) - timeUntilHit * pixelsPerSecond;

        const [rc, gc, bc] = laneColors[r.key];
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = color(rc, gc, bc);
        fill(rc, gc, bc);
        rect(r.x, r.y, rectWidth, rectHeight, 12);
        drawingContext.shadowBlur = 0;

        if (r.y > getBarY(songTime) + barHeight + 10) {
          gameOver = true;
          document.getElementById("message").innerText = "Game Over! You missed a note.";
          document.getElementById("retryButton").style.display = "block";
        }
      }
    });

    // Check level complete
    const levelNotes = beatmap.filter((e) => e.level === level);
    const allSpawned = levelNotes.every((_, i) => {
      const globalIndex = beatmap.indexOf(levelNotes[i]);
      return spawnedBeats.has(globalIndex);
    });

    if (allSpawned && rectangles.filter((r) => !r.hit).length === 0 && !gameOver) {
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

  // Space bar: p5's key gives " " not "SPACE"
  const pressedKey = key === " " ? " " : key.toUpperCase();

  if (laneGlow.hasOwnProperty(pressedKey)) {
    laneGlow[pressedKey] = 80;
  }

  synthLow.currentTime = 0;
  synthLow.play().catch((err) => console.log("Sound blocked:", err));

  const songTime = bgMusic.currentTime;
  const currentBarY = getBarY(songTime);

  rectangles.forEach((r) => {
    if (!r.hit && r.key === pressedKey) {
      if (
        r.y + rectHeight >= currentBarY - hitBuffer &&
        r.y <= currentBarY + barHeight + hitBuffer
      ) {
        r.hit = true;

        const timingError = Math.abs(r.targetTime - songTime);
        let hitType;
        if (timingError < 0.05)      hitType = "Perfect";
        else if (timingError < 0.12) hitType = "Early";
        else                         hitType = "Late";

        const hitFeedback = document.getElementById("hitFeedback");
        hitFeedback.innerText = hitType;
        hitFeedback.style.color = hitType === "Perfect" ? "#00FFAA" : "yellow";
        hitFeedback.style.opacity = "1";
        setTimeout(() => { hitFeedback.style.opacity = "0"; }, 250);

        const [rc, gc, bc] = laneColors[r.key];
        createBurst(r.x, r.y, color(rc, gc, bc));
      }
    }
  });

  // Prevent spacebar from scrolling the page
  if (key === " ") return false;
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