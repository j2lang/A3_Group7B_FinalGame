// All beatmap and level data lives here.
// sketch.js calls generateBeatmap() to get the full note list.
//
// Tap note:  F(beat, level)           — press and release
// Hold note: H("F", beat, holds, level) — press and hold for `holds` beats

function generateBeatmap() {
  const map = [];
  const L2 = -82;
  const L3 = -162;

  // Tap helpers
  function F(beat, level)  { map.push({ beat, key: "F", level }); }
  function J(beat, level)  { map.push({ beat, key: "J", level }); }
  function D(beat, level)  { map.push({ beat, key: "D", level }); }
  function K(beat, level)  { map.push({ beat, key: "K", level }); }
  function S(beat, level)  { map.push({ beat, key: " ", level }); }

  function FJ(beat, level) {
    map.push({ beat, key: "F", level });
    map.push({ beat, key: "J", level });
  }

  // Hold helper: H(key, beat, holdBeats, level)
  function H(key, beat, holdBeats, level) {
    map.push({ beat, key, holdBeats, level });
  }

  // ---- LEVEL 1 ----
  // Introduces tap notes on F and J only, with a few hold notes.

  // Wave 1: gentle intro (every 4 beats)
  F(0,  1);
  J(4,  1);
  F(8,  1);
  J(12, 1);

  // Wave 2: busier, first hold notes introduced
  F(18, 1);
  H("J", 20, 2, 1);   // hold J for 2 beats
  F(22, 1);
  J(24, 1);

  // Breather

  // Wave 3: sparse with a hold
  H("J", 30, 3, 1);   // hold J for 3 beats
  F(34, 1);
  J(38, 1);

  // Wave 4: burst with a double and a hold
  F(44, 1);
  J(46, 1);
  FJ(48, 1);
  H("F", 50, 2, 1);   // hold F for 2 beats

  // Breather

  // Wave 5: sparse
  J(56, 1);
  H("F", 60, 4, 1);   // hold F for 4 beats
  J(64, 1);

  // Wave 6: closing burst
  F(70, 1);
  J(72, 1);
  F(74, 1);
  FJ(76, 1);
  H("J", 78, 2, 1);   // hold J for 2 beats
  F(80, 1);

  // ---- LEVEL 2 ----
  // Introduces D and K lanes. More holds, faster taps.
  F(82+L2,  2);
  J(84+L2,  2);
  D(85+L2,  2);
  H("K", 87+L2, 2, 2);
  FJ(89+L2, 2);
  D(91+L2,  2);
  F(92+L2,  2);
  H("K", 94+L2, 3, 2);
  J(96+L2,  2);
  D(98+L2,  2);
  F(99+L2,  2);
  K(101+L2, 2);
  H("J", 103+L2, 2, 2);
  FJ(105+L2,2);
  D(107+L2, 2);
  K(108+L2, 2);
  H("F", 110+L2, 2, 2);
  J(112+L2, 2);
  D(113+L2, 2);
  FJ(115+L2,2);
  H("K", 117+L2, 2, 2);
  F(119+L2, 2);
  D(120+L2, 2);
  J(122+L2, 2);
  H("K", 124+L2, 3, 2);
  FJ(126+L2,2);
  D(127+L2, 2);
  H("F", 129+L2, 2, 2);
  K(131+L2, 2);
  J(133+L2, 2);
  D(135+L2, 2);
  FJ(136+L2,2);
  H("K", 138+L2, 2, 2);
  F(140+L2, 2);
  D(142+L2, 2);
  J(144+L2, 2);
  K(146+L2, 2);
  FJ(148+L2,2);
  H("D", 150+L2, 2, 2);
  F(151+L2, 2);
  K(153+L2, 2);
  J(155+L2, 2);
  D(157+L2, 2);
  F(158+L2, 2);
  K(160+L2, 2);

  // ---- LEVEL 3 ----
  // All 5 lanes including Space. Tighter spacing, longer holds.
  F(162+L3,  3);
  D(163+L3,  3);
  H(" ", 165+L3, 2, 3);   // hold Space for 2 beats
  K(166+L3,  3);
  FJ(168+L3, 3);
  H(" ", 169+L3, 3, 3);
  D(171+L3,  3);
  K(172+L3,  3);
  FJ(174+L3, 3);
  H(" ", 175+L3, 2, 3);
  F(177+L3,  3);
  D(178+L3,  3);
  J(180+L3,  3);
  FJ(181+L3, 3);
  H("K", 183+L3, 2, 3);
  H(" ", 184+L3, 2, 3);
  D(185+L3,  3);
  F(187+L3,  3);
  K(188+L3,  3);
  FJ(190+L3, 3);
  H(" ", 191+L3, 3, 3);
  D(193+L3,  3);
  J(194+L3,  3);
  K(195+L3,  3);
  FJ(197+L3, 3);
  H(" ", 198+L3, 2, 3);
  F(200+L3,  3);
  H("D", 201+L3, 2, 3);
  FJ(203+L3, 3);
  H("K", 204+L3, 2, 3);
  H(" ", 206+L3, 3, 3);
  J(207+L3,  3);
  D(208+L3,  3);
  FJ(210+L3, 3);
  H("K", 211+L3, 2, 3);
  H(" ", 213+L3, 2, 3);
  F(214+L3,  3);
  D(216+L3,  3);
  FJ(217+L3, 3);
  H("K", 219+L3, 3, 3);
  H(" ", 220+L3, 2, 3);
  J(221+L3,  3);
  FJ(223+L3, 3);
  H("D", 224+L3, 2, 3);
  H("K", 226+L3, 2, 3);
  FJ(228+L3, 3);

  return map;
}