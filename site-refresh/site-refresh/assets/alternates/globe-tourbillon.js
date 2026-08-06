// ---- L3 halftone portrait — vTOUR: the world held in a one-minute tourbillon ----
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

  /* ---------- geometry: lat/lon lattice on unit sphere ---------- */
  var pts = [];
  var DEG = Math.PI / 180, TAU = Math.PI * 2;
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

  /* ---------- home marker (46.01N 8.96E) ---------- */
  var HOME = (function () {
    var p = 46.01 * DEG, l = 8.96 * DEG, c = Math.cos(p);
    return { x: c * Math.sin(l), y: -Math.sin(p), z: c * Math.cos(l) };
  })();

  /* ---------- chapter ring: 60 minute positions ----------
     kind 0 = minute pip, 1 = five-minute baton, 2 = quarter (3/6/9), 3 = 12 */
  var chapter = [];
  for (var mi = 0; mi < 60; mi++) {
    var kind = 0;
    if (mi % 5 === 0) kind = 1;
    if (mi === 15 || mi === 30 || mi === 45) kind = 2;
    if (mi === 0) kind = 3;
    chapter.push({ a: -Math.PI / 2 + (mi / 60) * TAU, kind: kind, i: mi });
  }

  /* ---------- dust (faint ambient specks) ---------- */
  var dust = [];
  for (var di = 0; di < 34; di++) {
    dust.push({ a: Math.random() * TAU, r: 0.55 + Math.random() * 0.95,
                tw: Math.random() * TAU, s: 0.4 + Math.random() * 0.6 });
  }

  /* ---------- viewport ---------- */
  var W = 190, H = 190, CX = 95, CY = 95, DPR = 1;
  var R = 56, RB = 24, RG = 68, RC = 81, SC = 1;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cw = rect.width || 190, ch = rect.height || 190;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    CX = W * 0.5; CY = H * 0.5;
    R  = Math.min(W, H) * 0.295;  /* caged globe */
    RB = R * 0.46;                /* balance wheel */
    RG = R * 1.22;                /* tourbillon cage rim */
    RC = R * 1.45;                /* chapter ring */
    SC = R / 60;                  /* dot-size scale */
  }
  resize();
  window.addEventListener('resize', function () {
    resize();
    if (reduced) draw(STILL_T);
  });

  /* ---------- orientation ---------- */
  var TIP = 0.42, LEAN = -0.24;
  var ct = Math.cos(TIP), stp = Math.sin(TIP);
  var cl = Math.cos(LEAN), sl = Math.sin(LEAN);

  /* light, view space (upper-left-front) */
  var LX = -0.45, LY = -0.45, LZ = 0.79;
  var Ln = Math.sqrt(LX * LX + LY * LY + LZ * LZ);
  LX /= Ln; LY /= Ln; LZ /= Ln;
  var LIGHT_A = Math.atan2(LY, LX);          /* glint azimuth for polished steel */

  var SPIN = 0.055;        /* globe: ~114 s per rotation (out of phase with cage) */
  var BEAT_F = 0.62;       /* balance: 0.62 Hz slow-motion oscillation */
  var AMP = 3.9;           /* ~223 degrees of swing amplitude */
  var TEETH = 15;          /* escape wheel */

  function qe(u) { u = u < 0 ? 0 : u > 1 ? 1 : u; return u * u * (3 - 2 * u); }

  /* cage carries the seconds: one revolution per real minute */
  function secNow() {
    if (reduced) return 50;                  /* parked at 10 o'clock */
    var d = new Date();
    return d.getSeconds() + d.getMilliseconds() / 1000;
  }

  function draw(t) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var sec = secNow();
    var cage = -Math.PI / 2 + (sec / 60) * TAU;
    var cgc = Math.cos(cage), cgs = Math.sin(cage);

    /* balance phase; escapement unlocks exactly as balance crosses centre */
    var phase = TAU * BEAT_F * t;
    var swing = AMP * Math.sin(phase);
    var beats = 2 * BEAT_F * t;
    var bi = Math.floor(beats), bf = beats - bi;
    var snap = qe(bf / 0.16);                          /* quick drop, then rest */
    var escA = -(bi + snap) * (TAU / (TEETH * 2));     /* one tooth per 2 beats */
    var sgn = (bi % 2 === 0) ? 1 : -1;
    var rock = 0.13 * sgn * (2 * snap - 1);            /* pallet fork flip */

    /* ---- dust ---- */
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i];
      var twD = 0.5 + 0.5 * Math.sin(t * 0.5 + d.tw);
      ctx.globalAlpha = 0.016 + 0.022 * twD;
      var dx = CX + Math.cos(d.a) * R * (1.62 + d.r * 0.42);
      var dy = CY + Math.sin(d.a) * R * (1.62 + d.r * 0.42);
      var ds = d.s * SC;
      ctx.drawImage(RAMP[0], dx - ds, dy - ds, ds * 2, ds * 2);
    }

    /* ---- chapter ring ---- */
    for (i = 0; i < 60; i++) {
      var cm = chapter[i];
      var ca = Math.cos(cm.a), sa2 = Math.sin(cm.a);
      var bx = CX + ca * RC, by = CY + sa2 * RC;
      var lume = 0.5 + 0.5 * Math.sin(t * 0.55 + cm.i * 0.7);
      if (cm.kind === 0) {                    /* minute pip */
        ctx.globalAlpha = 0.38;
        var pr = 0.8 * SC;
        ctx.drawImage(RAMP[0], bx - pr, by - pr, pr * 2, pr * 2);
      } else if (cm.kind === 1) {             /* five-minute baton: 2 ink dots */
        for (var q = -1; q <= 1; q += 2) {
          var qx = CX + ca * (RC + q * 2.3 * SC), qy = CY + sa2 * (RC + q * 2.3 * SC);
        ctx.globalAlpha = 0.6;
          ctx.drawImage(RAMP[0], qx - 1.1 * SC, qy - 1.1 * SC, 2.2 * SC, 2.2 * SC);
        }
      } else if (cm.kind === 2) {             /* quarters 3/6/9: 3 ink dots */
        for (q = -1; q <= 1; q++) {
          qx = CX + ca * (RC + q * 2.9 * SC); qy = CY + sa2 * (RC + q * 2.9 * SC);
          ctx.globalAlpha = 0.66 + 0.06 * lume;
          ctx.drawImage(RAMP[0], qx - 1.15 * SC, qy - 1.15 * SC, 2.3 * SC, 2.3 * SC);
        }
      } else {                                /* 12: double lumed index */
        for (var col = -1; col <= 1; col += 2) {
          var tx = -sa2 * col * 1.8 * SC, ty = ca * col * 1.8 * SC;
          for (q = -1; q <= 1; q++) {
            qx = CX + ca * (RC + q * 2.9 * SC) + tx; qy = CY + sa2 * (RC + q * 2.9 * SC) + ty;
            if (q === 0) { ctx.globalAlpha = 0.05 + 0.04 * lume; ctx.drawImage(SPR_TEAL, qx - 3.2 * SC, qy - 3.2 * SC, 6.4 * SC, 6.4 * SC); }
            ctx.globalAlpha = 0.52 + 0.08 * lume;
            ctx.drawImage(SPR_TEAL, qx - 1.0 * SC, qy - 1.0 * SC, 2.0 * SC, 2.0 * SC);
          }
        }
      }
    }

    /* ---- caged globe (dimmed identity, recessed under the balance) ---- */
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

      var px = CX + x3 * R;
      var py = CY + y3 * R;

      if (z2 < 0) {
        if (pt.rnd < 0.22) {
          ctx.globalAlpha = 0.05;
          ctx.drawImage(RAMP[5], px - 0.6 * SC, py - 0.6 * SC, 1.2 * SC, 1.2 * SC);
        }
        continue;
      }

      var s = x3 * LX + y3 * LY + z2 * LZ;
      var lit = s > 0 ? s : 0;

      var rim = Math.pow(1 - z2, 2.2);
      var emberAmt = (1 - lit) * rim;

      var dens = 0.34 + 0.66 * Math.pow(lit, 0.65) + emberAmt * 0.4;
      var margin = dens - pt.rnd;
      if (margin <= 0) continue;
      var fade = margin < 0.12 ? margin / 0.12 : 1;

      var rampIdx = Math.min(RAMP_N - 1, Math.round(emberAmt * 2.0 * (RAMP_N - 1)));

      /* recess: dim the world's interior so the mechanism floats above it,
         leaving the lit limb to draw the sphere */
      var ddx = px - CX, ddy = py - CY;
      var dim = 0.22 + 0.78 * qe((Math.sqrt(ddx * ddx + ddy * ddy) - RB * 1.05) / (R * 0.88 - RB * 1.05));

      var tw = 1 + 0.07 * Math.sin(t * 0.8 + pt.tw);
      var alpha = (0.13 + 0.68 * Math.pow(lit, 1.3) + emberAmt * 0.30) * pt.pole * tw;
      alpha *= (pt.emph ? 1.3 : 1.0) * fade * 0.34 * dim;
      if (alpha > 0.5) alpha = 0.5;

      var rad = (0.60 + 0.82 * Math.pow(lit, 1.0) + emberAmt * 0.3) * (pt.emph ? 1.2 : 1.0);
      rad *= (0.62 + 0.38 * pt.pole) / 0.9 * SC * 0.92;

      ctx.globalAlpha = alpha;
      ctx.drawImage(RAMP[rampIdx], px - rad, py - rad, rad * 2, rad * 2);
    }

    /* ---- home ping (46.01N 8.96E) ---- */
    (function () {
      var xs = HOME.x * cs + HOME.z * ss;
      var zs = -HOME.x * ss + HOME.z * cs;
      var ys = HOME.y;
      var y2s = ys * ct - zs * stp;
      var z2s = ys * stp + zs * ct;
      var x3s = xs * cl - y2s * sl;
      var y3s = xs * sl + y2s * cl;
      if (z2s < 0.04) return;
      var pxs = CX + x3s * R, pys = CY + y3s * R;
      var blink = 0.5 + 0.5 * Math.sin(t * 1.3);
      var edge = Math.min(1, z2s * 4);
      var aS = (0.45 + 0.3 * blink) * edge;
      var rs = 1.7 * SC * (1 + 0.15 * blink);
      ctx.globalAlpha = aS * 0.16;
      ctx.drawImage(SPR_TEAL, pxs - rs * 2.6, pys - rs * 2.6, rs * 5.2, rs * 5.2);
      ctx.globalAlpha = aS;
      ctx.drawImage(SPR_TEAL, pxs - rs, pys - rs, rs * 2, rs * 2);
      var rt = t % 9;                          /* quiet ripple every 9 s */
      if (rt < 1.6 && !reduced) {
        var rr = (3 + rt * 8) * SC, ra = 0.4 * (1 - rt / 1.6) * edge;
        for (var k = 0; k < 12; k++) {
          var ka = (k / 12) * TAU;
          ctx.globalAlpha = ra;
          ctx.drawImage(SPR_TEAL,
            pxs + Math.cos(ka) * rr - 0.5 * SC,
            pys + Math.sin(ka) * rr - 0.5 * SC, SC, SC);
        }
      }
    })();

    /* ================= the tourbillon ================= */

    /* ---- hairspring: stud fixed to the cage, collet turns with the balance ---- */
    var TURNS = 3.25, NHS = 120;
    for (i = 0; i < NHS; i++) {
      var hs = i / (NHS - 1);
      var hr = RB * (0.80 - 0.60 * hs) * (1 + 0.055 * (swing / AMP) * hs); /* breath */
      var th = cage + 2.2 + TURNS * TAU * hs + swing * hs * hs;            /* wind/unwind */
      var hx = CX + Math.cos(th) * hr, hy = CY + Math.sin(th) * hr;
      ctx.globalAlpha = 0.26 + 0.22 * hs;
      var hd = 0.58 * SC;
      ctx.drawImage(RAMP[1], hx - hd, hy - hd, hd * 2, hd * 2);
    }
    /* stud (outer terminal, on the carriage) */
    var stx = CX + Math.cos(cage + 2.2) * RB * 0.80, sty = CY + Math.sin(cage + 2.2) * RB * 0.80;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(RAMP[0], stx - 1.0 * SC, sty - 1.0 * SC, 2.0 * SC, 2.0 * SC);

    /* ---- balance wheel (equilibrium rides the cage) ---- */
    var balA = cage + swing;
    var NB = 30;
    for (i = 0; i < NB; i++) {
      var ba = balA + (i / NB) * TAU;
      var bxp = CX + Math.cos(ba) * RB, byp = CY + Math.sin(ba) * RB;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(RAMP[0], bxp - 1.28 * SC, byp - 1.28 * SC, 2.56 * SC, 2.56 * SC);
    }
    /* four gold poising masselottes (free-sprung) */
    for (i = 0; i < 4; i++) {
      var ma = balA + Math.PI / 4 + (i / 4) * TAU;
      var mxp = CX + Math.cos(ma) * RB * 1.1, myp = CY + Math.sin(ma) * RB * 1.1;
      ctx.globalAlpha = 0.95;
      ctx.drawImage(RAMP[4], mxp - 1.7 * SC, myp - 1.7 * SC, 3.4 * SC, 3.4 * SC);
    }
    /* two balance arms */
    for (var arm = 0; arm < 2; arm++) {
      var aa2 = balA + arm * Math.PI;
      for (q = 0; q < 4; q++) {
        var ar = RB * (0.18 + 0.20 * q);
        var axp = CX + Math.cos(aa2) * ar, ayp = CY + Math.sin(aa2) * ar;
        ctx.globalAlpha = 0.66;
        ctx.drawImage(RAMP[0], axp - 0.95 * SC, ayp - 0.95 * SC, 1.9 * SC, 1.9 * SC);
      }
    }
    /* ember impulse jewel on the roller */
    var ipx = CX + Math.cos(balA + Math.PI / 2) * RB * 0.24;
    var ipy = CY + Math.sin(balA + Math.PI / 2) * RB * 0.24;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(RAMP[7], ipx - 0.95 * SC, ipy - 0.95 * SC, 1.9 * SC, 1.9 * SC);

    /* ---- escapement riding the carriage ---- */
    function cwx(a, dd) { return CX + Math.cos(cage + a) * dd; }
    function cwy(a, dd) { return CY + Math.sin(cage + a) * dd; }
    var AE = 1.05, DE = R * 0.72;               /* escape wheel seat, cage frame */
    var ex = cwx(AE, DE), ey = cwy(AE, DE);
    var Re = R * 0.155;
    for (i = 0; i < TEETH; i++) {               /* 15 club teeth as dots */
      var ta = cage + escA + (i / TEETH) * TAU;
      var txp = ex + Math.cos(ta) * Re, typ = ey + Math.sin(ta) * Re;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(RAMP[0], txp - 1.0 * SC, typ - 1.0 * SC, 2.0 * SC, 2.0 * SC);
    }
    for (i = 0; i < 5; i++) {                   /* light 5-spoke centre */
      ta = cage + escA + (i / 5) * TAU + 0.2;
      txp = ex + Math.cos(ta) * Re * 0.48; typ = ey + Math.sin(ta) * Re * 0.48;
      ctx.globalAlpha = 0.42;
      ctx.drawImage(RAMP[0], txp - 0.62 * SC, typ - 0.62 * SC, 1.24 * SC, 1.24 * SC);
    }
    ctx.globalAlpha = 0.7;                      /* escape pivot jewel */
    ctx.drawImage(SPR_TEAL, ex - 0.95 * SC, ey - 0.95 * SC, 1.9 * SC, 1.9 * SC);

    /* pallet fork: anchor between escape wheel and balance, rocking each beat */
    var pvx = cwx(AE + 0.36, R * 0.44), pvy = cwy(AE + 0.36, R * 0.44);
    var axA = Math.atan2(ey - pvy, ex - pvx) + rock;
    for (q = -1; q <= 1; q += 2) {              /* anchor arms + ruby pallets */
      var pa = axA + q * 0.46;
      var m1x = pvx + Math.cos(pa) * R * 0.085, m1y = pvy + Math.sin(pa) * R * 0.085;
      ctx.globalAlpha = 0.68;
      ctx.drawImage(RAMP[0], m1x - 0.85 * SC, m1y - 0.85 * SC, 1.7 * SC, 1.7 * SC);
      var pjx = pvx + Math.cos(pa) * R * 0.155, pjy = pvy + Math.sin(pa) * R * 0.155;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(SPR_TEAL, pjx - 0.9 * SC, pjy - 0.9 * SC, 1.8 * SC, 1.8 * SC);
    }
    ctx.globalAlpha = 0.75;                     /* fork pivot */
    ctx.drawImage(RAMP[0], pvx - 1.0 * SC, pvy - 1.0 * SC, 2.0 * SC, 2.0 * SC);
    var lvA = axA + Math.PI;                    /* lever toward the balance */
    for (q = 1; q <= 2; q++) {
      var lx = pvx + Math.cos(lvA) * R * 0.075 * q, ly = pvy + Math.sin(lvA) * R * 0.075 * q;
      ctx.globalAlpha = 0.62;
      ctx.drawImage(RAMP[0], lx - 0.8 * SC, ly - 0.8 * SC, 1.6 * SC, 1.6 * SC);
    }
    for (q = -1; q <= 1; q += 2) {              /* fork horns */
      var hxp = pvx + Math.cos(lvA) * R * 0.185 + Math.cos(lvA + q * Math.PI / 2) * R * 0.028;
      var hyp = pvy + Math.sin(lvA) * R * 0.185 + Math.sin(lvA + q * Math.PI / 2) * R * 0.028;
      ctx.globalAlpha = 0.6;
      ctx.drawImage(RAMP[0], hxp - 0.72 * SC, hyp - 0.72 * SC, 1.44 * SC, 1.44 * SC);
    }

    /* ---- carriage rim: one revolution per minute ---- */
    var NRIM = 54;
    for (i = 0; i < NRIM; i++) {
      var raA = cage + (i / NRIM) * TAU;
      var rxp = CX + Math.cos(raA) * RG, ryp = CY + Math.sin(raA) * RG;
      /* shadow side of the steel picks up ember */
      var shade = 0.5 - 0.5 * Math.cos(raA - LIGHT_A);
      ctx.globalAlpha = 0.6 + 0.2 * (1 - shade);
      var rIdx = Math.min(RAMP_N - 1, Math.round(shade * 3.4));
      ctx.drawImage(RAMP[rIdx], rxp - 1.15 * SC, ryp - 1.15 * SC, 2.3 * SC, 2.3 * SC);
    }
    /* three pillars at the arm roots */
    for (i = 0; i < 3; i++) {
      var plA = cage + (i / 3) * TAU;
      for (q = 0; q <= 1; q++) {
        var plx = CX + Math.cos(plA) * (RG - q * 2.5 * SC);
        var ply = CY + Math.sin(plA) * (RG - q * 2.5 * SC);
        ctx.globalAlpha = 0.92;
        ctx.drawImage(RAMP[0], plx - 1.55 * SC, ply - 1.55 * SC, 3.1 * SC, 3.1 * SC);
      }
    }

    /* ---- three-armed upper bridge, arcing over the balance ---- */
    var NARM = 19;
    for (var k2 = 0; k2 < 3; k2++) {
      var root = cage + (k2 / 3) * TAU;
      /* polished steel glint as each arm sweeps past the light */
      var glint = Math.pow(0.5 + 0.5 * Math.cos(root - LIGHT_A), 3);
      for (i = 0; i < NARM; i++) {
        var as2 = i / (NARM - 1);
        var arr = RG * (1 - 0.965 * as2);
        var aan = root + 1.35 * Math.pow(as2, 1.5);  /* curve tightens toward the hub */
        var axp2 = CX + Math.cos(aan) * arr, ayp2 = CY + Math.sin(aan) * arr;
        ctx.globalAlpha = 0.68 - 0.2 * as2 + 0.3 * glint;
        var adr = (1.9 - 0.95 * as2) * SC * (1 + 0.24 * glint);
        ctx.drawImage(RAMP[0], axp2 - adr, ayp2 - adr, adr * 2, adr * 2);
      }
    }
    /* hub + endstone: the balance jewel under the bridge */
    for (i = 0; i < 3; i++) {
      var huA = cage + 1.15 + (i / 3) * TAU;
      var hux = CX + Math.cos(huA) * 2.8 * SC, huy = CY + Math.sin(huA) * 2.8 * SC;
      ctx.globalAlpha = 0.8;
      ctx.drawImage(RAMP[0], hux - 1.15 * SC, huy - 1.15 * SC, 2.3 * SC, 2.3 * SC);
    }
    ctx.globalAlpha = 0.10;
    ctx.drawImage(SPR_TEAL, CX - 3.4 * SC, CY - 3.4 * SC, 6.8 * SC, 6.8 * SC);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(SPR_TEAL, CX - 1.25 * SC, CY - 1.25 * SC, 2.5 * SC, 2.5 * SC);

    /* ---- seconds cue: arm 0 extends to a lumed pointer on the chapter ring ---- */
    for (i = reduced ? 0 : 4; i >= 1; i--) {    /* phosphor persistence trail */
      var gA = cage - i * 0.035;
      var ghx = CX + Math.cos(gA) * RC, ghy = CY + Math.sin(gA) * RC;
      ctx.globalAlpha = 0.11 * Math.exp(-i * 0.5);
      ctx.drawImage(SPR_TEAL, ghx - 0.8 * SC, ghy - 0.8 * SC, 1.6 * SC, 1.6 * SC);
    }
    for (q = 0; q < 2; q++) {                   /* tapered stem from the rim */
      var srr = RG + (RC - RG) * (0.3 + 0.34 * q);
      var sxp = CX + cgc * srr, syp = CY + cgs * srr;
      ctx.globalAlpha = 0.62 - 0.16 * q;
      var srd = (1.05 - 0.22 * q) * SC;
      ctx.drawImage(RAMP[0], sxp - srd, syp - srd, srd * 2, srd * 2);
    }
    var tpx = CX + cgc * RC, tpy = CY + cgs * RC;
    ctx.globalAlpha = 0.15;
    ctx.drawImage(SPR_TEAL, tpx - 4.0 * SC, tpy - 4.0 * SC, 8.0 * SC, 8.0 * SC);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(SPR_TEAL, tpx - 1.4 * SC, tpy - 1.4 * SC, 2.8 * SC, 2.8 * SC);

    ctx.globalAlpha = 1;
  }

  /* ---------- run ---------- */
  var STILL_T = 2.55;   /* balance mid-swing, escape just dropped */
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
      draw(STILL_T); /* cage parked at 10 o'clock, balance mid-swing */
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
