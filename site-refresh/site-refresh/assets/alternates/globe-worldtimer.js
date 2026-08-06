// ---- L3 halftone portrait — vHORO: worldtimer complication globe ----
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

  /* ---------- home time marker (46.01N 8.96E) ---------- */
  function st(lat, lon, home) {
    var phi = lat * DEG, lam = lon * DEG, c = Math.cos(phi);
    return { x: c * Math.sin(lam), y: -Math.sin(phi), z: c * Math.cos(lam),
             ph: Math.random() * TAU, home: home ? 1 : 0 };
  }
  var stations = [
    st(46.01, 8.96, true),     // home time
    st(19.82, -155.47, false),
    st(-24.63, -70.40, false),
    st(28.76, -17.89, false),
    st(-30.17, 149.06, false),
    st(-25.89, 27.69, false)
  ];

  /* ---------- chapter ring: 60 minute positions ----------
     kind 0 = minute pip, 1 = hour baton, 2 = lumed cardinal (3/9),
     3 = double index (12), 4 = tourbillon aperture (6)          */
  var chapter = [];
  for (var mi = 0; mi < 60; mi++) {
    var kind = 0;
    if (mi % 5 === 0) kind = 1;
    if (mi === 15 || mi === 45) kind = 2;
    if (mi === 0) kind = 3;
    if (mi === 30) kind = 4;
    chapter.push({ a: -Math.PI / 2 + (mi / 60) * TAU, kind: kind, i: mi });
  }

  /* ---------- dust (faint ambient specks) ---------- */
  var dust = [];
  for (var di = 0; di < 40; di++) {
    dust.push({ a: Math.random() * TAU, r: 0.55 + Math.random() * 0.95,
                tw: Math.random() * TAU, s: 0.4 + Math.random() * 0.6 });
  }

  /* ---------- viewport ---------- */
  var W = 190, H = 190, CX = 95, CY = 91, R = 62, RC = 78, RW = 87, DPR = 1;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cw = rect.width || 190, ch = rect.height || 190;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    CX = W * 0.5; CY = H * 0.48;
    R = Math.min(W, H) * 0.315;
    RC = R * 1.30;              /* chapter ring radius */
    RW = R * 1.46;              /* 24-city worldtimer ring */
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

  var SPIN = 0.10;        // rad/s  (~63 s per rotation)
  var SWEEP_T = 9.0;      // scan cycle seconds
  var ripT = -10;         // home ripple trigger time

  function easeInOut(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  /* high-beat seconds: 8 micro-steps per second (28 800 vph), smoothed */
  function handSeconds() {
    if (reduced) return 50;              /* parked at 10 o'clock */
    var d = new Date();
    var s = d.getSeconds() + d.getMilliseconds() / 1000;
    var b = s * 8, f = Math.floor(b), fr = b - f;
    fr = fr < 0.22 ? fr / 0.22 : 1;
    fr = fr * fr * (3 - 2 * fr);
    return (f + fr) / 8;
  }

  /* home hour on the 24-city ring (CET) */
  function homeHour() {
    var d = new Date();
    return (d.getUTCHours() + 1 + d.getUTCMinutes() / 60) % 24;
  }

  function draw(t) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var spin = t * SPIN;
    var cs = Math.cos(spin), ss = Math.sin(spin);

    /* sweep: horizontal scan travelling down the globe */
    var u = (t % SWEEP_T) / SWEEP_T;
    var active = u < 0.55;
    var sy = -1e4, env = 0;
    if (active) {
      var p = easeInOut(u / 0.55);
      sy = CY - R * 1.35 + p * R * 2.7;
      env = Math.sin(Math.PI * Math.min(1, u / 0.55));
      env = Math.pow(env, 0.4);
    }
    var sigma = R * 0.19;

    /* ---- dust ---- */
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i];
      var twD = 0.5 + 0.5 * Math.sin(t * 0.5 + d.tw);
      ctx.globalAlpha = 0.018 + 0.024 * twD;
      var dx = CX + Math.cos(d.a) * R * (1.66 + d.r * 0.5);
      var dy = CY + Math.sin(d.a) * R * (1.66 + d.r * 0.5);
      var ds = d.s * 1.0;
      ctx.drawImage(RAMP[0], dx - ds, dy - ds, ds * 2, ds * 2);
    }

    /* ---- 24-city worldtimer ring ---- */
    for (i = 0; i < 24; i++) {
      var wa = -Math.PI / 2 + (i / 24) * TAU;
      var wx = CX + Math.cos(wa) * RW, wy = CY + Math.sin(wa) * RW;
      var six = (i % 6 === 0);
      ctx.globalAlpha = six ? 0.20 : 0.13;
      var wr = six ? 0.78 : 0.6;
      ctx.drawImage(RAMP[0], wx - wr, wy - wr, wr * 2, wr * 2);
    }
    /* home-time pip on the city ring */
    var hh = homeHour();
    var ha = -Math.PI / 2 + (hh / 24) * TAU;
    var hx = CX + Math.cos(ha) * RW, hy = CY + Math.sin(ha) * RW;
    ctx.globalAlpha = 0.08;
    ctx.drawImage(SPR_TEAL, hx - 2.8, hy - 2.8, 5.6, 5.6);
    ctx.globalAlpha = 0.42;
    ctx.drawImage(SPR_TEAL, hx - 1.0, hy - 1.0, 2.0, 2.0);

    /* ---- chapter ring ---- */
    var tbA = Math.PI / 2;                  /* 6 o'clock */
    var tbX = CX + Math.cos(tbA) * RC, tbY = CY + Math.sin(tbA) * RC;
    var tbR = R * 0.105;
    for (i = 0; i < 60; i++) {
      var cm = chapter[i];
      var ca = Math.cos(cm.a), sa2 = Math.sin(cm.a);
      var bx = CX + ca * RC, by = CY + sa2 * RC;
      var bBoost = env * Math.exp(-((by - sy) * (by - sy)) / (sigma * sigma));
      if (cm.kind === 4) continue;          /* tourbillon aperture */
      /* clear minute pips crowding the aperture */
      if (cm.i >= 29 && cm.i <= 31) continue;

      var lume = 0.5 + 0.5 * Math.sin(t * 0.55 + cm.i * 0.7);   /* slow lume breath */
      if (cm.kind === 0) {                  /* minute pip */
        ctx.globalAlpha = 0.36 + bBoost * 0.2;
        var pr = 0.85 * (1 + bBoost * 0.4);
        ctx.drawImage(RAMP[0], bx - pr, by - pr, pr * 2, pr * 2);
      } else if (cm.kind === 1) {           /* hour baton: 2 ink dots radial */
        for (var q = -1; q <= 1; q += 2) {
          var qx = CX + ca * (RC + q * 2.5), qy = CY + sa2 * (RC + q * 2.5);
          ctx.globalAlpha = 0.55 + bBoost * 0.2;
          ctx.drawImage(RAMP[0], qx - 1.15, qy - 1.15, 2.3, 2.3);
        }
      } else if (cm.kind === 2) {           /* lumed cardinal 3/9: 3 teal dots */
        for (q = -1; q <= 1; q++) {
          qx = CX + ca * (RC + q * 3.2); qy = CY + sa2 * (RC + q * 3.2);
          if (q === 0) { ctx.globalAlpha = 0.08 + 0.05 * lume; ctx.drawImage(SPR_TEAL, qx - 3.6, qy - 3.6, 7.2, 7.2); }
          ctx.globalAlpha = 0.5 + 0.1 * lume + bBoost * 0.15;
          ctx.drawImage(SPR_TEAL, qx - 1.1, qy - 1.1, 2.2, 2.2);
        }
      } else if (cm.kind === 3) {           /* 12: double lumed index */
        for (var col = -1; col <= 1; col += 2) {
          var tx = -sa2 * col * 1.9, ty = ca * col * 1.9;   /* tangential offset */
          for (q = -1; q <= 1; q++) {
            qx = CX + ca * (RC + q * 3.2) + tx; qy = CY + sa2 * (RC + q * 3.2) + ty;
            if (q === 0) { ctx.globalAlpha = 0.06 + 0.04 * lume; ctx.drawImage(SPR_TEAL, qx - 3.4, qy - 3.4, 6.8, 6.8); }
            ctx.globalAlpha = 0.55 + 0.08 * lume;
            ctx.drawImage(SPR_TEAL, qx - 1.1, qy - 1.1, 2.2, 2.2);
          }
        }
      }
    }

    /* ---- tourbillon at 6: static rim + revolving cage + balance ---- */
    for (i = 0; i < 12; i++) {
      var oa = (i / 12) * TAU;
      var ox = tbX + Math.cos(oa) * tbR, oy = tbY + Math.sin(oa) * tbR;
      ctx.globalAlpha = 0.2;
      ctx.drawImage(RAMP[0], ox - 0.6, oy - 0.6, 1.2, 1.2);
    }
    var cage = t * (TAU / 10);
    for (i = 0; i < 3; i++) {
      var ga = cage + (i / 3) * TAU;
      var gx = tbX + Math.cos(ga) * tbR * 0.62, gy = tbY + Math.sin(ga) * tbR * 0.62;
      ctx.globalAlpha = 0.44;
      ctx.drawImage(RAMP[0], gx - 0.85, gy - 0.85, 1.7, 1.7);
    }
    var balA = cage * -1.5 + 2.0 * Math.sin(t * TAU * 2);
    var blx = tbX + Math.cos(balA) * tbR * 0.34, bly = tbY + Math.sin(balA) * tbR * 0.34;
    ctx.globalAlpha = 0.3;
    ctx.drawImage(RAMP[0], blx - 0.6, bly - 0.6, 1.2, 1.2);
    ctx.globalAlpha = 0.4;
    ctx.drawImage(RAMP[0], tbX - 0.75, tbY - 0.75, 1.5, 1.5);

    /* ---- sweeping seconds: lumed dot-hand on the chapter ring ---- */
    var sec = handSeconds();
    var sA = -Math.PI / 2 + (sec / 60) * TAU;
    /* phosphor persistence trail (none when parked) */
    for (i = reduced ? 0 : 5; i >= 1; i--) {
      var gA = sA - i * 0.048;
      var ghx = CX + Math.cos(gA) * RC, ghy = CY + Math.sin(gA) * RC;
      ctx.globalAlpha = 0.14 * Math.exp(-i * 0.55);
      ctx.drawImage(SPR_TEAL, ghx - 0.8, ghy - 0.8, 1.6, 1.6);
    }
    var hcx = Math.cos(sA), hsy = Math.sin(sA);
    /* tapered dot-hand: tip on the ring, two counter dots inward */
    var tipx = CX + hcx * RC, tipy = CY + hsy * RC;
    ctx.globalAlpha = 0.16;
    ctx.drawImage(SPR_TEAL, tipx - 4.4, tipy - 4.4, 8.8, 8.8);
    ctx.globalAlpha = 0.92;
    ctx.drawImage(SPR_TEAL, tipx - 1.55, tipy - 1.55, 3.1, 3.1);
    var m1x = CX + hcx * (RC - 4.6), m1y = CY + hsy * (RC - 4.6);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(SPR_TEAL, m1x - 1.0, m1y - 1.0, 2.0, 2.0);
    var m2x = CX + hcx * (RC - 9.0), m2y = CY + hsy * (RC - 9.0);
    ctx.globalAlpha = 0.28;
    ctx.drawImage(SPR_TEAL, m2x - 0.7, m2y - 0.7, 1.4, 1.4);

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

    /* ---- stations (home = home-time marker) ---- */
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

      var edge = Math.min(1, z2s * 4);
      var aS = (St.home ? 0.62 : 0.30) + 0.36 * blink;
      aS = Math.min(1, aS + stBoost * 0.4) * edge;

      var rs = (St.home ? 2.05 : 1.4) * (1 + 0.16 * blink + stBoost * 0.4);
      ctx.globalAlpha = aS * 0.17;
      ctx.drawImage(SPR_TEAL, pxs - rs * 2.6, pys - rs * 2.6, rs * 5.2, rs * 5.2);
      ctx.globalAlpha = aS;
      ctx.drawImage(SPR_TEAL, pxs - rs, pys - rs, rs * 2, rs * 2);

      if (St.home) {
        var rt = t - ripT;
        if (rt > 0 && rt < 1.6) {
          var rr = 3 + rt * 9;
          var ra = 0.5 * (1 - rt / 1.6);
          for (var k = 0; k < 12; k++) {
            var ka = (k / 12) * TAU;
            ctx.globalAlpha = ra;
            ctx.drawImage(SPR_TEAL,
              pxs + Math.cos(ka) * rr - 0.5,
              pys + Math.sin(ka) * rr - 0.5, 1.0, 1.0);
          }
        }
      }
    }
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
      draw(STILL_T); /* seconds parked at 10 o'clock, scan mid-globe */
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
