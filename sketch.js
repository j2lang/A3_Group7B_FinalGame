let rectangles = [];

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

/* ---------- Hit bar ---------- */
const barBaseY = 550; // set properly in setup() once height is known
let barBaseYValue; // mutable, set in setup
const barOscillateStart = 30; // seconds into song before bar starts bobbing
const barAmplitude = 25; // pixels up/down
const barPeriod = 1.5; // seconds per full bob cycle

// Returns the bar's Y position at any given song time.
// Before 30s it's fixed; after 30s it bobs sinusoidally.
// Both note positioning and hit detection call this so they're always in sync.
function getBarY(songTime) {
  if (songTime < barOscillateStart) return barBaseYValue;
  const t = songTime - barOscillateStart;
  return barBaseYValue + barAmplitude * sin((TWO_PI * t) / barPeriod);
}

/* ---------- Beat / timing constants ---------- */
const BPM = 160;
const beatInterval = 60 / BPM; // seconds per beat (~0.375s)
const beatOffset = 8; // beats of lead-in before first note hits the bar
const leadin = 6; // how many beats before the hit bar a note spawns
const travelTime = leadin * beatInterval; // seconds a note takes to cross the screen
let pixelsPerSecond; // calculated in setup() once barY is known

/* ---------- Beatmap ---------- */
// Each entry: { beat: <beat number>, key: "F" or "J" }
// Beat 0 = the very first beat of the song.
// Add/remove entries to design your level.
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
  screen.style.display = "flex";
}

/* ---------- GAME SETUP ---------- */
function setup() {
  createCanvas(600, 600).parent("gameContainer");
  barBaseYValue = height - 50;

  // pixelsPerSecond uses barBaseYValue (the resting position).
  // Notes always travel the same distance — the bar bobs around that baseline.
  pixelsPerSecond = (barBaseYValue + rectHeight) / travelTime;

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
    document.getElementById("pauseButton").innerText = paused
      ? "▶ PLAY"
      : "II PAUSE";
    if (paused) bgMusic.pause();
    else bgMusic.play().catch((err) => console.log("Music blocked:", err));
  };

  document.getElementById("retryButton").addEventListener("click", resetGame);
  document.getElementById("instructionsButton").onclick = () =>
    showScreen(instructionsScreen);
  document.getElementById("instructionsBackButton").onclick = () =>
    showScreen(homeScreen);
  document.getElementById("backButton").onclick = () => showScreen(homeScreen);
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
  laneGlow = { F: 0, J: 0 };
  spawnedBeats = new Set();

  bgMusic.currentTime = 0;

  document.getElementById("retryButton").style.display = "none";
  document.getElementById("hitFeedback").innerText = "";
  document.getElementById("message").innerText =
    "Hit F or J as rectangles reach the bar";
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

    const targetTime = (entry.beat + beatOffset) * beatInterval; // when note should hit the bar (seconds)
    const spawnTime = targetTime - travelTime; // when note should appear (seconds)

    if (songTime >= spawnTime) {
      const laneX =
        entry.key === "F"
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
        // Position note based on song time and where the bar currently is.
        // getBarY(songTime) ensures the note tracks the bar's bobbing position.
        const timeUntilHit = r.targetTime - songTime;
        r.y = getBarY(songTime) - timeUntilHit * pixelsPerSecond;

        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor =
          r.key === "F" ? color(0, 255, 255) : color(255, 0, 255);
        fill(r.key === "F" ? color(0, 255, 255) : color(255, 0, 255));
        rect(r.x, r.y, rectWidth, rectHeight, 12);
        drawingContext.shadowBlur = 0;

        // Miss: note passed the bar without being hit
        if (r.y > getBarY(songTime) + barHeight + 10) {
          gameOver = true;
          document.getElementById("message").innerText =
            "Game Over! You missed a note.";
          document.getElementById("retryButton").style.display = "block";
        }
      }
    });

    // Check level complete: all notes for this level are spawned and hit
    const levelNotes = beatmap.filter((e) => e.level === level);
    const allSpawned = levelNotes.every((_, i) => {
      // find this entry's global index
      const globalIndex = beatmap.indexOf(levelNotes[i]);
      return spawnedBeats.has(globalIndex);
    });
    const allHit = rectangles
      .filter((r) => beatmap.findIndex((e, i) => e.level === level) !== -1)
      .every((r) => r.hit);

    if (
      allSpawned &&
      rectangles.filter((r) => !r.hit).length === 0 &&
      !gameOver
    ) {
      if (level < maxLevels) {
        level++;
        document.getElementById("message").innerText =
          `Level ${level - 1} Complete! Get ready for Level ${level}`;
      } else {
        gameOver = true;
        document.getElementById("message").innerText =
          "All Levels Complete! 🎉";
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

        // Timing accuracy based on how close to the beat the player was
        const timingError = Math.abs(r.targetTime - songTime); // seconds off
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

        createBurst(
          r.x,
          r.y,
          r.key === "F" ? color(0, 255, 255) : color(255, 0, 255),
        );
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
