// All beatmap and level data lives here.
// sketch.js calls generateBeatmap() to get the full note list.

function generateBeatmap() {
  const map = [];

  function F(beat, level)  { map.push({ beat, key: "F", level }); }
  function J(beat, level)  { map.push({ beat, key: "J", level }); }
  function FJ(beat, level) {
    map.push({ beat, key: "F", level });
    map.push({ beat, key: "J", level });
  }

   // ---- LEVEL 1 ----
  // Structured in waves: sparse intro, then alternating calm/busy sections.
  // Minimum 2 beats apart within a wave, 4+ beats between waves.

  // Wave 1: gentle intro (every 4 beats)
  F(0, 1);
  J(4, 1);
  F(8, 1);
  J(12, 1);

  // Wave 2: a little busier (every 2 beats)
  F(18, 1);
  J(20, 1);
  F(22, 1);
  J(24, 1);

  // Breather (4 beat gap)

  // Wave 3: back to sparse
  J(30, 1);
  F(34, 1);
  J(38, 1);

  // Wave 4: burst with a double
  F(44, 1);
  J(46, 1);
  FJ(48, 1);
  F(50, 1);

  // Breather

  // Wave 5: sparse again
  J(56, 1);
  F(60, 1);
  J(64, 1);

  // Wave 6: closing burst
  F(70, 1);
  J(72, 1);
  F(74, 1);
  FJ(76, 1);
  J(78, 1);
  F(80, 1);

  // ---- LEVEL 2 ----
  // Notes spaced 1–2 beats apart. More doubles, some syncopation.
  F(82, 2);
  J(84, 2);
  F(85, 2); // syncopated off-beat feel
  J(87, 2);
  FJ(89, 2);
  F(91, 2);
  J(92, 2);
  F(94, 2);
  FJ(96, 2);
  J(98, 2);
  F(99, 2);
  J(101, 2);
  F(103, 2);
  FJ(105, 2);
  J(107, 2);
  F(108, 2);
  J(110, 2);
  F(112, 2);
  J(113, 2);
  FJ(115, 2);
  F(117, 2);
  J(119, 2);
  F(120, 2);
  J(122, 2);
  FJ(124, 2);
  F(126, 2);
  J(127, 2);
  F(129, 2);
  J(131, 2);
  FJ(133, 2);
  F(135, 2);
  J(136, 2);
  F(138, 2);
  J(140, 2);
  FJ(142, 2);
  F(144, 2);
  J(146, 2);
  FJ(148, 2);
  F(150, 2);
  J(151, 2);
  F(153, 2);
  FJ(155, 2);
  J(157, 2);
  F(158, 2);
  J(160, 2);

  // ---- LEVEL 3 ----
  // Tighter spacing (1 beat apart), more doubles, a few triplet-feel runs.
  F(162, 3);
  J(163, 3);
  F(165, 3);
  J(166, 3);
  FJ(168, 3);
  F(169, 3);
  J(171, 3);
  F(172, 3);
  FJ(174, 3);
  J(175, 3);
  F(177, 3);
  J(178, 3);
  F(180, 3);
  FJ(181, 3);
  J(183, 3);
  F(184, 3);
  J(185, 3);
  F(187, 3);
  J(188, 3);
  FJ(190, 3);
  F(191, 3);
  J(193, 3);
  F(194, 3);
  J(195, 3);
  FJ(197, 3);
  F(198, 3);
  J(200, 3);
  F(201, 3);
  FJ(203, 3);
  J(204, 3);
  F(206, 3);
  J(207, 3);
  F(208, 3);
  FJ(210, 3);
  J(211, 3);
  F(213, 3);
  J(214, 3);
  FJ(216, 3);
  F(217, 3);
  J(219, 3);
  F(220, 3);
  J(221, 3);
  FJ(223, 3);
  F(224, 3);
  J(226, 3);
  FJ(228, 3);

  return map;
}