// All beatmap and level data lives here.
// sketch.js calls generateBeatmap() to get the full note list.

function generateBeatmap() {
  const map = [];
  const L2 = 8;  // extra beat offset for level 2 intro pause
  const L3 = 8;  // extra beat offset for level 3 intro pause

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
  F(0,  1);
  J(4,  1);
  F(8,  1);
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
  // L2 adds an 8-beat intro pause matching level 1's lead-in feel.
  F(82+L2,  2);
  J(84+L2,  2);
  F(85+L2,  2);
  J(87+L2,  2);
  FJ(89+L2, 2);
  F(91+L2,  2);
  J(92+L2,  2);
  F(94+L2,  2);
  FJ(96+L2, 2);
  J(98+L2,  2);
  F(99+L2,  2);
  J(101+L2, 2);
  F(103+L2, 2);
  FJ(105+L2,2);
  J(107+L2, 2);
  F(108+L2, 2);
  J(110+L2, 2);
  F(112+L2, 2);
  J(113+L2, 2);
  FJ(115+L2,2);
  F(117+L2, 2);
  J(119+L2, 2);
  F(120+L2, 2);
  J(122+L2, 2);
  FJ(124+L2,2);
  F(126+L2, 2);
  J(127+L2, 2);
  F(129+L2, 2);
  J(131+L2, 2);
  FJ(133+L2,2);
  F(135+L2, 2);
  J(136+L2, 2);
  F(138+L2, 2);
  J(140+L2, 2);
  FJ(142+L2,2);
  F(144+L2, 2);
  J(146+L2, 2);
  FJ(148+L2,2);
  F(150+L2, 2);
  J(151+L2, 2);
  F(153+L2, 2);
  FJ(155+L2,2);
  J(157+L2, 2);
  F(158+L2, 2);
  J(160+L2, 2);

  // ---- LEVEL 3 ----
  // Tighter spacing (1 beat apart), more doubles, a few triplet-feel runs.
  // L3 adds an 8-beat intro pause matching level 1's lead-in feel.
  F(162+L3,  3);
  J(163+L3,  3);
  F(165+L3,  3);
  J(166+L3,  3);
  FJ(168+L3, 3);
  F(169+L3,  3);
  J(171+L3,  3);
  F(172+L3,  3);
  FJ(174+L3, 3);
  J(175+L3,  3);
  F(177+L3,  3);
  J(178+L3,  3);
  F(180+L3,  3);
  FJ(181+L3, 3);
  J(183+L3,  3);
  F(184+L3,  3);
  J(185+L3,  3);
  F(187+L3,  3);
  J(188+L3,  3);
  FJ(190+L3, 3);
  F(191+L3,  3);
  J(193+L3,  3);
  F(194+L3,  3);
  J(195+L3,  3);
  FJ(197+L3, 3);
  F(198+L3,  3);
  J(200+L3,  3);
  F(201+L3,  3);
  FJ(203+L3, 3);
  J(204+L3,  3);
  F(206+L3,  3);
  J(207+L3,  3);
  F(208+L3,  3);
  FJ(210+L3, 3);
  J(211+L3,  3);
  F(213+L3,  3);
  J(214+L3,  3);
  FJ(216+L3, 3);
  F(217+L3,  3);
  J(219+L3,  3);
  F(220+L3,  3);
  J(221+L3,  3);
  FJ(223+L3, 3);
  F(224+L3,  3);
  J(226+L3,  3);
  FJ(228+L3, 3);

  return map;
}