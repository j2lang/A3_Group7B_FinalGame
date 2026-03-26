/* ---------- Level creation ---------- */
function createLevel(levelNumber) {
  const rects = [];

  if (levelNumber === 1) {
    // Level 1: start empty, rectangles will spawn dynamically in sketch.js
  } else {
    // Example static levels for Level 2+
    const lanePositions = [150, 450]; // example X positions
    const keys = ["F", "J"];

    for (let i = 0; i < levelNumber * 10; i++) {
      const key = random(keys);
      const x = key === "F" ? lanePositions[0] : lanePositions[1];
      const y = -i * 100; // staggered start
      rects.push({ x, y, key, hit: false });
    }
  }

  return rects;
}