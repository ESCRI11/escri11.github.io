// hero-globe.js — CHOSEN hero visual: skeleton-movement dot-globe (the globe is the mainspring barrel driving an exposed going train).
// Self-contained vanilla Canvas 2D IIFE. Requires a <canvas id="halftone" width=380 height=380> inside .portrait. No dependencies.

// ---- L3 halftone portrait — vSKEL: open-worked skeleton caliber ----
(function () {
  'use strict';
  var canvas = document.getElementById('halftone');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  /* ---------- palette ---------- */
  var INK   = [232, 234, 237];
  var EMBER = [224, 190, 170];
  var TEAL  = [114, 222, 194];
  var BG    = '#08090B';

  /* ---------- sprites (pre-rendered crisp dots) ---------- */
  function makeSprite(rgb) {
    var s = document.createElement('canvas');
    s.width = s.height = 48;
    var c = s.getContext('2d');
    c.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    c.beginPath();
    c.arc(24, 24, 20, 0, Math.PI * 2);
    c.fill();
    return s;
  }
  var RAMP_N = 8, RAMP = [];
  for (var ri = 0; ri < RAMP_N; ri++) {
    var m = ri / (RAMP_N - 1);
    RAMP.push(makeSprite([
      Math.round(INK[0] + (EMBER[0] - INK[0]) * m),
      Math.round(INK[1] + (EMBER[1] - INK[1]) * m),
      Math.round(INK[2] + (EMBER[2] - INK[2]) * m)
    ]));
  }
  var SPR_TEAL = makeSprite(TEAL);

  var DEG = Math.PI / 180, TAU = Math.PI * 2;

  /* ---------- going train (18,000 vph) — layout in 190-space ----------
     barrel (globe face) -> centre -> third -> fourth -> escape.
     Wheel i meshes the pinion of arbor i+1; a universal circular pitch
     locks tooth rate at every tangent, so teeth stay interleaved.       */
  var PITCH = 4.8, BEATS = 5;               /* 5 vib/s = 18,000 vph */
  var TN = [60, 40, 30, 24, 15];            /* wheel teeth   */
  var PN = [ 0, 16, 14, 12,  8];            /* pinion leaves */
  function pr(n) { return n * PITCH / TAU; }/* pitch radius  */
  var MESH = [38 * DEG, 97 * DEG, 152 * DEG, 192 * DEG];
  var C = [[74, 62]];                       /* barrel centre */
  for (var ai = 0; ai < 4; ai++) {
    var dd = pr(TN[ai]) + pr(PN[ai + 1]);
    C.push([C[ai][0] + Math.cos(MESH[ai]) * dd,
            C[ai][1] + Math.sin(MESH[ai]) * dd]);
  }
  /* angular rates: escape averages half a tooth-pitch per beat;
     every mesh reverses direction with ratio wheel/pinion       */
  var OM = [0, 0, 0, 0, 0];
  OM[4] = BEATS * Math.PI / TN[4];
  for (ai = 3; ai >= 0; ai--) OM[ai] = -OM[ai + 1] * PN[ai + 1] / TN[ai];

  /* ---------- per-wheel dot features (arbor frame, T = 0) ---------- */
  function wheelFeats(i) {
    var f = [], Rw = pr(TN[i]), kk, a;
    var toothA = (i < 4 ? MESH[i] : 0);     /* tooth dead on the mesh line */
    var esc = (i === 4);
    for (kk = 0; kk < TN[i]; kk++) {
      a = toothA + kk * TAU / TN[i];
      if (esc) {                            /* raked club teeth */
        f.push({ a: a,          r: Rw + 1.4, s: 0.95, al: 0.62, m: 0 });
        f.push({ a: a + 0.085,  r: Rw - 1.9, s: 0.70, al: 0.44, m: 0 });
      } else {                              /* gilt tooth tip + root */
        f.push({ a: a, r: Rw + 1.5, s: 0.88, al: 0.52, m: 4 });
        f.push({ a: a, r: Rw - 1.8, s: 0.60, al: 0.34, m: 2 });
      }
    }
    var rr = Rw - (esc ? 3.0 : 3.5);
    var nr = Math.max(10, Math.round(TAU * rr / 2.7));
    for (kk = 0; kk < nr; kk++)
      f.push({ a: kk * TAU / nr + 0.5, r: rr, s: 0.58, al: 0.26, m: 2 });
    if (i > 0) {
      var arms = [0, 4, 4, 3, 4][i];
      for (kk = 0; kk < arms; kk++) {
        var aa = kk * TAU / arms + 0.4;
        for (var rj = 5.0; rj < rr - 1.6; rj += 3.0)
          f.push({ a: aa, r: rj, s: 0.56, al: 0.22, m: 1 });
      }
      /* steel pinion, phased so a gap faces the incoming wheel tooth */
      var rho = pr(PN[i]);
      var pinA = MESH[i - 1] + Math.PI + Math.PI / PN[i];
      for (kk = 0; kk < PN[i]; kk++)
        f.push({ a: pinA + kk * TAU / PN[i], r: rho - 0.2, s: 0.85, al: 0.52, m: 0 });
      for (kk = 0; kk < 6; kk++)
        f.push({ a: kk * TAU / 6, r: 2.9, s: 0.5, al: 0.28, m: 1 });
    }
    return f;
  }
  var FEATS = [];
  for (ai = 0; ai < 5; ai++) FEATS.push(wheelFeats(ai));

  /* ---------- balance + pallet geometry ---------- */
  var CB = [41.4, 125.3], RB = 15, AMP = 1.9, LMAX = 0.13;
  var PL = [52.1, 137.2];                      /* pallet pivot */
  var axB = Math.atan2(C[4][1] - PL[1], C[4][0] - PL[0]); /* lever axis -> escape */
  var balF = [];                               /* rotating balance features */
  for (var bk = 0; bk < 45; bk++)
    balF.push({ a: bk * TAU / 45, r: RB, s: 0.62, al: 0.5, m: 2 });
  for (bk = 0; bk < 2; bk++) {
    var ba = bk * Math.PI + 0.3;
    for (var br = 3.4; br < RB - 1.4; br += 2.6)
      balF.push({ a: ba, r: br, s: 0.54, al: 0.26, m: 1 });
  }
  for (bk = 0; bk < 4; bk++)                   /* timing screws */
    balF.push({ a: bk * Math.PI / 2 + 0.55, r: RB, s: 1.0, al: 0.55, m: 6 });
  /* hairspring: dots along an Archimedean spiral */
  var spiral = [], thMax = 3.3 * TAU, th = 0.4;
  while (th < thMax) {
    var sr = 2.2 + 9.6 * (th / thMax);
    spiral.push({ th: th, r: sr });
    th += 2.0 / sr;
  }

  /* ---------- bridges / cock: sparse dotted capsules ---------- */
  var bridge = [];
  function addCapsule(x1, y1, x2, y2, w) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / L, uy = dy / L, nx = -uy, ny = ux, s, u;
    for (s = -w; s <= L + w; s += 3.3) {
      for (u = -w + 1; u <= w - 1; u += 3.3) {
        var cs2 = s < 0 ? 0 : (s > L ? L : s), ds = s - cs2;
        if (ds * ds + u * u > (w - 1) * (w - 1) && (s < 0 || s > L)) continue;
        if (Math.random() > 0.42) continue;
        bridge.push({ x: x1 + ux * s + nx * u + (Math.random() - 0.5) * 1.7,
                      y: y1 + uy * s + ny * u + (Math.random() - 0.5) * 1.7,
                      s: 0.4 + Math.random() * 0.28,
                      al: 0.05 + Math.random() * 0.035,
                      m: 1, ph: Math.random() * TAU });
      }
    }
    for (s = 0; s <= L; s += 3.0) {            /* edge dots */
      for (var sd = -1; sd <= 1; sd += 2) {
        if (Math.random() > 0.8) continue;
        bridge.push({ x: x1 + ux * s + nx * w * sd + (Math.random() - 0.5),
                      y: y1 + uy * s + ny * w * sd + (Math.random() - 0.5),
                      s: 0.48, al: 0.085, m: 1, ph: Math.random() * TAU });
      }
    }
    var thN = Math.atan2(ny, nx);
    for (var e = 0; e < 2; e++) {              /* rounded end caps */
      var ex = e ? x2 : x1, ey = e ? y2 : y1, sg = e ? -1 : 1;
      for (var aa = 0; aa <= Math.PI; aa += 3.0 / w) {
        if (Math.random() > 0.85) continue;
        bridge.push({ x: ex + Math.cos(thN + sg * aa) * w,
                      y: ey + Math.sin(thN + sg * aa) * w,
                      s: 0.48, al: 0.08, m: 1, ph: Math.random() * TAU });
      }
    }
  }
  addCapsule(127.5, 87, 108.5, 145.5, 7.5);    /* train bridge  */
  addCapsule(90, 161.5, 52.5, 146, 7);         /* escape bridge */
  addCapsule(15.5, 99.5, CB[0], CB[1], 7);     /* balance cock  */
  /* bridge screws: dot ring + slot */
  function addScrew(sx, sy, slot) {
    for (var q = 0; q < 7; q++)
      bridge.push({ x: sx + Math.cos(q * TAU / 7) * 1.9,
                    y: sy + Math.sin(q * TAU / 7) * 1.9,
                    s: 0.48, al: 0.3, m: 2, ph: q });
    for (q = -1; q <= 1; q++)
      bridge.push({ x: sx + Math.cos(slot) * q * 1.05,
                    y: sy + Math.sin(slot) * q * 1.05,
                    s: 0.4, al: 0.34, m: 2, ph: q });
  }
  addScrew(125.6, 84.4, 0.6);
  addScrew(90.8, 162.8, 2.2);
  addScrew(17.2, 100.2, 1.1);

  /* ---------- globe lattice (barrel face) ---------- */
  var pts = [];
  for (var la = -78; la <= 78; la += 6) {
    var phi = la * DEG, cphi = Math.cos(phi), sphi = Math.sin(phi);
    for (var lo = 0; lo < 360; lo += 6) {
      var lam = lo * DEG;
      pts.push({
        x: cphi * Math.sin(lam),
        y: -sphi,
        z: cphi * Math.cos(lam),
        rnd: Math.random(),
        tw: Math.random() * TAU,
        emph: (la % 30 === 0 || lo % 30 === 0) ? 1 : 0,
        pole: Math.pow(cphi, 0.75)
      });
    }
  }
  /* home marker 46.01N 8.96E */
  var hphi = 46.01 * DEG, hlam = 8.96 * DEG, hc = Math.cos(hphi);
  var HOME = { x: hc * Math.sin(hlam), y: -Math.sin(hphi), z: hc * Math.cos(hlam),
               ph: Math.random() * TAU };

  /* ---------- dust ---------- */
  var dust = [];
  for (var di = 0; di < 40; di++) {
    dust.push({ a: Math.random() * TAU, r: Math.random(),
                tw: Math.random() * TAU, s: 0.4 + Math.random() * 0.6 });
  }

  /* ---------- viewport ---------- */
  var W = 190, H = 190, k = 1, OXo = 0, OYo = 0, DPR = 1;
  function X(x) { return OXo + x * k; }
  function Y(y) { return OYo + y * k; }
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cw = rect.width || 190, ch = rect.height || 190;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    k = Math.min(W, H) / 190;
    OXo = (W - 190 * k) / 2;
    OYo = (H - 190 * k) / 2;
  }
  resize();
  window.addEventListener('resize', function () {
    resize();
    if (reduced) draw(STILL_T);
  });

  /* ---------- globe orientation / light ---------- */
  var TIP = 0.42, LEAN = -0.24;
  var ct = Math.cos(TIP), stp = Math.sin(TIP);
  var cl = Math.cos(LEAN), sl = Math.sin(LEAN);
  var LX = -0.45, LY = -0.45, LZ = 0.79;
  var Ln = Math.sqrt(LX * LX + LY * LY + LZ * LZ);
  LX /= Ln; LY /= Ln; LZ /= Ln;
  var SPIN = 0.085;
  var RG = 39.5;                       /* globe radius, 190-space */

  /* ---------- escapement clock: the whole train steps per beat ---------- */
  function trainTime(t) {
    var b = t * BEATS, f = Math.floor(b), fr = b - f;
    fr = fr < 0.3 ? fr / 0.3 : 1;
    fr = fr * fr * (3 - 2 * fr);
    return { T: (f + fr) / BEATS, f: f, snap: fr };
  }

  function drawWheel(i, T, t) {
    var cx = X(C[i][0]), cy = Y(C[i][1]);
    var rot = OM[i] * T;
    var f = FEATS[i];
    for (var j = 0; j < f.length; j++) {
      var d = f[j];
      var a = d.a + rot;
      var px = cx + Math.cos(a) * d.r * k;
      var py = cy + Math.sin(a) * d.r * k;
      var tw = 0.87 + 0.13 * Math.sin(t * 0.6 + d.a * 9.3 + i);
      var s = d.s * k;
      ctx.globalAlpha = d.al * tw;
      ctx.drawImage(RAMP[d.m], px - s, py - s, s * 2, s * 2);
    }
  }

  function jewel(x, y, s, al) {
    var px = X(x), py = Y(y), so = s * k;
    ctx.globalAlpha = al * 0.14;
    ctx.drawImage(SPR_TEAL, px - so * 3.2, py - so * 3.2, so * 6.4, so * 6.4);
    ctx.globalAlpha = al;
    ctx.drawImage(SPR_TEAL, px - so, py - so, so * 2, so * 2);
  }
  function chaton(x, y, r) {
    var px = X(x), py = Y(y);
    for (var q = 0; q < 6; q++) {
      var qa = q * TAU / 6 + 0.26;
      ctx.globalAlpha = 0.3;
      ctx.drawImage(RAMP[7], px + Math.cos(qa) * r * k - 0.5 * k,
                             py + Math.sin(qa) * r * k - 0.5 * k, k, k);
    }
  }

  function draw(t) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var tt = trainTime(t), T = tt.T;
    var i, j, px, py, s, a;

    /* ---- dust ---- */
    for (i = 0; i < dust.length; i++) {
      var d = dust[i];
      var twD = 0.5 + 0.5 * Math.sin(t * 0.5 + d.tw);
      ctx.globalAlpha = 0.018 + 0.024 * twD;
      var dr = Math.min(W, H) * (0.30 + 0.45 * d.r);
      var dx = W * 0.5 + Math.cos(d.a) * dr;
      var dy = H * 0.5 + Math.sin(d.a) * dr;
      var ds = d.s * k;
      ctx.drawImage(RAMP[0], dx - ds, dy - ds, ds * 2, ds * 2);
    }

    /* ---- bridges / plates (behind the train) ---- */
    for (i = 0; i < bridge.length; i++) {
      var b = bridge[i];
      var twB = 0.8 + 0.2 * Math.sin(t * 0.35 + b.ph);
      ctx.globalAlpha = b.al * twB;
      s = b.s * k;
      ctx.drawImage(RAMP[b.m], X(b.x) - s, Y(b.y) - s, s * 2, s * 2);
    }

    /* ---- barrel teeth + rim (the globe is its face) ---- */
    drawWheel(0, T, t);

    /* ---- globe lattice ---- */
    var gx = X(C[0][0]), gy = Y(C[0][1]), Rpx = RG * k, GK = Rpx / 60;
    var spin = t * SPIN;
    var cs = Math.cos(spin), ss = Math.sin(spin);
    var n = pts.length;
    for (i = 0; i < n; i++) {
      var pt = pts[i];
      var x = pt.x * cs + pt.z * ss;
      var z = -pt.x * ss + pt.z * cs;
      var y = pt.y;
      var y2 = y * ct - z * stp;
      var z2 = y * stp + z * ct;
      var x3 = x * cl - y2 * sl;
      var y3 = x * sl + y2 * cl;
      px = gx + x3 * Rpx;
      py = gy + y3 * Rpx;
      if (z2 < 0) {
        if (pt.rnd < 0.26) {
          ctx.globalAlpha = 0.065;
          ctx.drawImage(RAMP[5], px - 0.65 * GK, py - 0.65 * GK, 1.3 * GK, 1.3 * GK);
        }
        continue;
      }
      var lit = x3 * LX + y3 * LY + z2 * LZ;
      if (lit < 0) lit = 0;
      var rim = Math.pow(1 - z2, 2.2);
      var emberAmt = (1 - lit) * rim;
      var dens = 0.37 + 0.63 * Math.pow(lit, 0.65) + emberAmt * 0.4;
      var margin = dens - pt.rnd;
      if (margin <= 0) continue;
      var fade = margin < 0.12 ? margin / 0.12 : 1;
      var rampIdx = Math.min(RAMP_N - 1, Math.round(emberAmt * 2.0 * (RAMP_N - 1)));
      var tw = 1 + 0.07 * Math.sin(t * 0.8 + pt.tw);
      var alpha = (0.14 + 0.74 * Math.pow(lit, 1.3) + emberAmt * 0.32) * pt.pole * tw;
      alpha *= (pt.emph ? 1.3 : 1.0);
      alpha *= fade;
      if (alpha > 0.95) alpha = 0.95;
      var rad = (0.64 + 0.92 * lit + emberAmt * 0.3) * (pt.emph ? 1.22 : 1.0);
      rad *= (0.62 + 0.38 * pt.pole) / 0.9;
      rad *= GK;
      ctx.globalAlpha = alpha;
      ctx.drawImage(RAMP[rampIdx], px - rad, py - rad, rad * 2, rad * 2);
    }

    /* ---- home ping (46.01N 8.96E) ---- */
    var xs = HOME.x * cs + HOME.z * ss;
    var zs = -HOME.x * ss + HOME.z * cs;
    var ys = HOME.y;
    var y2s = ys * ct - zs * stp;
    var z2s = ys * stp + zs * ct;
    var x3s = xs * cl - y2s * sl;
    var y3s = xs * sl + y2s * cl;
    if (z2s > 0.04) {
      var pxs = gx + x3s * Rpx, pys = gy + y3s * Rpx;
      var blink = 0.5 + 0.5 * Math.sin(t * 1.4 + HOME.ph);
      var edge = Math.min(1, z2s * 4);
      var aS = (0.62 + 0.36 * blink) * edge;
      var rs = 2.05 * GK * (1 + 0.16 * blink);
      ctx.globalAlpha = aS * 0.17;
      ctx.drawImage(SPR_TEAL, pxs - rs * 2.6, pys - rs * 2.6, rs * 5.2, rs * 5.2);
      ctx.globalAlpha = aS;
      ctx.drawImage(SPR_TEAL, pxs - rs, pys - rs, rs * 2, rs * 2);
      var rt = t % 7;                       /* quiet ripple every 7 s */
      if (rt > 0 && rt < 1.6 && !reduced) {
        var rr2 = (3 + rt * 9) * GK;
        var ra = 0.5 * (1 - rt / 1.6);
        for (var kq = 0; kq < 12; kq++) {
          var ka = (kq / 12) * TAU;
          ctx.globalAlpha = ra;
          ctx.drawImage(SPR_TEAL, pxs + Math.cos(ka) * rr2 - 0.5 * GK,
                        pys + Math.sin(ka) * rr2 - 0.5 * GK, GK, GK);
        }
      }
    }

    /* ---- going train ---- */
    for (i = 1; i < 5; i++) drawWheel(i, T, t);

    /* ---- pallet lever: rocks bank-to-bank each beat ---- */
    var cur = (tt.f % 2 === 0) ? 1 : -1;
    var thL = LMAX * cur * (2 * tt.snap - 1);
    var plx = X(PL[0]), ply = Y(PL[1]);
    function lev(dist, off, sz, al2, teal) {
      a = axB + thL + off;
      px = plx + Math.cos(a) * dist * k;
      py = ply + Math.sin(a) * dist * k;
      s = sz * k;
      ctx.globalAlpha = al2;
      ctx.drawImage(teal ? SPR_TEAL : RAMP[1], px - s, py - s, s * 2, s * 2);
    }
    lev(2.6, 0, 0.55, 0.4, false);
    lev(4.6, 0, 0.55, 0.4, false);
    lev(6.0, -0.7, 0.8, 0.6, true);          /* entry pallet stone */
    lev(6.0,  0.7, 0.8, 0.6, true);          /* exit pallet stone  */
    lev(2.6, Math.PI, 0.55, 0.4, false);
    lev(4.9, Math.PI, 0.55, 0.4, false);
    lev(7.0, Math.PI - 0.22, 0.6, 0.45, false);  /* fork horns */
    lev(7.0, Math.PI + 0.22, 0.6, 0.45, false);
    lev(8.0, Math.PI, 0.45, 0.35, false);        /* guard pin  */

    /* ---- balance: 2.5 Hz, impulse at every zero-crossing ---- */
    var thB = reduced ? AMP * -0.95 : AMP * Math.sin(Math.PI * BEATS * t);
    var bx = X(CB[0]), by = Y(CB[1]);
    for (j = 0; j < balF.length; j++) {
      var bf = balF[j];
      a = bf.a + thB;
      px = bx + Math.cos(a) * bf.r * k;
      py = by + Math.sin(a) * bf.r * k;
      s = bf.s * k;
      ctx.globalAlpha = bf.al;
      ctx.drawImage(RAMP[bf.m], px - s, py - s, s * 2, s * 2);
    }
    /* impulse jewel riding the staff */
    var ja = Math.atan2(PL[1] - CB[1], PL[0] - CB[0]) + thB;
    jewelAt(bx + Math.cos(ja) * 5.5 * k, by + Math.sin(ja) * 5.5 * k, 0.8 * k, 0.7);
    /* hairspring: collet turns with the staff, stud end pinned */
    for (j = 0; j < spiral.length; j++) {
      var sp = spiral[j];
      var frac = sp.th / thMax;
      a = sp.th + 1.1 + thB * (1 - frac);
      var rE = sp.r * (1 + 0.06 * (thB / AMP) * frac);
      px = bx + Math.cos(a) * rE * k;
      py = by + Math.sin(a) * rE * k;
      s = 0.48 * k;
      ctx.globalAlpha = 0.15;
      ctx.drawImage(RAMP[1], px - s, py - s, s * 2, s * 2);
    }

    /* ---- jewels in gold chatons ---- */
    jewel(C[0][0], C[0][1], 1.5, 0.5);        /* barrel arbor */
    jewel(C[1][0], C[1][1], 1.3, 0.55);
    jewel(C[2][0], C[2][1], 1.25, 0.6);
    jewel(C[3][0], C[3][1], 1.2, 0.65);
    jewel(C[4][0], C[4][1], 1.1, 0.75);
    jewel(PL[0], PL[1], 0.9, 0.7);
    jewel(CB[0], CB[1], 1.4, 0.85);
    chaton(C[1][0], C[1][1], 3.1);
    chaton(C[2][0], C[2][1], 3.1);
    chaton(C[3][0], C[3][1], 3.1);
    chaton(C[4][0], C[4][1], 3.0);
    chaton(CB[0], CB[1], 3.6);

    ctx.globalAlpha = 1;
  }
  function jewelAt(px, py, so, al) {
    ctx.globalAlpha = al * 0.14;
    ctx.drawImage(SPR_TEAL, px - so * 3.2, py - so * 3.2, so * 6.4, so * 6.4);
    ctx.globalAlpha = al;
    ctx.drawImage(SPR_TEAL, px - so, py - so, so * 2, so * 2);
  }

  /* ---------- run ---------- */
  var STILL_T = 2.68;                 /* posed: teeth meshed, lever banked */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  var rafId = 0, t0 = performance.now();

  function loop(now) {
    draw((now - t0) / 1000 + 2.0);
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (reduced) {
      cancelAnimationFrame(rafId);
      draw(STILL_T);
    } else {
      t0 = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  }
  function onMQ(e) { reduced = e.matches; start(); }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onMQ);
    else if (mq.addListener) mq.addListener(onMQ);
  }
  start();
})();
