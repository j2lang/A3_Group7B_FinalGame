let rectangles = [];

const rectHeight = 30;

// Each lane has its own width. Space is wider. All widths must sum to 600 (canvas width).
const laneWidths = { "D": 100, "F": 100, " ": 200, "J": 100, "K": 100 };

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

/* ---------- Scoring ---------- */
let levelScore = 0;
let totalPossibleScore = 0;

const SCORE_MISS    = 0;
const SCORE_EARLY   = 100;
const SCORE_LATE    = 100;
const SCORE_PERFECT = 200;
const SCORE_PENALTY = 100;

/* ---------- Level Progress ---------- */
let levelStartTime = 0;
let levelEndTime = 0;

function showHitFeedback(text, colorStr) {
  const hitFeedback = document.getElementById("hitFeedback");
  hitFeedback.innerText = text;
  hitFeedback.style.color = colorStr;
  hitFeedback.style.opacity = "1";
  setTimeout(() => { hitFeedback.style.opacity = "0"; }, 250);
}

function getScoreImage(score, possible) {
  if (possible === 0) return "assets/images/score0.png";
  const pct = score / possible;
  if (pct <= 0.10) return "assets/images/score0.png";
  if (pct <= 0.50) return "assets/images/score1.png";
  if (pct <= 0.90) return "assets/images/score2.png";
  return "assets/images/score3.png";
}

function showLevelComplete() {
  bgMusic.pause();
  const title   = document.getElementById("levelCompleteTitle");
  const nextBtn = document.getElementById("nextLevelButton");
  const scoreEl = document.getElementById("levelScore");
  const imgEl   = document.getElementById("scoreImage");

  title.innerText = level < maxLevels ? "LEVEL COMPLETE!" : "YOU WIN! 🎉";
  nextBtn.style.display = level < maxLevels ? "block" : "none";

  scoreEl.innerText = `Score: ${levelScore} / ${totalPossibleScore}`;
  imgEl.src = getScoreImage(levelScore, totalPossibleScore);
  imgEl.style.display = "block";

  showScreen(levelCompleteScreen);
  levelCompleteTimer = null;
}

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

const laneColors = {
  "D": [255, 0, 255],
  "F": [0, 255, 255],
  " ": [255, 220, 0],
  "J": [0, 255, 255],
  "K": [255, 0, 255],
};

/* ---------- Beatmap ---------- */
const beatmap = generateBeatmap();

/* ---------- Track which beatmap notes have been spawned ---------- */
let spawnedBeats = new Set();

/* ---------- SCREEN NAVIGATION ---------- */
const homeScreen         = document.getElementById("homeScreen");
const instructionsScreen = document.getElementById("instructionsScreen");
const gameScreen         = document.getElementById("gameScreen");

function showScreen(screen) {
  homeScreen.style.display          = "none";
  instructionsScreen.style.display  = "none";
  gameScreen.style.display          = "none";
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

  document.getElementById("retryButton").addEventListener("click", () => {
    const currentLevel = level;
    resetGame();
    level = currentLevel;
  });

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
    levelScore = 0;
    totalPossibleScore = 0;
    bgMusic.currentTime = 0;
    calculateLevelEndTime();
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
    levelScore = 0;
    totalPossibleScore = 0;
    bgMusic.currentTime = 0;
    calculateLevelEndTime();
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
  levelScore = 0;
  totalPossibleScore = 0;
  bgMusic.currentTime = 0;
  document.getElementById("retryButton").style.display = "none";
  document.getElementById("hitFeedback").innerText = "";
  document.getElementById("message").innerText = "Hit the keys as rectangles reach the bar";
  calculateLevelEndTime();
}

/* ---------- SPAWN NOTES FROM BEATMAP ---------- */
function spawnScheduledNotes() {
  const songTime = bgMusic.currentTime;

  for (let i = 0; i < beatmap.length; i++) {
    const entry = beatmap[i];
    if (entry.level !== level) continue;
    if (spawnedBeats.has(i)) continue;

    const targetTime = (entry.beat + beatOffset) * beatInterval;
    const spawnTime  = targetTime - travelTime;

    if (songTime >= spawnTime) {
      rectangles.push({
        key: entry.key,
        targetTime: targetTime,
        x: getLaneX(entry.key),
        w: laneWidths[entry.key],
        y: -rectHeight,
        hit: false,
      });
      totalPossibleScore += SCORE_PERFECT; // every note is worth 200 at best
      spawnedBeats.add(i);
    }
  }
}

/* ---------- GAME LOOP ---------- */
function draw() {
  background(0);
  noStroke();

  // ---- Progress Bar ----
const songTime = bgMusic.currentTime;
let progress = constrain(songTime / levelEndTime, 0, 1);

const barX = 50;
const barYProgress = 20;
const barW = width - 100;
const barH = 12;

// Outline
noFill();
stroke(255);
strokeWeight(2);
rect(barX, barYProgress, barW, barH);

// Fill
noStroke();
fill(255);
rect(barX, barYProgress, barW * progress, barH);

  if (!gameOver && !paused) {
    spawnScheduledNotes();
  }

  // ---- Draw lanes ----
  const topAlpha    = 102;
  const bottomAlpha = 255;
  const steps       = 60;

  for (let lane of laneOrder) {
    const lx = getLaneX(lane);
    const lw = laneWidths[lane];
    const [r, g, b] = laneColors[lane];

    for (let i = 0; i < steps; i++) {
      const alphaValue = lerp(topAlpha, bottomAlpha, i / (steps - 1));
      const yPos = (height / steps) * i;
      const h    = height / steps;

      strokeWeight(4);
      stroke(r, g, b, laneGlow[lane]);
      noFill();
      rect(lx, yPos, lw, h);

      noStroke();
      const isDark = lane === "D" || lane === " " || lane === "K";
      fill(isDark ? color(35, 35, 35, alphaValue) : color(60, 60, 60, alphaValue));
      rect(lx, yPos, lw, h);
    }

    laneGlow[lane] = max(0, laneGlow[lane] - 5);
  }

  // ---- Hit bar ----
  const currentBarY = getBarY(bgMusic.currentTime);
  drawingContext.shadowBlur  = 25;
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
        drawingContext.shadowBlur  = 25;
        drawingContext.shadowColor = color(rc, gc, bc);
        fill(rc, gc, bc);
        rect(r.x, r.y, r.w, rectHeight, 12);
        drawingContext.shadowBlur = 0;

        // Missed note: mark hit, score 0, show "Miss", enable penalties
        if (r.y > getBarY(songTime) + barHeight + 10) {
          r.hit = true;
          levelScore += SCORE_MISS;
          showHitFeedback("Miss", "red");
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
        levelCompleteTimer = setTimeout(showLevelComplete, fourBeats);
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

  if (laneGlow.hasOwnProperty(pressedKey)) {
    laneGlow[pressedKey] = 80;
  }

  synthLow.currentTime = 0;
  synthLow.play().catch((err) => console.log("Sound blocked:", err));

  const songTime    = bgMusic.currentTime;
  const currentBarY = getBarY(songTime);

  // Check if this keypress hit any rectangle
  let hitSomething = false;

  rectangles.forEach((r) => {
    if (!r.hit && r.key === pressedKey) {
      if (
        r.y + rectHeight >= currentBarY - hitBuffer &&
        r.y <= currentBarY + barHeight + hitBuffer
      ) {
        r.hit = true;
        hitSomething = true;

        const timingError = Math.abs(r.targetTime - songTime);
        let hitType, points;
        if (timingError < 0.05) {
          hitType = "Perfect"; points = SCORE_PERFECT;
        } else if (timingError < 0.12) {
          hitType = "Early";   points = SCORE_EARLY;
        } else {
          hitType = "Late";    points = SCORE_LATE;
        }

        levelScore += points;
        showHitFeedback(hitType, hitType === "Perfect" ? "#00FFAA" : "yellow");

        const [rc, gc, bc] = laneColors[r.key];
        createBurst(r.x, r.y, r.w, color(rc, gc, bc));
      }
    }
  });

  // Empty hit penalty
  if (!hitSomething && laneGlow.hasOwnProperty(pressedKey)) {
    levelScore = max(0, levelScore - SCORE_PENALTY);
    showHitFeedback("-100", "white");
  }

  if (key === " ") return false;
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

/* ---------- PROGRESS BAR IDK ---------- */
function calculateLevelEndTime() {
  const levelNotes = beatmap.filter(e => e.level === level);
  let lastBeat = 0;

  levelNotes.forEach(n => {
    if (n.beat > lastBeat) lastBeat = n.beat;
  });

  levelStartTime = 0;
  levelEndTime = (lastBeat + beatOffset) * beatInterval;
}