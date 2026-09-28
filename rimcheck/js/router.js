window.RC = window.RC || {};
/* Central router. Every screen module exposes mount(el, opts) and unmount(). */
RC.router = (function () {
  var screens = {}, current = null, currentId = 0, root, transitioning = false;
  var SECTION = { 2: 'courtTrouble', 3: 'courtTrouble', 4: 'sensorTest' };
  var PIP = { 2: 1, 3: 2, 4: 3 };
  function register(id, mod) { screens[id] = mod; }
  function go(id, opts) {
    opts = opts || {};
    if (transitioning || !screens[id]) return;
    transitioning = true;
    root = root || document.getElementById('screen-root');
    var veil = document.getElementById('transition-veil'), bg = document.getElementById('bg-layer');
    if (opts.push) bg.classList.add('push');
    veil.classList.add('on');
    setTimeout(function () {
      if (current && current.unmount) { try { current.unmount(); } catch (e) { console.error(e); } }
      RC.narration.stop(); RC.hint.disarm(); RC.input.clearSelection(); RC.scene.clear();
      RC.ui.cta.hide(); RC.ui.coach.hide(); RC.ui.topbar.setReplay(null); RC.busy = false;
      if (id === 1) RC.ui.topbar.resetClock();
      root.innerHTML = ''; bg.classList.remove('push');
      RC.util.qsa('.ghost', document.getElementById('shell')).forEach(function (g) { g.remove(); });
      currentId = id; RC.state.currentScreen = id; current = screens[id];
      if (id <= 4) { RC.ui.topbar.hide(); RC.progress.show(false); }
      else { RC.ui.topbar.show(RC.text.sections[SECTION[id]]); RC.progress.show(true); RC.progress.set(PIP[id], { celebrate: !!opts.celebrate }); }
      RC.ui.topbar.setBackEnabled(id > 1);
      var screenEl = RC.util.el('div', { 'class': 'screen', id: 'screen-' + id });
      root.appendChild(screenEl);
      try { current.mount(screenEl, opts); } catch (e) { console.error(e); }
      requestAnimationFrame(function () { veil.classList.remove('on'); setTimeout(function () { transitioning = false; }, 280); });
    }, opts.push ? 620 : 270);
  }
  function back() {
    if (RC.busy || transitioning || currentId <= 1) return;
    RC.audio.sfx('press');
    go(currentId - 1, { back: true });
  }
  function next(opts) { go(currentId + 1, Object.assign({ celebrate: true }, opts || {})); }
  function currentScreen() { return currentId; }
  return { register: register, go: go, back: back, next: next, current: currentScreen, PIP: PIP };
})();
