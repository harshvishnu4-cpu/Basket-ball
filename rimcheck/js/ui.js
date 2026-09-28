window.RC = window.RC || {};
/* Shared chrome: top bar, primary CTA, Coach Riya + speech bubble. */
RC.ui = (function () {
  var $ = RC.util.qs;
  var topbarEl, backBtn, labelEl, replayBtn, muteBtn, timerPill, ctaWrap, ctaBtn, ctaHandler = null;
  var coachEl, coachImgs = {}, coachNameEl, speechEl, hushTimer = 0, replayFn = null;
  var coachPos = { left: 40, bottom: 30, height: 560 };
  var COACH_ASPECT = 1024 / 1536; // coach_riya_point.png canvas aspect; the figure is centred in it

  function init() {
    topbarEl = $('#topbar'); backBtn = $('#btn-back'); labelEl = $('#section-label'); replayBtn = $('#btn-replay'); muteBtn = $('#btn-mute'); timerPill = $('#timer-pill');
    ctaWrap = $('#cta-wrap'); ctaBtn = $('#cta');
    coachEl = $('#coach'); coachNameEl = $('#coach-name'); speechEl = $('#speech');
    RC.util.qsa('#coach img').forEach(function (im) { coachImgs[im.getAttribute('data-pose')] = im; });

    ctaLabel = ctaBtn.querySelector('.cta-label');
    backBtn.addEventListener('click', function () { RC.router.back(); });
    replayBtn.addEventListener('click', function () { if (replayFn) { RC.audio.sfx('press'); replayFn(); } });
    muteBtn.addEventListener('click', function () {
      var on = !RC.state.audioEnabled; RC.audio.setEnabled(on); if (!on) RC.narration.stop(true); updateMute(); RC.audio.sfx('press');
    });
    ctaBtn.addEventListener('click', function () { if (ctaBtn.disabled) return; RC.audio.sfx('press'); if (ctaHandler) ctaHandler(); });
    // hover sound on all buttons (delegated, mouse only)
    document.addEventListener('pointerenter', function (e) { var b = e.target && e.target.closest && e.target.closest('.btn:not(:disabled), .gear-btn:not(:disabled)'); if (b && e.pointerType === 'mouse') RC.audio.sfx('hover'); }, true);
    // info panel
    $('#btn-info').addEventListener('click', function () { RC.audio.sfx('press'); info.open(); });
    $('#info-close').addEventListener('click', function () { RC.audio.sfx('press'); info.close(); });
    $('#info-replay').addEventListener('click', function () { RC.audio.sfx('press'); info.close(); if (replayFn) replayFn(); });
    $('#info-overlay').addEventListener('click', function (e) { if (e.target.id === 'info-overlay') info.close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#info-overlay').hidden) { e.stopPropagation(); info.close(); } }, true);
    updateMute();
    setInterval(tickClock, 500);
  }
  function updateMute() {
    var on = RC.state.audioEnabled;
    muteBtn.classList.toggle('off', !on);
    muteBtn.setAttribute('aria-label', on ? 'Mute sound' : 'Unmute sound');
  }
  /* Mission clock on the SKAI timer sign: counts down from the mission budget (Figma shows 35:00). Reaching zero has no penalty. */
  var MISSION_SECONDS = 35 * 60, clockStart = null, ctaLabel;
  function tickClock() {
    if (clockStart == null) return;
    var s = Math.max(0, MISSION_SECONDS - Math.floor((performance.now() - clockStart) / 1000)), m = Math.floor(s / 60); s = s % 60;
    var t = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    var span = $('#timer-text'); if (span && span.textContent !== t) span.textContent = t;
  }
  var info = {
    open: function () {
      var ov = $('#info-overlay');
      $('#info-title').textContent = labelEl.textContent || '';
      $('#info-text').textContent = RC.narration.lastText() || RC.text.intro.line;
      $('#info-replay').hidden = !replayFn;
      ov.hidden = false; RC.hint.activity(true);
      setTimeout(function () { $('#info-close').focus(); }, 50);
    },
    close: function () { $('#info-overlay').hidden = true; },
    isOpen: function () { return !$('#info-overlay').hidden; }
  };

  var topbar = {
    show: function (label) { topbarEl.hidden = false; labelEl.textContent = label || ''; if (clockStart == null) clockStart = performance.now(); },
    hide: function () { topbarEl.hidden = true; info.close(); },
    setBackEnabled: function (v) { backBtn.disabled = !v; backBtn.style.visibility = v ? 'visible' : 'hidden'; },
    setReplay: function (fn) { replayFn = fn; replayBtn.hidden = !fn; },
    timer: function (text) { timerPill.hidden = text === false; },
    resetClock: function () { clockStart = null; var span = $('#timer-text'); if (span) span.textContent = '35:00'; }
  };

  var cta = {
    show: function (o) {
      o = o || {};
      ctaLabel.textContent = o.label || 'Next';
      ctaHandler = o.onClick || null;
      ctaBtn.disabled = o.enabled === false;
      ctaBtn.classList.toggle('completed', !!o.completed);
      ctaWrap.hidden = false;
      ctaWrap.classList.remove('anim-pop'); void ctaWrap.offsetWidth; ctaWrap.classList.add('anim-pop');
    },
    hide: function () { ctaWrap.hidden = true; ctaHandler = null; },
    enable: function (v) { ctaBtn.disabled = v === false; if (v !== false && ctaWrap.hidden === false) { ctaBtn.classList.remove('anim-pop'); void ctaBtn.offsetWidth; ctaBtn.classList.add('anim-pop'); } },
    label: function (t) { ctaLabel.textContent = t; },
    complete: function (v) { ctaBtn.classList.toggle('completed', v !== false); },
    isVisible: function () { return !ctaWrap.hidden; }
  };

  var lastSay = null;
    function positionBubble(o) {
      speechEl.classList.remove('tail-right', 'tail-none');
      speechEl.style.maxWidth = '';
      // Activity instructions occupy the guide column, never the shooter or rule tray.
      var scr = RC.router.current();
      if (o.x == null && (scr === 6 || scr === 9)) {
        // test console fills the column above Riya, so the bubble sits beside her head
        speechEl.style.left = '330px'; speechEl.style.right = 'auto'; speechEl.style.bottom = '380px';
        speechEl.style.maxWidth = '340px';
        return;
      }
      if (o.x == null && scr >= 4 && scr <= 8) {
        speechEl.style.left = '48px'; speechEl.style.right = 'auto'; speechEl.style.bottom = '520px';
        speechEl.style.maxWidth = '400px';
        return;
      }
      // Two-hoop court: Riya stands between the rule panels, so the bubble hangs above her, clear of both call tabs.
      if (o.x == null && RC.router.current() === 10) {
        speechEl.style.left = '700px'; speechEl.style.right = 'auto'; speechEl.style.bottom = '565px';
        speechEl.style.maxWidth = '520px'; speechEl.classList.add('tail-none');
        return;
      }
    if (o.x != null) {
      speechEl.style.left = o.x + 'px'; speechEl.style.right = 'auto'; speechEl.style.bottom = o.bottom + 'px';
      if (o.tail === 'right') speechEl.classList.add('tail-right'); if (o.tail === 'none') speechEl.classList.add('tail-none');
      return;
    }
    var w = Math.round(coachPos.height * COACH_ASPECT);
    if (coachPos.left > 1000) { speechEl.style.left = 'auto'; speechEl.style.right = Math.max(120, 1920 - coachPos.left - w + 60) + 'px'; speechEl.classList.add('tail-right'); }
    else { speechEl.style.right = 'auto'; speechEl.style.left = Math.max(40, coachPos.left + Math.round(w * 0.25)) + 'px'; }
    speechEl.style.bottom = (coachPos.bottom + coachPos.height + 6) + 'px'; // just above Riya's head, never over her face
  }
  var coach = {
    show: function (pose, o) {
      o = o || {};
      coachPos = { left: o.left != null ? o.left : 40, bottom: o.bottom != null ? o.bottom : 30, height: o.height != null ? o.height : 560 };
      coachEl.hidden = false;
      coachEl.style.left = coachPos.left + 'px'; coachEl.style.bottom = coachPos.bottom + 'px';
      coachEl.style.height = coachPos.height + 'px'; coachEl.style.width = Math.round(coachPos.height * COACH_ASPECT) + 'px';
      coachNameEl.classList.toggle('on', !!o.name);
      coach.pose(pose || 'idle');
      if (speechEl.classList.contains('on') && lastSay && lastSay.x == null) positionBubble(lastSay);
    },
    // Coach Riya ships with one authored pose; unknown pose names fall back to the first image so screens can keep
    // requesting expressive poses (thinking / celebrate / …) and pick them up automatically once the art exists.
    pose: function (p) {
      var keys = Object.keys(coachImgs), use = coachImgs[p] ? p : (coachImgs.idle ? 'idle' : keys[0]);
      keys.forEach(function (k) { coachImgs[k].classList.toggle('on', k === use); });
      coachEl.setAttribute('data-mood', p || '');
    },
    hide: function () { coachEl.hidden = true; coach.hush(0); },
    say: function (text, o) {
      o = o || {};
      clearTimeout(hushTimer);
      speechEl.textContent = text;
      lastSay = o;
      positionBubble(o);
      speechEl.classList.add('on');
      if (o.duration) hushTimer = setTimeout(function () { speechEl.classList.remove('on'); }, o.duration);
    },
    hush: function (delay) { clearTimeout(hushTimer); if (!delay) speechEl.classList.remove('on'); else hushTimer = setTimeout(function () { speechEl.classList.remove('on'); }, delay); }
  };

  return { init: init, topbar: topbar, cta: cta, coach: coach, info: info, updateMute: updateMute };
})();
