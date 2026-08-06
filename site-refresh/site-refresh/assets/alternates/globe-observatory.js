// ---- L3 halftone portrait — OPTION C: telemetry instrument globe (fable) ----
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

  /* ---------- stations (telemetry beacons; home = 46.01N 8.96E) ---------- */
  function st(lat, lon, home) {
    var phi = lat * DEG, lam = lon * DEG, c = Math.cos(phi);
    return { x: c * Math.sin(lam), y: -Math.sin(phi), z: c * Math.cos(lam),
             ph: Math.random() * Math.PI * 2, home: home ? 1 : 0 };
  }
  var stations = [
    st(46.01, 8.96, true),     // home coordinates
    st(19.82, -155.47, false), // Mauna Kea
    st(-24.63, -70.40, false), // Paranal
    st(28.76, -17.89, false),  // La Palma
    st(-30.17, 149.06, false), // Siding Spring-ish
    st(-25.89, 27.69, false)   // Hartebeesthoek
  ];

  /* ---------- instrument bezel (dial of dots around globe) ---------- */
  var BEZEL_N = 96, bezel = [];
  for (var bi = 0; bi < BEZEL_N; bi++) {
    bezel.push({ a: (bi / BEZEL_N) * Math.PI * 2, tick: (bi % 8 === 0) ? 1 : 0 });
  }

  /* ---------- dust (faint ambient specks) ---------- */
  var dust = [];
  for (var di = 0; di < 60; di++) {
    var da = Math.random() * Math.PI * 2;
    var dr = 0.55 + Math.random() * 0.95;
    dust.push({ a: da, r: dr, tw: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.6 });
  }

  /* ---------- viewport ---------- */
  var W = 190, H = 190, CX = 95, CY = 88, R = 64, DPR = 1;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cw = rect.width || 190, ch = rect.height || 190;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    CX = W * 0.5; CY = H * 0.46;
    R = Math.min(W, H) * 0.355;
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
  var ripT = -10;         // home-station ripple trigger time

  function easeInOut(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  function draw(t) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var spin = t * SPIN;
    var cs = Math.cos(spin), ss = Math.sin(spin);

    /* sweep: horizontal scan line travelling down the globe */
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
      ctx.globalAlpha = 0.028 + 0.035 * twD;
      var dx = CX + Math.cos(d.a) * R * (1.15 + d.r * 0.45);
      var dy = CY + Math.sin(d.a) * R * (1.15 + d.r * 0.45);
      var ds = d.s * 1.1;
      ctx.drawImage(RAMP[0], dx - ds, dy - ds, ds * 2, ds * 2);
    }

    /* ---- bezel dial ---- */
    for (i = 0; i < BEZEL_N; i++) {
      var b = bezel[i];
      var bx = CX + Math.cos(b.a) * R * 1.22;
      var by = CY + Math.sin(b.a) * R * 1.22;
      var bBoost = env * Math.exp(-((by - sy) * (by - sy)) / (sigma * sigma));
      ctx.globalAlpha = (b.tick ? 0.17 : 0.065) + bBoost * 0.25;
      var bs = (b.tick ? 1.05 : 0.62) * (1 + bBoost * 0.5);
      ctx.drawImage(RAMP[0], bx - bs, by - bs, bs * 2, bs * 2);
    }
    /* satellite marker on the dial */
    var sa = -t * 0.16 - 0.8;
    var sx2 = CX + Math.cos(sa) * R * 1.22, sy2 = CY + Math.sin(sa) * R * 1.22;
    ctx.globalAlpha = 0.5;
    ctx.drawImage(RAMP[0], sx2 - 1.3, sy2 - 1.3, 2.6, 2.6);
    ctx.globalAlpha = 0.12;
    ctx.drawImage(RAMP[0], sx2 - 2.6, sy2 - 2.6, 5.2, 5.2);

    /* ---- globe lattice ---- */
    var n = pts.length;
    for (i = 0; i < n; i++) {
      var pt = pts[i];
      /* spin about y */
      var x = pt.x * cs + pt.z * ss;
      var z = -pt.x * ss + pt.z * cs;
      var y = pt.y;
      /* tip about x */
      var y2 = y * ct - z * stp;
      var z2 = y * stp + z * ct;
      /* lean about z */
      var x3 = x * cl - y2 * sl;
      var y3 = x * sl + y2 * cl;

      var px = CX + x3 * R;
      var py = CY + y3 * R;

      if (z2 < 0) {
        /* far hemisphere: sparse, whisper-faint, ember tinted */
        if (pt.rnd < 0.26) {
          ctx.globalAlpha = 0.065;
          ctx.drawImage(RAMP[5], px - 0.65, py - 0.65, 1.3, 1.3);
        }
        continue;
      }

      var s = x3 * LX + y3 * LY + z2 * LZ;
      var lit = s > 0 ? s : 0;

      /* scan boost — computed before density so the sweep can
         resurrect dots dissolved into the shadow side */
      var boost = env * Math.exp(-((py - sy) * (py - sy)) / (sigma * sigma));

      /* ember rises on the dark limb */
      var rim = Math.pow(1 - z2, 2.2);
      var emberAmt = (1 - lit) * rim;

      /* density: shadow side dissolves, sweep re-reveals it;
         soft margin so dots fade in/out instead of popping */
      var dens = 0.37 + 0.63 * Math.pow(lit, 0.65) + emberAmt * 0.4 + boost * 0.8;
      var margin = dens - pt.rnd;
      if (margin <= 0) continue;
      var fade = margin < 0.12 ? margin / 0.12 : 1;

      var rampIdx = Math.min(RAMP_N - 1, Math.round(emberAmt * 2.0 * (RAMP_N - 1)));
      if (boost > 0.35) rampIdx = 0; /* the scan reads cold ink */

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

      var edge = Math.min(1, z2s * 4);
      var aS = (St.home ? 0.62 : 0.34) + 0.38 * blink;
      aS = Math.min(1, aS + stBoost * 0.4) * edge;

      var rs = (St.home ? 2.05 : 1.5) * (1 + 0.16 * blink + stBoost * 0.4);
      /* halo */
      ctx.globalAlpha = aS * 0.17;
      ctx.drawImage(SPR_TEAL, pxs - rs * 2.6, pys - rs * 2.6, rs * 5.2, rs * 5.2);
      /* core */
      ctx.globalAlpha = aS;
      ctx.drawImage(SPR_TEAL, pxs - rs, pys - rs, rs * 2, rs * 2);

      /* home ripple ping: expanding ring of tiny dots */
      if (St.home) {
        var rt = t - ripT;
        if (rt > 0 && rt < 1.6) {
          var rr = 3 + rt * 9;
          var ra = 0.5 * (1 - rt / 1.6);
          for (var k = 0; k < 12; k++) {
            var ka = (k / 12) * Math.PI * 2;
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
      draw(STILL_T); /* sweep mid-globe, stations lit: one considered frame */
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
