(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  var CONFIG = {
    duration: 6500,                 // ms for the 5-contact bounce (constant speed; higher = slower)
    // The logo starts white, then takes one of these colours per contact (shuffled each run).
    // To match a green home screen instead, use: ['#7dff5a', '#b8ffa6', '#2bd40f', '#d6ffcc', '#5cff3a']
    colors: ['#6aaeff', '#ff6b5e', '#8ee3b4', '#f5d067', '#c79bff'],
    holdAfterCorner: 900,           // ms the logo stays after landing in the corner
    fade: 800,                      // ms for the fade into the home screen
    oncePerSession: false,          // false = play on every refresh as requested
    storageKey: 'psp-intro-seen',
    forceParam: 'intro'             // ?intro in the URL forces the intro while testing
  };

  var html = document.documentElement;
  var KEY = CONFIG.storageKey;
  var root, logo, svg, timers = [], raf;

  var LOGO =
    '<svg viewBox="0 0 200 92" aria-hidden="true">' +
    '<text x="100" y="56" text-anchor="middle" font-size="62" font-weight="900" font-style="italic" ' +
    'font-family="\'Arial Black\',Impact,\'Helvetica Neue\',Arial,sans-serif" letter-spacing="3" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">PSP</text>' +
    '<path fill="currentColor" fill-rule="evenodd" ' +
    'd="M4 76a96 12 0 1 0 192 0a96 12 0 1 0-192 0ZM83 76a17 3.8 0 1 0 34 0a17 3.8 0 1 0-34 0Z"/>' +
    '</svg>';

  var CSS =
    'html.psp-intro-active,html.psp-intro-active body{overflow:hidden}' +
    'html.psp-intro-active:not(.psp-reveal) body{visibility:hidden}' +
    '.psp-intro{position:fixed;inset:0;z-index:2147483000;overflow:hidden;visibility:visible;background:#000}' +
    '.psp-logo{position:absolute;left:0;top:0;width:clamp(110px,18vw,160px);will-change:transform}' +
    '.psp-logo svg{display:block;width:100%;height:auto;overflow:visible;color:#fff;transition:color .35s ease}' +
    '.psp-logo svg.psp-impact{animation:psp-impact .9s cubic-bezier(.2,.7,.2,1)}' +
    '@keyframes psp-impact{0%{transform:scale(1);filter:drop-shadow(0 0 0 currentColor)}' +
      '35%{transform:scale(1.14);filter:drop-shadow(0 0 22px currentColor)}' +
      '100%{transform:scale(1);filter:drop-shadow(0 0 0 currentColor)}}';

  /* ---------- helpers ---------- */
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = []; }
  function emit(name) { try { window.dispatchEvent(new CustomEvent(name)); } catch (e) {} }
  function tri(s, L) { var p = ((s % (2 * L)) + 2 * L) % (2 * L); return p <= L ? p : 2 * L - p; }
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

  /* Random flight path: 4 wall hits, then the 5th contact is a corner.
     Random start, random bounce split, random mirroring (any of the 4 corners). */
  function plan(Rx, Ry) {
    var opts = Rx >= Ry ? [[4, 2], [4, 2], [3, 3]] : [[2, 4], [2, 4], [3, 3]];
    for (var t = 0; t < 300; t++) {
      var o = opts[Math.random() * opts.length | 0], nx = o[0], ny = o[1],
          x0 = Rx * (.06 + Math.random() * .88), y0 = Ry * (.06 + Math.random() * .88),
          ax = nx * Rx - x0, ay = ny * Ry - y0, ev = [], k;
      for (k = 1; k < nx; k++) ev.push((k * Rx - x0) / ax);
      for (k = 1; k < ny; k++) ev.push((k * Ry - y0) / ay);
      ev.sort(function (a, b) { return a - b; });
      var ok = ev[0] >= .08 && 1 - ev[ev.length - 1] >= .08;
      for (k = 1; k < ev.length && ok; k++) if (ev[k] - ev[k - 1] < .07) ok = false;
      if (ok) { ev.push(1); return { x0: x0, y0: y0, ax: ax, ay: ay, ev: ev }; }
    }
    var wide = Rx >= Ry, fx = wide ? 4 : 2, fy = wide ? 2 : 4,
        X = Rx * (wide ? .2 : .55), Y = Ry * (wide ? .55 : .2),
        AX = fx * Rx - X, AY = fy * Ry - Y, E = [], i;
    for (i = 1; i < fx; i++) E.push((i * Rx - X) / AX);
    for (i = 1; i < fy; i++) E.push((i * Ry - Y) / AY);
    E.sort(function (p, q) { return p - q; }); E.push(1);
    return { x0: X, y0: Y, ax: AX, ay: AY, ev: E };
  }

  /* ---------- the entry: a simple fade ---------- */
  function reveal() {
    if (!root) return;
    html.classList.add('psp-reveal'); emit('psp:reveal');     // page becomes visible under the overlay
    root.style.transition = 'opacity ' + CONFIG.fade + 'ms ease';
    root.style.opacity = '0';
    later(close, CONFIG.fade + 50);
  }

  function close() {
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

    root = document.createElement('div');
    root.className = 'psp-intro'; root.setAttribute('role', 'status'); root.setAttribute('aria-label', 'Loading');
    root.innerHTML = '<div class="psp-logo">' + LOGO + '</div>';
    document.body.appendChild(root);
    logo = root.querySelector('.psp-logo'); svg = logo.querySelector('svg');

    var W = innerWidth, H = innerHeight, w = logo.offsetWidth, h = logo.offsetHeight,
        Rx = Math.max(1, W - w), Ry = Math.max(1, H - h), p = plan(Rx, Ry),
        mx = Math.random() < .5, my = Math.random() < .5,
        colors = ['#ffffff'].concat(shuffle(CONFIG.colors.slice())), start = null, shown = 0;

    function frame(now) {
      if (!root) return;
      if (start === null) start = now;
      var e = Math.min(1, (now - start) / CONFIG.duration),
          x = tri(p.x0 + p.ax * e, Rx), y = tri(p.y0 + p.ay * e, Ry);
      if (mx) x = Rx - x; if (my) y = Ry - y;
      logo.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      var hits = 0; while (hits < p.ev.length && p.ev[hits] <= e) hits++;
      if (hits !== shown) { shown = hits; svg.style.color = colors[hits % colors.length]; }   // colour change per contact
      if (e < 1) raf = requestAnimationFrame(frame);
      else { svg.classList.add('psp-impact'); later(reveal, CONFIG.holdAfterCorner); }       // 5th contact (corner) -> pulse -> fade
    }
    raf = requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  var willPlay = forced() || (!reduced() && !(CONFIG.oncePerSession && seen()));
  if (willPlay) {
    injectCSS(); html.classList.add('psp-intro-active');
    setTimeout(function () { if (!document.querySelector('.psp-intro')) html.classList.remove('psp-intro-active'); }, 4000); // failsafe
  }
  function boot() { play(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.PSPIntro = { play: function () { play(true); } };
})();
