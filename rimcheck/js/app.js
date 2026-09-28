window.RC = window.RC || {};
RC.layout = { scale: 1, rect: { left: 0, top: 0 } };
(function () {
  var $ = RC.util.qs;
  function layout() {
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080), shell = $('#shell');
    shell.style.transform = 'scale(' + scale + ')';
    shell.style.left = Math.round((window.innerWidth - 1920 * scale) / 2) + 'px';
    shell.style.top = Math.round((window.innerHeight - 1080 * scale) / 2) + 'px';
    RC.layout = { scale: scale, rect: shell.getBoundingClientRect() };
  }
  function parseQuery() {
    var out = {}; (location.search || '').replace(/^\?/, '').split('&').forEach(function (kv) { if (!kv) return; var p = kv.split('='); out[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
    return out;
  }
  /* Debug helper: ?screen=N jumps to one of the four authored screens. */
  RC.debug = {
    jump: function (n) {
      var s = RC.state;
      if (n >= 3) s.introDone = true;
      if (n >= 4) { s.disputeSeen = true; s.disputeChoice = 'test'; }
      RC.router.go(n);
    }
  };
  document.addEventListener('DOMContentLoaded', function () {
    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', function () { setTimeout(layout, 50); });
    RC.scene.init(); RC.ui.init(); RC.progress.init(); RC.hint.init(); RC.input.init(); RC.a11y.init();
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });
    var unlock = function () { RC.audio.unlock(); if (RC.state.currentScreen > 1) RC.audio.startBgm(); };
    document.addEventListener('pointerdown', unlock, { once: true, capture: true });
    document.addEventListener('keydown', unlock, { once: true, capture: true });
    var bar = $('#loading .bar > i'), t0 = performance.now();
    RC.assets.preload(function (p) { bar.style.width = Math.round(p * 100) + '%'; }).then(function () {
      var loading = $('#loading'), delay = Math.max(0, 500 - (performance.now() - t0));
      setTimeout(function () {
        loading.classList.add('off'); setTimeout(function () { loading.remove(); }, 450);
        var q = parseQuery(), n = parseInt(q.screen, 10);
        RC.debugFast = q.fast === '1'; // test harness: narration resolves instantly
        if (n >= 1 && n <= 4) RC.debug.jump(n); else RC.router.go(1);
        if (q.info === '1') setTimeout(function () { RC.ui.info.open(); }, 1500); // test harness: open the info panel
      }, delay);
    });
  });
})();
