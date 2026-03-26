let rectangles = [];
let barY;

const rectWidth = 100;
const rectHeight = 30;

let speed = 3;
let level = 1;
let gameOver = false;
const maxLevels = 3;

let particles = [];

const hitBuffer = 20;
const barHeight = 12 + hitBuffer;

let laneGlow = { F: 0, J: 0 };
const glowMaxAlpha = 120;

let paused = false;
let bgMusic; // background music

const synthLow = new Audio("assets/audio/beep.wav");
const synthHigh = new Audio("assets/audio/synthHigh.wav");

/* ---------- Level 1 timing / random rectangles ---------- */
let levelStartTime = 0;
let lastSpawnTime = 0;
const spawnInterval = 800; // ms
let level1PauseStarted = false;
let barOscillation = false;
let barOscillationStart = 0;

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

  // get audio element
  bgMusic = document.getElementById("bgMusic");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  
  // Load key sound effects
  synthLow.volume = 0.5; // 50%
  
  startLevel(level);

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

// play music on first user gesture
function playBackgroundMusic() {
  if (bgMusic.paused) {
    bgMusic.play().catch(err => console.log("Playback blocked:", err));
  }
}

/* ---------- RESET GAME ---------- */
function resetGame() {
  speed = 3;
  level = 1;
  gameOver = false;
  paused = false;

  rectangles = [];
  particles = [];
  laneGlow = { F: 0, J: 0 };

  document.getElementById("retryButton").style.display = "none";
  document.getElementById("hitFeedback").innerText = "";
  document.getElementById("message").innerText = "Hit F or J as rectangles reach the bar";

  startLevel(level);
}

/* ---------- START LEVEL ---------- */
function startLevel(levelNumber) {
  rectangles = levelNumber === 1 ? [] : createLevel(levelNumber);
  gameOver = false;
  levelStartTime = millis();
  lastSpawnTime = millis();
  level1PauseStarted = false;
  barOscillation = false;
  barOscillationStart = 0;
}

/* ---------- GAME LOOP ---------- */
function draw() {
  background(0);
  noStroke();

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

  // ---- LEVEL 1 SPAWNING & BAR OSCILLATION ----
  if (level === 1 && !gameOver && !paused) {
    const currentTime = millis();
    const elapsed = (currentTime - levelStartTime) / 1000;
    const lanePositions = { F: width / 4 - rectWidth / 2, J: (3 * width) / 4 - rectWidth / 2 };

    // Spawn rectangles until 60s
    if (elapsed < 60 && currentTime - lastSpawnTime > random(spawnInterval * 0.5, spawnInterval * 1.5)) {
      const key = random(["F", "J"]);
      rectangles.push({ x: lanePositions[key], y: -rectHeight, key, hit: false });
      lastSpawnTime = currentTime;
    }

    // Start bar oscillation at ~30s
    if (elapsed >= 30 && !barOscillation) {
      barOscillation = true;
      barOscillationStart = currentTime;
    }

    // Apply oscillation if started
    if (barOscillation) {
      const oscTime = (currentTime - barOscillationStart) / 1000;
      barY = (height - 50) + 15 * sin(TWO_PI * oscTime / 2);
    }

    // Move to Level 2 after 60s and all rectangles cleared
    if (elapsed >= 60 && rectangles.every(r => r.hit || r.y > barY + barHeight)) {
      level = 2;
      startLevel(level);
    }
  }

  // ---- Hit bar ----
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(255);
  fill(255, 200);
  rect(0, barY, width, barHeight);
  drawingContext.shadowBlur = 0;

  // ---- Rectangles ----
  if (!gameOver) {
    rectangles.forEach(r => {
      if (!r.hit) {
        if (!paused) r.y += speed;

        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = r.key === "F" ? color(0, 255, 255) : color(255, 0, 255);
        fill(r.key === "F" ? color(0, 255, 255) : color(255, 0, 255));
        rect(r.x, r.y, rectWidth, rectHeight, 12);
        drawingContext.shadowBlur = 0;

        if (!paused && r.y > barY + barHeight) {
          gameOver = true;
          document.getElementById("message").innerText = "Game Over! You missed a note.";
          document.getElementById("retryButton").style.display = "block";
        }
      }
    });

    let allHit = rectangles.every(r => r.hit);
    if (allHit && !gameOver && level !== 1) {
      if (level < maxLevels) {
        level++;
        speed += 1;
        document.getElementById("message").innerText = `Level ${level - 1} Complete! Get ready for Level ${level}`;
        startLevel(level);
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
  if (paused) return;
  if (gameOver) return;

  const pressedKey = key.toUpperCase();

  if (pressedKey === "F") laneGlow.F = 80;
  synthLow.currentTime = 0; // reset to start
    synthLow.play().catch(err => console.log("F sound blocked:", err));
  if (pressedKey === "J") laneGlow.J = 80;

  rectangles.forEach(r => {
    if (!r.hit && r.key === pressedKey) {
      if (r.y + rectHeight >= barY - hitBuffer && r.y <= barY + barHeight + hitBuffer) {
        r.hit = true;

        const hitCenter = barY + barHeight / 2;
        let hitType;
        if (r.y + rectHeight < hitCenter - 5) hitType = "Early";
        else if (r.y + rectHeight > hitCenter + 5) hitType = "Late";
        else hitType = "Perfect";

        document.getElementById("hitFeedback").innerText = hitType;
        createBurst(r.x, r.y, r.key === "F" ? color(0, 255, 255) : color(255, 0, 255));

        const hitFeedback = document.getElementById("hitFeedback");
        hitFeedback.style.color = hitType === "Perfect" ? "#00FFAA" : "yellow";
        hitFeedback.style.opacity = "1";
        setTimeout(() => { hitFeedback.style.opacity = "0"; }, 250);
      }
    }
  });
}

function createBurst(x, y, noteColor) {
  const count = 8;
  for (let i = 0; i < count; i++) {
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