// ---- L3 halftone portrait — vSPACE: orbital tracking station (fable) ----
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
  var SPR_BG = makeSprite([8, 9, 11]);   /* backing dot: punches out the globe */

  /* ---------- geometry: lat/lon lattice on unit sphere ---------- */
  var pts = [];
  var DEG = Math.PI / 180;
  for (var la = -78; la <= 78; la += 6) {
    var phi = la * DEG, cphi = Math.cos(phi), sphi = Math.sin(phi);
    for (var lo = 0; lo < 360; lo += 6) {
      var lam = lo * DEG;
      pts.push({
        x: cphi * Math.sin(lam),
        y: -sphi,
        z: cphi * Math.cos(lam),
        rnd: Math.random(),
        tw: Math.random() * Math.PI * 2,
        emph: (la % 30 === 0 || lo % 30 === 0) ? 1 : 0,
        pole: Math.pow(cphi, 0.75)
      });
    }
  }

  /* ---------- stations (launch / tracking sites; home = 46.01N 8.96E) ---------- */
  function st(lat, lon, home) {
    var phi = lat * DEG, lam = lon * DEG, c = Math.cos(phi);
    return { x: c * Math.sin(lam), y: -Math.sin(phi), z: c * Math.cos(lam),
             ph: Math.random() * Math.PI * 2, home: home ? 1 : 0 };
  }
  var stations = [
    st(46.01, 8.96, true),     // home
    st(5.16, -52.65, false),   // Kourou
    st(28.49, -80.57, false),  // Cape Canaveral
    st(45.96, 63.30, false)    // Baikonur
  ];

  /* ---------- instrument bezel (outer dial of dots) ---------- */
  var BEZEL_N = 96, bezel = [];
  for (var bi = 0; bi < BEZEL_N; bi++) {
    bezel.push({ a: (bi / BEZEL_N) * Math.PI * 2, tick: (bi % 8 === 0) ? 1 : 0 });
  }
  var BEZEL_R = 1.56;

  /* ---------- dust (faint ambient specks) ---------- */
  var dust = [];
  for (var di = 0; di < 54; di++) {
    dust.push({ a: Math.random() * Math.PI * 2, r: Math.random(),
                tw: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.6 });
  }

  /* ---------- viewport ---------- */
  var W = 190, H = 190, CX = 95, CY = 92, R = 57, DPR = 1;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cw = rect.width || 190, ch = rect.height || 190;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    CX = W * 0.5; CY = H * 0.485;
    R = Math.min(W, H) * 0.31;
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

  function viewOf(x, y, z) { /* tip about x, then lean about z */
    var y2 = y * ct - z * stp, z2 = y * stp + z * ct;
    return [x * cl - y2 * sl, x * sl + y2 * cl, z2];
  }

  /* light, view space (upper-left-front) */
  var LX = -0.45, LY = -0.45, LZ = 0.79;
  var Ln = Math.sqrt(LX * LX + LY * LY + LZ * LZ);
  LX /= Ln; LY /= Ln; LZ /= Ln;

  var SPIN = 0.10;        // rad/s globe rotation (~63 s)
  var SWEEP_T = 11.0;     // radar scan cycle seconds
  var ripT = -10;         // home-station ripple trigger time

  function easeInOut(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  /* ---------- orbital mechanics ---------- */
  function makeOrbit(o) {
    var inc = o.inc * DEG, raan = o.raan * DEG;
    var ci = Math.cos(inc), si = Math.sin(inc);
    var cO = Math.cos(raan), sO = Math.sin(raan);
    function wrot(vx, vy, vz) {      /* rotZ(inc) then rotY(raan): world frame */
      var x = vx * ci - vy * si, y = vx * si + vy * ci, z = vz;
      return [x * cO + z * sO, y, -x * sO + z * cO];
    }
    o.WEX = wrot(1, 0, 0); o.WEZ = wrot(0, 0, 1);
    o.EX = viewOf(o.WEX[0], o.WEX[1], o.WEX[2]);   /* view-frame basis */
    o.EZ = viewOf(o.WEZ[0], o.WEZ[1], o.WEZ[2]);
    o.w = o.argp * DEG;
    o.n = Math.PI * 2 / o.T;

    /* ring of discrete dots tracing the ellipse (static in inertial frame) */
    o.ring = [];
    for (var k = 0; k < o.dots; k++) {
      var th = (k / o.dots) * Math.PI * 2;
      var r = o.a * (1 - o.e * o.e) / (1 + o.e * Math.cos(th));
      var u = th + o.w, cu = Math.cos(u), su = Math.sin(u);
      var X = r * (cu * o.EX[0] + su * o.EZ[0]);
      var Y = r * (cu * o.EX[1] + su * o.EZ[1]);
      var Z = r * (cu * o.EX[2] + su * o.EZ[2]);
      o.ring.push({ X: X, Y: Y, Z: Z,
                    occ: (Z < 0 && X * X + Y * Y < 1) ? 1 : 0,
                    tw: Math.random() * Math.PI * 2 });
    }
    o.peri = apsis(o, 0);
    o.apo = apsis(o, Math.PI);
    return o;
  }
  function apsis(o, th) {
    var r = o.a * (1 - o.e * o.e) / (1 + o.e * Math.cos(th));
    var u = th + o.w, cu = Math.cos(u), su = Math.sin(u);
    return [r * (cu * o.EX[0] + su * o.EZ[0]),
            r * (cu * o.EX[1] + su * o.EZ[1]),
            r * (cu * o.EX[2] + su * o.EZ[2])];
  }
  function kepler(o, t) {            /* mean anomaly -> true anomaly, radius */
    var M = (o.M0 + o.n * t) % (Math.PI * 2);
    var E = M;
    for (var j = 0; j < 5; j++) E -= (E - o.e * Math.sin(E) - M) / (1 - o.e * Math.cos(E));
    var th = 2 * Math.atan2(Math.sqrt(1 + o.e) * Math.sin(E / 2),
                            Math.sqrt(1 - o.e) * Math.cos(E / 2));
    return [th, o.a * (1 - o.e * Math.cos(E))];
  }
  function satView(o, t) {           /* view-space position (units of globe R) */
    var kr = kepler(o, t), u = kr[0] + o.w, r = kr[1];
    var cu = Math.cos(u), su = Math.sin(u);
    return [r * (cu * o.EX[0] + su * o.EZ[0]),
            r * (cu * o.EX[1] + su * o.EZ[1]),
            r * (cu * o.EX[2] + su * o.EZ[2])];
  }
  function satWorld(o, t) {          /* inertial world position, unit-normalized */
    var kr = kepler(o, t), u = kr[0] + o.w;
    var cu = Math.cos(u), su = Math.sin(u);
    return [cu * o.WEX[0] + su * o.WEZ[0],
            cu * o.WEX[1] + su * o.WEZ[1],
            cu * o.WEX[2] + su * o.WEZ[2]];
  }

  /* primary: eccentric, steeply inclined; carries the tracked satellite */
  var orbA = makeOrbit({ a: 1.30, e: 0.17, inc: 63, raan: 55, argp: 118,
                         T: 18, M0: 0.6, dots: 64 });
  /* secondary: low, near-circular, whisper-faint */
  var orbB = makeOrbit({ a: 1.13, e: 0.045, inc: 22, raan: -35, argp: 100,
                         T: 15, M0: 3.9, dots: 46 });

  var TRAIL_N = 16, TRAIL_DT = 0.22;
  var TRACK_N = 26, TRACK_DT = 0.6;

  function occFade(X, Y, Z) {        /* 1 in front, soft dim when behind globe */
    if (Z >= 0) return 1;
    var rho = Math.sqrt(X * X + Y * Y);
    if (rho >= 1.04) return 0.55;                 /* behind, off-limb */
    if (rho > 0.96) return 0.55 - (1.04 - rho) / 0.08 * 0.37;
    return 0.18;                                  /* fully occluded ghost */
  }

  /* ---------- draw ---------- */
  function draw(t) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var spin = t * SPIN;
    var cs = Math.cos(spin), ss = Math.sin(spin);

    /* radar sweep: horizontal scan line travelling down the display */
    var u = (t % SWEEP_T) / SWEEP_T;
    var active = u < 0.5;
    var sy = -1e4, env = 0;
    if (active) {
      var p = easeInOut(u / 0.5);
      sy = CY - R * 1.35 + p * R * 2.7;
      env = Math.sin(Math.PI * Math.min(1, u / 0.5));
      env = Math.pow(env, 0.4);
    }
    var sigma = R * 0.19;

    /* ---- dust ---- */
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i];
      var twD = 0.5 + 0.5 * Math.sin(t * 0.5 + d.tw);
      ctx.globalAlpha = 0.026 + 0.032 * twD;
      var dx = CX + Math.cos(d.a) * R * (1.08 + d.r * 0.62);
      var dy = CY + Math.sin(d.a) * R * (1.08 + d.r * 0.62);
      var ds = d.s * 1.05;
      ctx.drawImage(RAMP[0], dx - ds, dy - ds, ds * 2, ds * 2);
    }

    /* ---- bezel dial ---- */
    for (i = 0; i < BEZEL_N; i++) {
      var b = bezel[i];
      var bx = CX + Math.cos(b.a) * R * BEZEL_R;
      var by = CY + Math.sin(b.a) * R * BEZEL_R;
      var bBoost = env * Math.exp(-((by - sy) * (by - sy)) / (sigma * sigma));
      ctx.globalAlpha = (b.tick ? 0.15 : 0.055) + bBoost * 0.22;
      var bs = (b.tick ? 1.0 : 0.6) * (1 + bBoost * 0.5);
      ctx.drawImage(RAMP[0], bx - bs, by - bs, bs * 2, bs * 2);
    }

    /* ---- orbit rings: far side first (behind the globe) ---- */
    drawRing(orbA, t, sy, env, sigma, 1.0, false);
    drawRing(orbB, t, sy, env, sigma, 0.5, false);

    /* satellites' far passes (ghosts through the planet) */
    var SA = satView(orbA, t);
    var SB = satView(orbB, t);
    if (SA[2] < 0) drawSatA(SA, t);
    if (SB[2] < 0) drawSatB(SB, t);

    /* ---- globe lattice ---- */
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
        if (pt.rnd < 0.26) {
          ctx.globalAlpha = 0.065;
          ctx.drawImage(RAMP[5], px - 0.65, py - 0.65, 1.3, 1.3);
        }
        continue;
      }

      var s = x3 * LX + y3 * LY + z2 * LZ;
      var lit = s > 0 ? s : 0;
      var boost = env * Math.exp(-((py - sy) * (py - sy)) / (sigma * sigma));
      var rim = Math.pow(1 - z2, 2.2);
      var emberAmt = (1 - lit) * rim;

      var dens = 0.37 + 0.63 * Math.pow(lit, 0.65) + emberAmt * 0.4 + boost * 0.8;
      var margin = dens - pt.rnd;
      if (margin <= 0) continue;
      var fade = margin < 0.12 ? margin / 0.12 : 1;

      var rampIdx = Math.min(RAMP_N - 1, Math.round(emberAmt * 2.0 * (RAMP_N - 1)));
      if (boost > 0.35) rampIdx = 0;

      var tw = 1 + 0.07 * Math.sin(t * 0.8 + pt.tw);
      var alpha = (0.14 + 0.74 * Math.pow(lit, 1.3) + emberAmt * 0.32) * pt.pole * tw;
      alpha *= (pt.emph ? 1.3 : 1.0);
      alpha += boost * 0.55;
      alpha *= fade;
      if (alpha > 0.95) alpha = 0.95;

      var rad = (0.64 + 0.92 * Math.pow(lit, 1.0) + emberAmt * 0.3) * (pt.emph ? 1.22 : 1.0);
      rad *= (0.62 + 0.38 * pt.pole) / 0.9;
      rad *= 1 + boost * 0.55;

      ctx.globalAlpha = alpha;
      ctx.drawImage(RAMP[rampIdx], px - rad, py - rad, rad * 2, rad * 2);
    }

    /* ---- ground track: sub-satellite dots crawling on the surface ---- */
    for (i = TRACK_N - 1; i >= 0; i--) {
      var tau = t - i * TRACK_DT;
      var uW = satWorld(orbA, tau);
      var ang = SPIN * (t - tau);       /* surface point rides globe rotation */
      var ca = Math.cos(ang), sa2 = Math.sin(ang);
      var qx = uW[0] * ca + uW[2] * sa2;
      var qz = -uW[0] * sa2 + uW[2] * ca;
      var v = viewOf(qx, uW[1], qz);
      if (v[2] < 0.06) continue;
      var edge = Math.min(1, v[2] * 3);
      var gx = CX + v[0] * R, gy = CY + v[1] * R;
      var f = 1 - i / TRACK_N;
      if (i === 0) {
        ctx.globalAlpha = 0.16 * edge;
        ctx.drawImage(SPR_TEAL, gx - 3.0, gy - 3.0, 6.0, 6.0);
        ctx.globalAlpha = 0.7 * edge;
        ctx.drawImage(SPR_TEAL, gx - 1.05, gy - 1.05, 2.1, 2.1);
      } else {
        var gs = 0.55 + 0.4 * f;
        ctx.globalAlpha = 0.5 * f * edge;
        ctx.drawImage(SPR_BG, gx - gs * 1.8, gy - gs * 1.8, gs * 3.6, gs * 3.6);
        ctx.globalAlpha = (0.08 + 0.45 * f * f) * edge;
        ctx.drawImage(RAMP[0], gx - gs, gy - gs, gs * 2, gs * 2);
      }
    }

    /* ---- stations ---- */
    for (i = 0; i < stations.length; i++) {
      var St = stations[i];
      var xs = St.x * cs + St.z * ss;
      var zs = -St.x * ss + St.z * cs;
      var ys = St.y;
      var y2s = ys * ct - zs * stp;
      var z2s = ys * stp + zs * ct;
      var x3s = xs * cl - y2s * sl;
      var y3s = xs * sl + y2s * cl;
      if (z2s < 0.04) continue;

      var pxs = CX + x3s * R, pys = CY + y3s * R;
      var blink = 0.5 + 0.5 * Math.sin(t * (St.home ? 1.4 : 0.9) + St.ph);
      var stBoost = env * Math.exp(-((pys - sy) * (pys - sy)) / (sigma * sigma));
      if (St.home && stBoost > 0.9 && t - ripT > 3) ripT = t;

      var edgeS = Math.min(1, z2s * 4);
      var aS = (St.home ? 0.62 : 0.30) + 0.36 * blink;
      aS = Math.min(1, aS + stBoost * 0.4) * edgeS;

      var rs = (St.home ? 2.05 : 1.4) * (1 + 0.16 * blink + stBoost * 0.4);
      ctx.globalAlpha = aS * 0.17;
      ctx.drawImage(SPR_TEAL, pxs - rs * 2.6, pys - rs * 2.6, rs * 5.2, rs * 5.2);
      ctx.globalAlpha = aS;
      ctx.drawImage(SPR_TEAL, pxs - rs, pys - rs, rs * 2, rs * 2);

      if (St.home) {
        var rt = t - ripT;
        if (rt > 0 && rt < 1.6) {
          var rr = 3 + rt * 9;
          var raA = 0.5 * (1 - rt / 1.6);
          for (var k = 0; k < 12; k++) {
            var ka = (k / 12) * Math.PI * 2;
            ctx.globalAlpha = raA;
            ctx.drawImage(SPR_TEAL,
              pxs + Math.cos(ka) * rr - 0.5,
              pys + Math.sin(ka) * rr - 0.5, 1.0, 1.0);
          }
        }
      }
    }

    /* ---- orbit rings: near side (in front of the globe) ---- */
    drawRing(orbA, t, sy, env, sigma, 1.0, true);
    drawRing(orbB, t, sy, env, sigma, 0.5, true);

    /* ---- apsis tick markers (primary orbit) ---- */
    drawApsis(orbA.peri, t, 0);
    drawApsis(orbA.apo, t, 1);

    /* ---- trail + satellites (near passes) ---- */
    for (i = TRAIL_N; i >= 1; i--) {
      var tv = satView(orbA, t - i * TRAIL_DT);
      var of = occFade(tv[0], tv[1], tv[2]);
      var ff = 1 - i / (TRAIL_N + 1);
      var tx = CX + tv[0] * R, ty = CY + tv[1] * R;
      var tsz = 0.55 + 0.6 * ff;
      if (i < 5) {
        ctx.globalAlpha = 0.6 * ff * of;
        ctx.drawImage(SPR_TEAL, tx - tsz, ty - tsz, tsz * 2, tsz * 2);
      } else {
        ctx.globalAlpha = 0.6 * ff * ff * of + 0.02;
        ctx.drawImage(RAMP[0], tx - tsz, ty - tsz, tsz * 2, tsz * 2);
      }
    }
    if (SA[2] >= 0) drawSatA(SA, t);
    if (SB[2] >= 0) drawSatB(SB, t);

    ctx.globalAlpha = 1;
  }

  function drawRing(o, t, sy, env, sigma, mul, nearPass) {
    for (var i = 0; i < o.ring.length; i++) {
      var q = o.ring[i];
      if (nearPass !== (q.Z >= 0)) continue;
      var px = CX + q.X * R, py = CY + q.Y * R;
      var twk = 0.85 + 0.15 * Math.sin(t * 0.7 + q.tw);
      var a, sz;
      if (q.Z >= 0) {
        var boost = env * Math.exp(-((py - sy) * (py - sy)) / (sigma * sigma));
        a = (0.72 * twk + boost * 0.28) * mul;
        sz = 1.18 * (1 + boost * 0.3);
        var bk = sz * 2.0;                    /* dark backing: track reads on disc */
        ctx.globalAlpha = 0.7;
        ctx.drawImage(SPR_BG, px - bk, py - bk, bk * 2, bk * 2);
        ctx.globalAlpha = a;
        ctx.drawImage(RAMP[0], px - sz, py - sz, sz * 2, sz * 2);
      } else if (q.occ) {
        a = 0.12 * twk * mul;                 /* occluded: ember ghost */
        ctx.globalAlpha = a;
        ctx.drawImage(RAMP[4], px - 0.7, py - 0.7, 1.4, 1.4);
      } else {
        a = 0.36 * twk * mul;                 /* far, off-limb */
        ctx.globalAlpha = a;
        ctx.drawImage(RAMP[1], px - 0.9, py - 0.9, 1.8, 1.8);
      }
    }
  }

  function drawApsis(P, t, isApo) {
    var of = occFade(P[0], P[1], P[2]);
    var pulse = 0.82 + 0.18 * Math.sin(t * 0.7 + (isApo ? 2.1 : 0));
    /* ticks: three dots stepping radially outward from the apsis point */
    var prx = Math.sqrt(P[0] * P[0] + P[1] * P[1]);
    var dx = prx > 1e-6 ? P[0] / prx : 0, dy = prx > 1e-6 ? P[1] / prx : -1;
    for (var j = 0; j < 3; j++) {
      var off = R * (0.045 + j * 0.05);
      var tx = CX + P[0] * R + dx * off;
      var ty = CY + P[1] * R + dy * off;
      ctx.globalAlpha = (0.5 - j * 0.13) * pulse * of;
      var sz2 = (0.88 - j * 0.14) * (isApo ? 1.0 : 0.9);
      ctx.drawImage(RAMP[isApo ? 3 : 0], tx - sz2, ty - sz2, sz2 * 2, sz2 * 2);
    }
  }

  function drawSatA(S, t) {
    var of = occFade(S[0], S[1], S[2]);
    var px = CX + S[0] * R, py = CY + S[1] * R;
    var pulse = 1 + 0.1 * Math.sin(t * 2.1);
    if (S[2] >= 0) {
      ctx.globalAlpha = 0.8;
      ctx.drawImage(SPR_BG, px - 3.4, py - 3.4, 6.8, 6.8);
    }
    ctx.globalAlpha = 0.18 * of;
    ctx.drawImage(SPR_TEAL, px - 5.2, py - 5.2, 10.4, 10.4);
    ctx.globalAlpha = Math.min(0.95, 0.9 * of + 0.05);
    var r = 1.8 * pulse;
    ctx.drawImage(SPR_TEAL, px - r, py - r, r * 2, r * 2);
  }
  function drawSatB(S, t) {
    var of = occFade(S[0], S[1], S[2]);
    var px = CX + S[0] * R, py = CY + S[1] * R;
    if (S[2] >= 0) {
      ctx.globalAlpha = 0.6;
      ctx.drawImage(SPR_BG, px - 1.7, py - 1.7, 3.4, 3.4);
    }
    ctx.globalAlpha = 0.45 * of;
    ctx.drawImage(RAMP[0], px - 1.0, py - 1.0, 2.0, 2.0);
  }

  /* ---------- run ---------- */
  var STILL_T = 68.8;  /* scan mid-globe, satellite mid-pass on the near arc */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  var rafId = 0, t0 = performance.now();

  function loop(now) {
    draw((now - t0) / 1000 + 6.0);
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (reduced) {
      cancelAnimationFrame(rafId);
      draw(STILL_T); /* satellite mid-orbit, scan mid-globe: one considered frame */
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
