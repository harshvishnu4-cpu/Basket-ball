window.RC = window.RC || {};
RC.a11y = (function () {
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var live;
  function init() {
    live = RC.util.el('div', { 'aria-live': 'polite', 'aria-atomic': 'true', 'class': 'sr-live', style: { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', left: '-9999px' } });
    document.body.appendChild(live);
    // Keyboard: Escape acts as Back when Back is available
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { var b = document.getElementById('btn-back'); if (b && !b.disabled && !b.closest('[hidden]')) b.click(); }
    });
  }
  function announce(text) { if (!live) return; live.textContent = ''; setTimeout(function () { live.textContent = text; }, 30); }
  return { init: init, announce: announce, get reducedMotion() { return !!(mq && mq.matches); } };
})();
