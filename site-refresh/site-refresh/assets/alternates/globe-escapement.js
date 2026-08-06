// ---- L3 halftone portrait — vESC: Swiss lever escapement ----
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
  var DEG = Math.PI / 180, TAU = Math.PI * 2;

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
    var mm = ri / (RAMP_N - 1);
    RAMP.push(makeSprite([
      Math.round(INK[0] + (EMBER[0] - INK[0]) * mm),
      Math.round(INK[1] + (EMBER[1] - INK[1]) * mm),
      Math.round(INK[2] + (EMBER[2] - INK[2]) * mm)
    ]));
  }
  var SPR_TEAL = makeSprite(TEAL);

  /* edge-dissolving radial mask, applied per dot (no gradient banding) */
  function vig(x, y) {
    var dx = (x - CX) / (W * 0.53), dy = (y - CY) / (H * 0.55);
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d <= 0.82) return 1;
    if (d >= 1.06) return 0;
    var q = (1.06 - d) / 0.24;
    return q * q * (3 - 2 * q);
  }
  function dot(spr, x, y, r, a) {
    var v = vig(x, y);
    if (v <= 0) return;
    ctx.globalAlpha = a * v;
    ctx.drawImage(spr, x - r, y - r, r * 2, r * 2);
  }

  /* ---------- globe lattice (identity, framed by the balance) ---------- */
  var pts = [];
  for (var la = -75; la <= 75; la += 7.5) {
    var phi = la * DEG, cphi = Math.cos(phi), sphi = Math.sin(phi);
    for (var lo = 0; lo < 360; lo += 7.5) {
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
  var HOME = (function (lat, lon) {
    var p = lat * DEG, l = lon * DEG, c = Math.cos(p);
    return { x: c * Math.sin(l), y: -Math.sin(p), z: c * Math.cos(l) };
  })(46.01, 8.96);

  /* ---------- chapter ring: 60 minute positions ---------- */
  var chapter = [];
  for (var mi = 0; mi < 60; mi++) {
    var kind = 0;
    if (mi % 5 === 0) kind = 1;
    if (mi === 15 || mi === 45) kind = 2;
    if (mi === 0) kind = 3;
    chapter.push({ a: -Math.PI / 2 + (mi / 60) * TAU, kind: kind, i: mi });
  }

  /* ---------- dust ---------- */
  var dust = [];
  for (var di = 0; di < 34; di++) {
    dust.push({ a: Math.random() * TAU, r: Math.random(),
                tw: Math.random() * TAU, s: 0.4 + Math.random() * 0.6 });
  }

  /* ---------- layout (Swiss straight-line: balance / fork / escape wheel) ---------- */
  var W = 380, H = 380, DPR = 1, u = 1, ug = 1;
  var CX, CY, BCX, BCY, Rb, Rg, rPin, PFX, PFY, Lf, ECX, ECY, Re, RC;
  var JA = 30 * DEG, jr, jx, jy;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cw = rect.width || 380, ch = rect.height || 380;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    var m = Math.min(W, H);
    u = m / 220;                       /* mechanism dot unit */
    ug = m / 300;                      /* globe dot unit */
    CX = W * 0.5; CY = H * 0.5;
    BCX = CX; BCY = H * 0.375;         /* balance (hero, frames the globe) */
    Rb = m * 0.23;
    Rg = Rb * 0.72;                    /* globe inside the balance rim */
    rPin = Rb * 0.30;                  /* impulse-pin (roller) radius */
    Lf = m * 0.135;                    /* fork length pivot->horns */
    PFX = CX; PFY = BCY + rPin + Lf;   /* pallet staff */
    Re = m * 0.135;                    /* escape wheel */
    ECX = CX; ECY = PFY + m * 0.14;
    RC = m * 0.44;                     /* chapter ring */
    jr = Re * 1.04;                    /* pallet jewels sit on the wheel */
    jx = jr * Math.sin(JA);            /* span = 2.5 tooth pitches */
    jy = (ECY - PFY) - jr * Math.cos(JA);
  }
  resize();
  window.addEventListener('resize', function () {
    resize();
    if (reduced) draw(STILL_T);
  });

  /* ---------- globe orientation & light ---------- */
  var TIP = 0.42, LEAN = -0.24;
  var ct = Math.cos(TIP), stp = Math.sin(TIP);
  var cl = Math.cos(LEAN), sl = Math.sin(LEAN);
  var LX = -0.45, LY = -0.45, LZ = 0.79;
  var Ln = Math.sqrt(LX * LX + LY * LY + LZ * LZ);
  LX /= Ln; LY /= Ln; LZ /= Ln;
  var SPIN = 0.10;

  /* ---------- escapement constants ---------- */
  var TEETH = 15;
  var HALF = Math.PI / TEETH;          /* wheel advance per beat: half a tooth pitch */
  var AMP = 250 * DEG;                 /* balance amplitude */
  var LMAX = 0.16;                     /* lever throw (rad) */
  var PHASE0 = -Math.PI / 2 - JA;      /* tooth 0 registered on the entry stone */

  function easeInOut(q) { return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2; }
  function clamp01(q) { return q < 0 ? 0 : (q > 1 ? 1 : q); }

  function draw(t) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    /* ----- beat clock (1 Hz beat = deadbeat seconds; ticks on the real second) ----- */
    var nowS, secIn;
    if (reduced) { nowS = 0; secIn = 50; }
    else {
      var d = new Date();
      nowS = Math.floor(Date.now() / 1000) + d.getMilliseconds() / 1000;
      secIn = d.getSeconds() + d.getMilliseconds() / 1000;
    }
    var n = Math.floor(nowS);
    var fr = nowS - n;
    var side = (n % 2 === 0) ? -1 : 1;

    /* balance: ±AMP harmonic oscillation, zero-crossing (impulse) at each beat */
    var ampEff = AMP * (0.97 + 0.03 * Math.sin(t * 0.13));
    var theta = reduced ? AMP * 0.95
                        : ampEff * Math.sin(Math.PI * nowS);

    /* lever: dwells on a banking, flips across at the beat */
    var flipE = easeInOut(clamp01(fr / 0.12));
    var lam = reduced ? 0 : LMAX * side * (2 * flipE - 1);

    /* escape wheel: one discrete advance per beat (never smooth) */
    var tq = clamp01((fr - 0.02) / 0.14);
    var tickE = 1 - Math.pow(1 - tq, 3);
    tickE += 0.10 * Math.sin(tq * Math.PI) * (1 - tq);   /* drop onto the stone */
    if (reduced) tickE = 0.5;                            /* mid-drop */
    var eAng = PHASE0 + (n % (2 * TEETH) + tickE) * HALF;

    var flash = (reduced || fr > 0.5) ? 0 : Math.exp(-fr * 7);
    var lockExit = (n % 2 === 0);                        /* stones alternate lock */

    var spin = (reduced ? STILL_T : t) * SPIN;
    var cs = Math.cos(spin), ss = Math.sin(spin);

    var i, q, a2, px, py, ca, sa;

    /* ---- dust ---- */
    for (i = 0; i < dust.length; i++) {
      var du = dust[i];
      var twD = 0.5 + 0.5 * Math.sin(t * 0.5 + du.tw);
      var dr = RC * (0.93 + du.r * 0.24);
      dot(RAMP[0], CX + Math.cos(du.a) * dr, CY + Math.sin(du.a) * dr,
          du.s * ug, 0.018 + 0.024 * twD);
    }

    /* ---- chapter ring ---- */
    for (i = 0; i < 60; i++) {
      var cm = chapter[i];
      ca = Math.cos(cm.a); sa = Math.sin(cm.a);
      var bx = CX + ca * RC, by = CY + sa * RC;
      var lume = 0.5 + 0.5 * Math.sin(t * 0.55 + cm.i * 0.7);
      if (cm.kind === 0) {
        dot(RAMP[0], bx, by, 0.85 * u, 0.32);
      } else if (cm.kind === 1) {
        for (q = -1; q <= 1; q += 2)
          dot(RAMP[0], CX + ca * (RC + q * 2.5 * u), CY + sa * (RC + q * 2.5 * u), 1.15 * u, 0.52);
      } else if (cm.kind === 2) {
        for (q = -1; q <= 1; q++) {
          var qx = CX + ca * (RC + q * 3.2 * u), qy = CY + sa * (RC + q * 3.2 * u);
          if (q === 0) dot(SPR_TEAL, qx, qy, 3.6 * u, 0.07 + 0.05 * lume);
          dot(SPR_TEAL, qx, qy, 1.1 * u, 0.48 + 0.1 * lume);
        }
      } else if (cm.kind === 3) {
        for (var col = -1; col <= 1; col += 2) {
          var tx = -sa * col * 1.9 * u, ty = ca * col * 1.9 * u;
          for (q = -1; q <= 1; q++) {
            qx = CX + ca * (RC + q * 3.2 * u) + tx; qy = CY + sa * (RC + q * 3.2 * u) + ty;
            if (q === 0) dot(SPR_TEAL, qx, qy, 3.4 * u, 0.05 + 0.04 * lume);
            dot(SPR_TEAL, qx, qy, 1.1 * u, 0.52 + 0.08 * lume);
          }
        }
      }
    }

    /* ---- deadbeat seconds: jumps one pip per beat, dwells still ---- */
    var sIdx = Math.floor(secIn);
    var snap = reduced ? 1 : easeInOut(clamp01((secIn - sIdx) / 0.10));
    var sA = -Math.PI / 2 + ((sIdx + snap) / 60) * TAU;
    if (!reduced) {
      var pA = -Math.PI / 2 + (sIdx / 60) * TAU;          /* afterglow at departed pip */
      dot(SPR_TEAL, CX + Math.cos(pA) * RC, CY + Math.sin(pA) * RC,
          1.4 * u, 0.22 * Math.exp(-(secIn - sIdx) * 4));
    }
    var hcx = Math.cos(sA), hsy = Math.sin(sA);
    dot(SPR_TEAL, CX + hcx * RC, CY + hsy * RC, 4.4 * u, 0.15);
    dot(SPR_TEAL, CX + hcx * RC, CY + hsy * RC, 1.55 * u, 0.9);
    dot(SPR_TEAL, CX + hcx * (RC - 4.6 * u), CY + hsy * (RC - 4.6 * u), 1.0 * u, 0.48);
    dot(SPR_TEAL, CX + hcx * (RC - 9.0 * u), CY + hsy * (RC - 9.0 * u), 0.7 * u, 0.26);

    /* ---- dot-globe: dimmed mainplate, cradled inside the balance ---- */
    for (i = 0; i < pts.length; i++) {
      var pt = pts[i];
      var x = pt.x * cs + pt.z * ss;
      var z = -pt.x * ss + pt.z * cs;
      var y = pt.y;
      var y2 = y * ct - z * stp;
      var z2 = y * stp + z * ct;
      var x3 = x * cl - y2 * sl;
      var y3 = x * sl + y2 * cl;
      px = BCX + x3 * Rg;
      py = BCY + y3 * Rg;

      if (z2 < 0) {
        if (pt.rnd < 0.2) dot(RAMP[5], px, py, 0.6 * u, 0.045);
        continue;
      }
      var s = x3 * LX + y3 * LY + z2 * LZ;
      var lit = s > 0 ? s : 0;
      var rim = Math.pow(1 - z2, 2.2);
      var emberAmt = (1 - lit) * rim;
      var dens = 0.37 + 0.63 * Math.pow(lit, 0.65) + emberAmt * 0.4;
      var margin = dens - pt.rnd;
      if (margin <= 0) continue;
      var fade = margin < 0.12 ? margin / 0.12 : 1;
      var rampIdx = Math.min(RAMP_N - 1, Math.round(emberAmt * 2.0 * (RAMP_N - 1)));
      var tw = 1 + 0.07 * Math.sin(t * 0.8 + pt.tw);
      var alpha = (0.14 + 0.74 * Math.pow(lit, 1.3) + emberAmt * 0.32) * pt.pole * tw;
      alpha *= (pt.emph ? 1.3 : 1.0) * fade * 0.42;      /* dimmed: it is the plate */
      var rad = (0.55 + 0.78 * Math.pow(lit, 1.0) + emberAmt * 0.3) * (pt.emph ? 1.2 : 1.0);
      rad *= (0.62 + 0.38 * pt.pole) / 0.9;
      dot(RAMP[rampIdx], px, py, rad * u, Math.min(0.5, alpha));
    }
    /* home ping */
    (function () {
      var xs = HOME.x * cs + HOME.z * ss;
      var zs = -HOME.x * ss + HOME.z * cs;
      var ys = HOME.y;
      var y2s = ys * ct - zs * stp;
      var z2s = ys * stp + zs * ct;
      var x3s = xs * cl - y2s * sl;
      var y3s = xs * sl + y2s * cl;
      if (z2s < 0.04) return;
      var pxs = BCX + x3s * Rg, pys = BCY + y3s * Rg;
      var blink = 0.5 + 0.5 * Math.sin(t * 1.4);
      var edge = Math.min(1, z2s * 4);
      var aS = (0.55 + 0.4 * blink) * edge;
      dot(SPR_TEAL, pxs, pys, 5.2 * u, aS * 0.16);
      dot(SPR_TEAL, pxs, pys, 1.9 * u, aS);
      var rt = t % 7;
      if (!reduced && rt < 1.6) {
        var rr = (3 + rt * 9) * u;
        for (var k = 0; k < 12; k++) {
          var ka = (k / 12) * TAU;
          dot(SPR_TEAL, pxs + Math.cos(ka) * rr, pys + Math.sin(ka) * rr,
              0.5 * u, 0.5 * (1 - rt / 1.6));
        }
      }
    })();

    /* ---- hairspring: dotted spiral, collet turns with the balance, stud fixed ---- */
    var NSP = 84, COILS = 3.25, PHM = COILS * TAU;
    var r0 = Rb * 0.10, r1 = Rb * 0.60;
    for (i = 0; i < NSP; i++) {
      var f = i / (NSP - 1);
      var ph = f * PHM;
      var rr2 = r0 + (r1 - r0) * f;
      rr2 *= 1 - 0.085 * (theta / AMP) * Math.pow(1 - f, 0.8);   /* breathes with the swing */
      var aa = -Math.PI / 2 + ph + theta * (1 - f);
      dot(RAMP[6], BCX + Math.cos(aa) * rr2, BCY + Math.sin(aa) * rr2,
          0.9 * u, 0.36 + 0.3 * f);
    }
    /* stud (outer attachment, fixed) */
    var studA = -Math.PI / 2 + PHM;
    dot(RAMP[6], BCX + Math.cos(studA) * r1 * 1.08, BCY + Math.sin(studA) * r1 * 1.08,
        1.5 * u, 0.6);

    /* ---- balance wheel: rim, arms, timing screws, impulse pin ---- */
    var NR = 52;
    for (i = 0; i < NR; i++) {
      var ra = theta + (i / NR) * TAU;
      dot(RAMP[0], BCX + Math.cos(ra) * Rb, BCY + Math.sin(ra) * Rb, 1.45 * u, 0.7);
    }
    for (i = 0; i < 6; i++) {                              /* timing screws */
      var sca = theta + (i / 6) * TAU + 0.26;
      dot(RAMP[6], BCX + Math.cos(sca) * Rb * 1.05, BCY + Math.sin(sca) * Rb * 1.05,
          1.95 * u, 0.8);
    }
    for (var arm = 0; arm < 2; arm++) {                    /* two crossings */
      var aA = theta + arm * Math.PI;
      var acx = Math.cos(aA), asy = Math.sin(aA);
      for (q = 0; q < 4; q++) {
        var fA = 0.26 + q * 0.19;
        dot(RAMP[3], BCX + acx * Rb * fA, BCY + asy * Rb * fA, 1.15 * u, 0.4);
      }
    }
    /* impulse pin on the roller (teal), glints at the beat */
    var pinA = Math.PI / 2 + theta;
    var pinX = BCX + Math.cos(pinA) * rPin, pinY = BCY + Math.sin(pinA) * rPin;
    dot(SPR_TEAL, pinX, pinY, 4.5 * u, 0.10 + 0.18 * flash);
    dot(SPR_TEAL, pinX, pinY, 1.6 * u, 0.55 + 0.4 * flash);

    /* ---- escape wheel: 15 club teeth, one-tooth-per-beat discrete ticks ---- */
    for (i = 0; i < TEETH; i++) {                          /* root ring, between teeth */
      var ia = eAng + ((i + 0.5) / TEETH) * TAU;
      dot(RAMP[1], ECX + Math.cos(ia) * Re * 0.56, ECY + Math.sin(ia) * Re * 0.56,
          0.8 * u, 0.2);
    }
    for (i = 0; i < 4; i++) {                              /* crossings */
      var ka2 = eAng + (i / 4) * TAU + 0.3;
      dot(RAMP[2], ECX + Math.cos(ka2) * Re * 0.2, ECY + Math.sin(ka2) * Re * 0.2, 0.85 * u, 0.2);
      dot(RAMP[2], ECX + Math.cos(ka2) * Re * 0.38, ECY + Math.sin(ka2) * Re * 0.38, 0.85 * u, 0.2);
    }
    for (i = 0; i < TEETH; i++) {                          /* club teeth: radial spike + club foot */
      var ta = eAng + (i / TEETH) * TAU;
      dot(RAMP[2], ECX + Math.cos(ta) * Re * 0.66, ECY + Math.sin(ta) * Re * 0.66, 0.95 * u, 0.38);
      dot(RAMP[3], ECX + Math.cos(ta + 0.045) * Re * 0.83, ECY + Math.sin(ta + 0.045) * Re * 0.83, 1.05 * u, 0.58);
      dot(RAMP[5], ECX + Math.cos(ta + 0.09) * Re, ECY + Math.sin(ta + 0.09) * Re, 1.45 * u, 0.85);
      dot(RAMP[4], ECX + Math.cos(ta + 0.175) * Re * 0.97, ECY + Math.sin(ta + 0.175) * Re * 0.97, 1.0 * u, 0.6);
    }

    /* ---- pallet fork / lever (drawn over the wheel) ---- */
    var lc = Math.cos(lam), ls = Math.sin(lam);
    function fp(x0, y0) {                                  /* lever-frame -> screen */
      return [PFX + x0 * lc - y0 * ls, PFY + x0 * ls + y0 * lc];
    }
    var p;
    var armF = [0.16, 0.32, 0.48, 0.64, 0.79, 0.92];
    for (i = 0; i < armF.length; i++) {                    /* fork arm */
      p = fp(0, -Lf * armF[i]);
      dot(RAMP[2], p[0], p[1], 1.15 * u, 0.62);
    }
    /* fork head: shoulders, horns, slot between, guard pin */
    p = fp(-4.6 * u, -Lf + 1.5 * u); dot(RAMP[3], p[0], p[1], 1.15 * u, 0.72);
    p = fp( 4.6 * u, -Lf + 1.5 * u); dot(RAMP[3], p[0], p[1], 1.15 * u, 0.72);
    p = fp(-4.2 * u, -Lf - 2.8 * u); dot(RAMP[3], p[0], p[1], 1.05 * u, 0.72);
    p = fp( 4.2 * u, -Lf - 2.8 * u); dot(RAMP[3], p[0], p[1], 1.05 * u, 0.72);
    p = fp(-3.1 * u, -Lf - 5.8 * u); dot(RAMP[3], p[0], p[1], 0.95 * u, 0.66);
    p = fp( 3.1 * u, -Lf - 5.8 * u); dot(RAMP[3], p[0], p[1], 0.95 * u, 0.66);
    p = fp(0, -Lf + 3.0 * u);        dot(RAMP[2], p[0], p[1], 0.65 * u, 0.6);
    /* pallet frame arms down to the stones */
    for (q = -1; q <= 1; q += 2) {
      p = fp(q * jx * 0.34, jy * 0.34); dot(RAMP[2], p[0], p[1], 1.1 * u, 0.6);
      p = fp(q * jx * 0.67, jy * 0.67); dot(RAMP[2], p[0], p[1], 1.1 * u, 0.6);
    }
    /* entry & exit pallet jewels (teal) — alternately lock the wheel */
    for (q = 0; q < 2; q++) {
      var sgn = q === 0 ? -1 : 1;                          /* 0 = entry (left) */
      p = fp(sgn * jx, jy);
      var locking = (q === 1) === lockExit;
      var rel = !locking;                                   /* just released -> flash */
      dot(SPR_TEAL, p[0], p[1], 4.6 * u, (locking ? 0.13 : 0.05) + (rel ? 0.22 * flash : 0));
      dot(SPR_TEAL, p[0], p[1], locking ? 1.7 * u : 1.5 * u,
          (locking ? 0.88 : 0.3) + (rel ? 0.5 * flash : 0));
    }
    /* banking pins (fixed) */
    var bk = LMAX + 0.07;
    dot(RAMP[6], PFX - Lf * 0.94 * Math.sin(bk), PFY - Lf * 0.94 * Math.cos(bk), 1.0 * u, 0.4);
    dot(RAMP[6], PFX + Lf * 0.94 * Math.sin(bk), PFY - Lf * 0.94 * Math.cos(bk), 1.0 * u, 0.4);

    /* ---- pivot jewels of the going train (rubies -> teal) ---- */
    dot(SPR_TEAL, BCX, BCY, 2.6 * u, 0.06); dot(SPR_TEAL, BCX, BCY, 1.0 * u, 0.35);
    dot(SPR_TEAL, PFX, PFY, 2.6 * u, 0.06); dot(SPR_TEAL, PFX, PFY, 1.0 * u, 0.35);
    dot(SPR_TEAL, ECX, ECY, 2.6 * u, 0.06); dot(SPR_TEAL, ECX, ECY, 1.0 * u, 0.35);

    ctx.globalAlpha = 1;
  }

  /* ---------- run ---------- */
  var STILL_T = 2.55;
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
      draw(STILL_T);  /* balance at swing extreme, fork mid-throw, tooth mid-drop */
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
