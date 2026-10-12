(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  var CONFIG = {
    title: 'TIPS.TXT',              // window title (matches the WELCOME.TXT look)
    prompt: '>',                    // prompt character before the message
    range: ['1', '4'],              // section shortcut range
    suffix: 'warp to a section',    // text after the key combo
    helpKey: '?',
    helpText: 'the manual',         // "? for the manual"
    color: '#39ff14',               // phosphor green: exact #39FF14 green used on the home screen
    font: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace', // matches ScrambledText monospace stack
    delayAfterIntro: 900,           // ms after the intro finishes (or after load if no intro)
    duration: 3000,                 // ms visible (pauses on hover/focus)
    oncePerSession: true,
    storageKey: 'pk-toast-seen',
    forceParam: 'toast',            // ?toast forces it, for testing
    hideOnTouch: true
  };

  var html = document.documentElement;
  var region, toast, bar, timer, remaining, started, shown = false;

  var isMac = /Mac|iPhone|iPad/.test((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '');
  var MOD = isMac ? 'Option' : 'Alt';

  function rgb(hex) {
    var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    return parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16);
  }

  var MONITOR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/>' +
    '<path d="M8 21h8M12 17v4"/></svg>';

  var CSS =
    '.pk-region{position:fixed;left:0;right:0;top:calc(10px + env(safe-area-inset-top,0px));display:flex;' +
      'justify-content:flex-end;padding:0 clamp(12px,2vw,24px);z-index:9999;pointer-events:none;' +
      '--pk-c:#39ff14;--pk-rgb:57,255,20;' +
      '--pk-font:ui-monospace,SFMono-Regular,Menlo,Consolas,"Courier New",monospace}' +
    '.pk-toast{position:relative;overflow:hidden;pointer-events:auto;width:max-content;max-width:min(400px,100%);' +
      'border-radius:12px;background:rgba(0,0,0,.94);color:var(--pk-c);font:500 12px/1.45 var(--pk-font);' +
      'border:1.5px solid rgba(var(--pk-rgb),.55);' +
      'box-shadow:0 0 16px rgba(var(--pk-rgb),.22),inset 0 0 20px rgba(var(--pk-rgb),.07);' +
      'opacity:0;transform:translateX(24px);transition:opacity .35s steps(5),transform .45s cubic-bezier(.2,.8,.2,1)}' +
    '.pk-toast::after{content:"";position:absolute;inset:0;pointer-events:none;' +
      'background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0,rgba(0,0,0,.28) 1px,transparent 1px,transparent 3px)}' +
    '.pk-toast.pk-in{opacity:1;transform:none}' +
    '.pk-toast.pk-out{opacity:0;transform:translateX(16px)}' +
    '.pk-head{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;' +
      'border-bottom:1px solid rgba(var(--pk-rgb),.35);text-shadow:0 0 8px rgba(var(--pk-rgb),.6)}' +
    '.pk-title{flex:1;font-weight:800;letter-spacing:.12em;font-size:11px}' +
    '.pk-close{flex:none;width:20px;height:20px;min-width:0;min-height:0;padding:0;border:0;border-radius:5px;' +
      'display:inline-flex;align-items:center;justify-content:center;background:transparent;color:inherit;' +
      'font:700 14px/1 var(--pk-font);cursor:pointer;opacity:.75}' +
    '.pk-close:hover,.pk-close:focus-visible{opacity:1;background:rgba(var(--pk-rgb),.16);outline:none}' +
    '.pk-bodyrow{padding:9px 12px 11px;text-shadow:0 0 7px rgba(var(--pk-rgb),.55);letter-spacing:.02em}' +
    '.pk-line{display:inline;--n:36;animation:pk-type 1.5s steps(var(--n),end) both}' +
    '.pk-prompt{opacity:.7;margin-right:8px}' +
    '.pk-line kbd{font:700 11px var(--pk-font);padding:0 5px;margin:0 1px;border-radius:4px;color:var(--pk-c);' +
      'border:1px solid rgba(var(--pk-rgb),.7);border-bottom-width:2px;background:rgba(var(--pk-rgb),.08)}' +
    '.pk-sep{opacity:.5;margin:0 6px}' +
    '.pk-cursor{display:inline-block;width:.6em;height:1.05em;margin-left:5px;vertical-align:-.15em;' +
      'background:var(--pk-c);box-shadow:0 0 8px var(--pk-c);opacity:0;animation:pk-blink 1s steps(2,start) 1.5s infinite}' +
    '.pk-bar{display:block;height:4px;margin:0 12px 10px;' +
      'background:repeating-linear-gradient(90deg,var(--pk-c) 0,var(--pk-c) 7px,transparent 7px,transparent 10px);' +
      'opacity:.85;animation:pk-bar steps(14,end) forwards}' +
    '@keyframes pk-type{from{clip-path:inset(-4px 100% -4px 0)}to{clip-path:inset(-4px 0 -4px 0)}}' +
    '@keyframes pk-blink{0%{opacity:1}50%{opacity:0}}' +
    '@keyframes pk-bar{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 100% 0 0)}}' +
    '@media (prefers-reduced-motion:reduce){.pk-toast{transition:opacity .2s}.pk-toast,.pk-toast.pk-out{transform:none}' +
      '.pk-line{animation:none}.pk-cursor{animation:none;opacity:1}.pk-bar{display:none}}';

  /* ---------- helpers ---------- */
  function seen() { try { return !!sessionStorage.getItem(CONFIG.storageKey); } catch (e) { return false; } }
  function mark() { try { sessionStorage.setItem(CONFIG.storageKey, '1'); } catch (e) {} }
  function forced() { return new RegExp('[?&]' + CONFIG.forceParam + '(=|&|$)').test(location.search); }
  function touch() { return window.matchMedia && matchMedia('(hover: none), (pointer: coarse)').matches; }
  function ensureRegion() {
    if (region) return;
    if (!document.getElementById('pk-toast-css')) {
      var s = document.createElement('style'); s.id = 'pk-toast-css'; s.textContent = CSS; document.head.appendChild(s);
    }
    region = document.createElement('div');          // live region first so screen readers announce the content
    region.className = 'pk-region'; region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite');
    region.style.setProperty('--pk-c', CONFIG.color);
    region.style.setProperty('--pk-rgb', rgb(CONFIG.color));
    if (CONFIG.font) region.style.setProperty('--pk-font', CONFIG.font);
    document.body.appendChild(region);
  }

  /* ---------- show / hide ---------- */
  function startTimer() { started = Date.now(); timer = setTimeout(hide, remaining); }
  function pause() { if (!toast) return; clearTimeout(timer); remaining -= Date.now() - started; bar.style.animationPlayState = 'paused'; }
  function resume() { if (!toast) return; startTimer(); bar.style.animationPlayState = 'running'; }
  function onKey(e) {
    if (e.key === 'Escape' || e.key === CONFIG.helpKey || (e.altKey && /^Digit[1-9]$/.test(e.code))) hide();
  }

  function show(force) {
    if (toast) return;
    if (!force) {
      if (shown) return;
      if (CONFIG.hideOnTouch && touch()) return;
      if (CONFIG.oncePerSession && seen() && !forced()) return;
    }
    shown = true; mark(); ensureRegion();

    var text = CONFIG.range[0] + CONFIG.range[1] + CONFIG.suffix + CONFIG.helpKey + CONFIG.helpText + MOD;
    toast = document.createElement('div');
    toast.className = 'pk-toast';
    toast.innerHTML =
      '<div class="pk-head">' + MONITOR + '<span class="pk-title">' + CONFIG.title + '</span>' +
      '<button class="pk-close" type="button" aria-label="Dismiss keyboard hint">&times;</button></div>' +
      '<div class="pk-bodyrow"><span class="pk-prompt">' + CONFIG.prompt + '</span>' +
      '<span class="pk-line" style="--n:' + Math.max(24, text.length) + '">' +
      '<kbd>' + MOD + '</kbd>+<kbd>' + CONFIG.range[0] + '</kbd>&ndash;<kbd>' + CONFIG.range[1] + '</kbd> ' + CONFIG.suffix +
      '<span class="pk-sep">|</span><kbd>' + CONFIG.helpKey + '</kbd> ' + CONFIG.helpText + '</span>' +
      '<span class="pk-cursor"></span></div>' +
      '<span class="pk-bar"></span>';
    region.appendChild(toast);

    bar = toast.querySelector('.pk-bar');
    bar.style.animationDuration = CONFIG.duration + 'ms';
    toast.querySelector('.pk-close').addEventListener('click', hide);
    toast.addEventListener('mouseenter', pause); toast.addEventListener('mouseleave', resume);
    toast.addEventListener('focusin', pause);    toast.addEventListener('focusout', resume);
    document.addEventListener('keydown', onKey);
    remaining = CONFIG.duration; startTimer();

    requestAnimationFrame(function () { requestAnimationFrame(function () { if (toast) toast.classList.add('pk-in'); }); });
  }

  function hide() {
    if (!toast) return;
    var t = toast; toast = null; clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    t.classList.remove('pk-in'); t.classList.add('pk-out');
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 450);
  }

  /* ---------- trigger ---------- */
  function schedule() { setTimeout(function () { show(); }, CONFIG.delayAfterIntro); }
  function boot() {
    if (html.classList.contains('psp-intro-active')) {
      window.addEventListener('psp:done', schedule, { once: true });
      setTimeout(function () { if (!shown && !html.classList.contains('psp-intro-active')) schedule(); }, 14000);
    } else { schedule(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.PSPToast = { show: function () { show(true); }, hide: hide };
})();
