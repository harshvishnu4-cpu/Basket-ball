window.RC = window.RC || {};
/* Centralised hint system: icon appears after 12 s idle or two failed attempts; tapping plays a short clue.
   First hint focuses attention, second gives a partial visual clue (screen supplies a function). No third level. */
RC.hint = (function () {
  var btn, key = null, cfg = null, idleTimer = 0, level = 0, armed = false, IDLE_MS = 12000;
  function init() {
    btn = document.getElementById('hint-btn');
    btn.addEventListener('click', onClick);
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function (e) { if (e.target === btn || (e.target.closest && e.target.closest('#hint-btn'))) return; activity(true); }, true);
    });
    document.addEventListener('pointermove', function () { activity(false); }, true);
  }
  function arm(k, c) { key = k; cfg = c; level = 0; armed = true; hide(); restart(); }
  function disarm() { armed = false; key = null; cfg = null; clearTimeout(idleTimer); hide(); }
  function restart() { clearTimeout(idleTimer); if (!armed) return; idleTimer = setTimeout(show, IDLE_MS); }
  function activity(hard) { if (!armed) return; if (hard) hide(); restart(); }
  function failedAttempt() {
    if (!armed) return;
    RC.state.failedAttempts[key] = (RC.state.failedAttempts[key] || 0) + 1;
    if (RC.state.failedAttempts[key] >= 2) show();
  }
  function show() { if (!armed || !cfg) return; if (RC.busy || RC.narration.isPlaying()) { clearTimeout(idleTimer); idleTimer = setTimeout(show, 2500); return; } btn.classList.add('on'); }
  function hide() { btn.classList.remove('on'); }
  function onClick() {
    if (!cfg) return;
    RC.audio.sfx('press'); hide();
    RC.state.hintsUsed[key] = (RC.state.hintsUsed[key] || 0) + 1;
    var h = level === 0 ? cfg.first : (cfg.second || cfg.first);
    level = 1;
    if (typeof h === 'function') h(); else RC.narration.play(h, { replay: false });
    restart();
  }
  return { init: init, arm: arm, disarm: disarm, failedAttempt: failedAttempt, activity: activity, restart: restart };
})();
