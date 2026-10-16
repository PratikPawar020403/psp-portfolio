(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  var CONFIG = {
    duration: 5400,                 // ms for the bounce flight (calm, hypnotic & cinematic)
    // The logo starts white, then takes one of these colours per contact (shuffled each run).
    colors: ['#6aaeff', '#ff6b5e', '#8ee3b4', '#f5d067', '#c79bff'],
    holdAfterCorner: 450,           // ms the logo stays after landing in the corner
    fade: 450,                      // ms for the fade into the home screen
    oncePerSession: false,          // always show the cinematic loading intro on refresh/visit
    storageKey: 'psp-intro-seen',
    forceParam: 'intro'             // ?intro in the URL forces the intro while testing
  };

  var html = document.documentElement;
  var KEY = CONFIG.storageKey;
  var root, logo, svg, timers = [], raf, revealed = false;

  var LOGO =
    '<svg viewBox="0 0 200 92" aria-hidden="true">' +
    '<text x="100" y="56" text-anchor="middle" font-size="62" font-weight="900" font-style="italic" ' +
    'font-family="\'Arial Black\',Impact,\'Helvetica Neue\',Arial,sans-serif" letter-spacing="3" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">PSP</text>' +
    '<path fill="currentColor" fill-rule="evenodd" ' +
    'd="M4 76a96 12 0 1 0 192 0a96 12 0 1 0-192 0ZM83 76a17 3.8 0 1 0 34 0a17 3.8 0 1 0-34 0Z"/>' +
    '</svg>';

  var CSS =
    'html.psp-intro-active{overflow:hidden}' +
    '.psp-intro{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#000;pointer-events:auto}' +
    '.psp-logo{position:absolute;left:0;top:0;width:140px;height:64.4px;aspect-ratio:200/92;' +
      'will-change:transform;pointer-events:none;contain:layout style paint}' +
    '@media(max-width:480px){.psp-logo{width:110px;height:50.6px}}' +
    '.psp-logo svg{display:block;width:100%;height:100%;overflow:visible;color:#fff;transform-origin:center center;will-change:transform}' +
    '.psp-logo svg.psp-impact{animation:psp-impact .65s cubic-bezier(.16,1,.3,1)}' +
    '@keyframes psp-impact{0%{transform:scale(1)}35%{transform:scale(1.18)}100%{transform:scale(1)}}';

  /* ---------- helpers ---------- */
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = []; }
  function emit(name) { try { window.dispatchEvent(new CustomEvent(name)); } catch (e) {} }

  // C1 continuous smoothed triangle wave: cushions wall reflections without abrupt velocity flips
  function smoothTri(s, L, delta) {
    var period = 2 * L;
    var p = ((s % period) + period) % period;
    var raw = p <= L ? p : period - p;
    if (!delta || delta <= 0 || L <= 2 * delta) return raw;
    if (raw < delta) {
      var u = raw / delta;
      return delta * (u * u * (2 - u));
    }
    if (raw > L - delta) {
      var d = L - raw;
      var u2 = d / delta;
      return L - delta * (u2 * u2 * (2 - u2));
    }
    return raw;
  }

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function seen() { try { return !!sessionStorage.getItem(KEY); } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
  function forced() { return new RegExp('[?&]' + CONFIG.forceParam + '(=|&|$)').test(location.search); }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function injectCSS() {
    if (document.getElementById('psp-intro-css')) return;
    var s = document.createElement('style'); s.id = 'psp-intro-css'; s.textContent = CSS;
    (document.head || html).appendChild(s);
  }

  /* Random flight path: 3-4 evenly spaced wall hits, docking into a corner.
     Balanced velocity ratio avoids shallow ping-pong angles and eliminates stutter. */
  function plan(Rx, Ry) {
    var opts = Rx >= Ry ? [[3, 2], [3, 2], [2, 2]] : [[2, 3], [2, 3], [2, 2]];
    for (var t = 0; t < 300; t++) {
      var o = opts[Math.random() * opts.length | 0], nx = o[0], ny = o[1],
          x0 = Rx * (.08 + Math.random() * .84), y0 = Ry * (.08 + Math.random() * .84),
          ax = nx * Rx - x0, ay = ny * Ry - y0, ev = [], k;
      for (k = 1; k < nx; k++) ev.push((k * Rx - x0) / ax);
      for (k = 1; k < ny; k++) ev.push((k * Ry - y0) / ay);
      ev.sort(function (a, b) { return a - b; });
      var ok = ev[0] >= .12 && 1 - ev[ev.length - 1] >= .12;
      for (k = 1; k < ev.length && ok; k++) if (ev[k] - ev[k - 1] < .13) ok = false;
      if (ok) { ev.push(1); return { x0: x0, y0: y0, ax: ax, ay: ay, ev: ev }; }
    }
    var wide = Rx >= Ry, fx = wide ? 3 : 2, fy = wide ? 2 : 3,
        X = Rx * (wide ? .2 : .55), Y = Ry * (wide ? .55 : .2),
        AX = fx * Rx - X, AY = fy * Ry - Y, E = [], i;
    for (i = 1; i < fx; i++) E.push((i * Rx - X) / AX);
    for (i = 1; i < fy; i++) E.push((i * Ry - Y) / AY);
    E.sort(function (p, q) { return p - q; }); E.push(1);
    return { x0: X, y0: Y, ax: AX, ay: AY, ev: E };
  }

  /* ---------- the entry: a simple fade ---------- */
  function handleKey(e) {
    if (e.key === 'Escape') {
      reveal();
    }
  }

  function reveal() {
    if (!root || revealed) return;
    revealed = true;
    html.classList.add('psp-reveal'); emit('psp:reveal');     // page becomes visible under the overlay
    root.style.transition = 'opacity ' + CONFIG.fade + 'ms cubic-bezier(.22,1,.36,1)';
    root.style.opacity = '0';
    later(close, CONFIG.fade + 50);
  }

  function close() {
    window.removeEventListener('keydown', handleKey);
    clearTimers();
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
    html.classList.add('psp-reveal'); html.classList.remove('psp-intro-active');
    markSeen(); emit('psp:done');
  }

  function skipAll() {
    html.classList.add('psp-reveal'); html.classList.remove('psp-intro-active');
    emit('psp:reveal'); emit('psp:done');
  }

  function play(force) {
    if (root) return;
    if (!force && !forced() && (reduced() || (CONFIG.oncePerSession && seen()))) { skipAll(); return; }
    if (force && reduced()) { skipAll(); return; }
    injectCSS();
    html.classList.remove('psp-reveal'); html.classList.add('psp-intro-active');
    revealed = false;

    root = document.createElement('div');
    root.className = 'psp-intro'; root.setAttribute('role', 'status'); root.setAttribute('aria-label', 'Loading');
    root.innerHTML = '<div class="psp-logo">' + LOGO + '</div>';
    document.body.appendChild(root);
    logo = root.querySelector('.psp-logo'); svg = logo.querySelector('svg');

    window.addEventListener('keydown', handleKey);

    // Bulletproof watchdog timers: guaranteed reveal and removal even if RAF or script stalls
    later(reveal, CONFIG.duration + CONFIG.holdAfterCorner + 1500);
    later(close, CONFIG.duration + CONFIG.holdAfterCorner + CONFIG.fade + 2000);

    var W = innerWidth, H = innerHeight;
    var w = W <= 480 ? 110 : 140;
    var h = W <= 480 ? 50.6 : 64.4;
    var Rx = Math.max(10, W - w), Ry = Math.max(10, H - h), p = plan(Rx, Ry),
        mx = Math.random() < .5, my = Math.random() < .5,
        colors = ['#ffffff'].concat(shuffle(CONFIG.colors.slice())), lastTime = null, simTime = 0, shown = 0;

    function onResize() {
      W = innerWidth; H = innerHeight;
      w = W <= 480 ? 110 : 140;
      h = W <= 480 ? 50.6 : 64.4;
      Rx = Math.max(10, W - w);
      Ry = Math.max(10, H - h);
    }
    window.addEventListener('resize', onResize, { passive: true });

    function frame(now) {
      if (!root) {
        window.removeEventListener('resize', onResize);
        return;
      }
      if (lastTime === null) lastTime = now;
      var dt = Math.min(Math.max(now - lastTime, 0), 28); // Clamp frame delta to 28ms max to prevent teleportation
      lastTime = now;
      simTime += dt;
      var e = Math.min(1, Math.max(0, simTime / CONFIG.duration));

      // Docking deceleration: glide smoothly into corner landing over final 12%
      var eDock = e;
      if (e > 0.88) {
        var wDock = (e - 0.88) / 0.12;
        var wEase = wDock * (1 + wDock - wDock * wDock);
        eDock = 0.88 + 0.12 * wEase;
      }

      var x = smoothTri(p.x0 + p.ax * eDock, Rx, 16);
      var y = smoothTri(p.y0 + p.ay * eDock, Ry, 16);
      if (mx) x = Rx - x;
      if (my) y = Ry - y;

      logo.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';

      var hits = 0;
      while (hits < p.ev.length && p.ev[hits] <= e) hits++;
      if (hits !== shown) {
        shown = hits;
        svg.style.color = colors[hits % colors.length];
      }

      if (e < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        window.removeEventListener('resize', onResize);
        svg.classList.add('psp-impact');
        later(reveal, CONFIG.holdAfterCorner);
      }
    }
    raf = requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  var willPlay = forced() || (!reduced() && !(CONFIG.oncePerSession && seen()));
  if (willPlay) {
    injectCSS(); html.classList.add('psp-intro-active');
    setTimeout(function () {
      if (!document.querySelector('.psp-intro')) html.classList.remove('psp-intro-active');
    }, 4000);
  }
  function boot() { play(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.PSPIntro = { play: function () { play(true); } };
})();
