/* SCREEN 10 - Two hoops, no referee. Independent sensor + rule setup per hoop, evaluated separately. */
RC.router.register(10, (function () {
  var el = RC.util.el, root, hoops = {}, tray, running = false;
  var CHIPS = ['above', 'hoop', 'below', 'beside', 'rim_shakes'];
  var HOOP_KEYS = ['hoop1', 'hoop2'];

  function mount(rootEl) {
    root = rootEl; running = false; hoops = {};
    var T = RC.text.transfer, S = RC.state;
    RC.scene.setBackground('bg_two');

    HOOP_KEYS.forEach(function (hk, i) {
      var geo = RC.shotData.hoops[i === 0 ? 'left' : 'right'], st = S.transfer[hk];
      var H = { key: hk, geo: geo, ball: RC.scene.add(new RC.scene.Ball(geo)), spots: {}, slots: [], filled: [null, null, null], sensorEl: null, panel: null, status: null, callEl: null, zones: RC.scene.add(new RC.scene.Zones(geo, { alpha: 0, visible: false })) };
      hoops[hk] = H;
      root.appendChild(el('div', { 'class': 'hoop-tag', text: T[hk], style: { left: (i === 0 ? geo.rimX : geo.rimX - 90) + 'px', top: (geo.rimY + 105) + 'px' } }));
      // sensor spots
      Object.keys(RC.shotData.transferSpots[hk]).forEach(function (sk) {
        var p = RC.shotData.transferSpots[hk][sk];
        var z = el('div', { 'class': 'zone-target mini', tabindex: '0', 'aria-label': T[hk] + ' sensor spot', style: { left: p.x + 'px', top: p.y + 'px' } });
        root.appendChild(z); H.spots[sk] = { el: z, id: sk, hoop: hk, x: p.x, y: p.y, mountX: p.mountX, mountY: p.mountY, sensorView: p.sensorView };
      });
      // rule panel
      var row = el('div', { 'class': 'rule-row' });
      for (var k = 0; k < 3; k++) {
        var s = el('div', { 'class': 'slot small', tabindex: '0', 'aria-label': T[hk] + ' moment ' + (k + 1) }, el('span', { 'class': 'slot-num', text: String(k + 1) }));
        H.slots.push(s); row.appendChild(s);
      }
      H.status = el('div', { 'class': 'status' });
      H.panel = el('div', { 'class': 'panel' }, [el('div', { 'class': 'panel-title' }, [el('span', { text: T[hk] + ' ' + T.rule }), el('span', { 'class': 'eq', text: '= Point' })]), row, H.status]);
      var wrap = el('div', { 'class': 'hoop-setup anim-rise ' + (i === 0 ? 'left' : 'right') }, H.panel);
      root.appendChild(wrap); H.wrap = wrap;
      // machine call sits as a tab on the top edge of that hoop's rule panel
      H.callEl = el('div', { 'class': 'call-badge pending transfer-call ' + hk, text: '—' });
      root.appendChild(H.callEl);
      // restore
      if (st.rule && st.rule.length) st.rule.forEach(function (c, j) { placeChip(H, c, j, true); });
      if (st.sensor) placeSensor(H, st.sensor, true);
      if (st.done) markDone(H, true);
      else if (st.frozen) freeze(H, st.result, true);
    });

    // shared tray: two sensors + reusable chips
    tray = el('div', { 'class': 'tray transfer-tray anim-rise' });
    HOOP_KEYS.forEach(function (hk) {
      var sEl = el('div', { 'class': 'sensor-item mini', role: 'button', 'aria-label': T.sensor, tabindex: '0' }, el('img', { src: RC.assets.url('sensor'), alt: '' }));
      tray.appendChild(sEl);
      RC.input.makeDraggable(sEl, {
        getZones: allSpots, canDrag: function () { return !running; },
        accepts: function (zone) { var H = hoops[zone.hoop]; return !H.locked && (H.sensorKey !== zone.id); },
        onDrop: function (zone) { placeSensor(hoops[zone.hoop], zone.id, false); }
      });
    });
    CHIPS.forEach(function (key) {
      var c = RC.court.condChip(key); tray.appendChild(c);
      RC.input.makeDraggable(c, {
        getZones: allSlots, canDrag: function () { return !running; },
        accepts: function (zone) { return !hoops[zone.hoop].locked; },
        onDrop: function (zone) { placeChip(hoops[zone.hoop], key, zone.index, false); }
      });
    });
    root.appendChild(tray);
    syncTraySensors();

    RC.ui.coach.show('idle', { left: 840, bottom: 250, height: 300 });
    var callsShown = HOOP_KEYS.some(function (hk) { return S.transfer[hk].result; });
    if (callsShown) HOOP_KEYS.forEach(function (hk) { showCall(hoops[hk], S.transfer[hk].result, S.transfer[hk].done); });

    if (S.transferDone) { RC.ui.cta.show({ label: T.ctaDone, completed: true, onClick: function () { RC.router.next(); } }); RC.ui.coach.pose('celebrate'); }
    else {
      if (RC.court.shouldAutoNarrate('voice_10_transfer')) setTimeout(function () { RC.narration.play('voice_10_transfer'); }, 500);
      else RC.ui.topbar.setReplay(function () { RC.narration.play('voice_10_transfer'); });
      RC.hint.arm('transfer', { first: 'voice_10_hint', second: function () {
        RC.narration.play('voice_10_hint', { replay: false });
        HOOP_KEYS.forEach(function (hk) { var H = hoops[hk]; if (!S.transfer[hk].done) { H.zones.visible = true; RC.util.tween({ duration: 400, onUpdate: function (k) { H.zones.alpha = k * 0.8; } }); RC.court.ghostShot('cleanSwish', H, { speed: 1.1, onEvent: function (tag) { if (['above', 'hoop', 'below'].indexOf(tag) >= 0) H.zones.pulse(tag); } }); } });
      } });
      updateCta();
    }
  }
  function allSpots() { var out = []; HOOP_KEYS.forEach(function (hk) { Object.keys(hoops[hk].spots).forEach(function (sk) { out.push(hoops[hk].spots[sk]); }); }); return out; }
  function allSlots() { var out = []; HOOP_KEYS.forEach(function (hk) { hoops[hk].slots.forEach(function (s, i) { out.push({ el: s, id: hk + i, hoop: hk, index: i }); }); }); return out; }
  function syncTraySensors() {
    // a hoop that already has a sensor consumes one tray sensor
    var items = RC.util.qsa('.sensor-item', tray), used = HOOP_KEYS.filter(function (hk) { return !!RC.state.transfer[hk].sensor; }).length;
    items.forEach(function (it, i) { it.style.visibility = i < items.length - used ? 'visible' : 'hidden'; });
  }
  function placeSensor(H, key, silent) {
    var st = RC.state.transfer[H.key];
    Object.keys(H.spots).forEach(function (sk) { H.spots[sk].el.classList.toggle('occupied', sk === key); });
    st.sensor = key; H.sensorKey = key;
    if (!H.sensorEl) {
      H.sensorEl = el('div', { 'class': 'sensor-item mini mounted', role: 'button', 'aria-label': RC.text.transfer.sensor, tabindex: '0', style: { position: 'absolute', width: '120px', height: '120px' } }, el('img', { src: RC.assets.url('sensor'), alt: '' }));
      root.appendChild(H.sensorEl);
      RC.input.makeDraggable(H.sensorEl, {
        getZones: function () { return Object.keys(H.spots).map(function (sk) { return H.spots[sk]; }); },
        canDrag: function () { return !running && !H.locked; },
        accepts: function (zone) { return zone.id !== H.sensorKey; },
        onDrop: function (zone) { placeSensor(H, zone.id, false); }
      });
    }
    var p = H.spots[key];
    if (H.sensorMount) RC.scene.remove(H.sensorMount);
    H.sensorMount = RC.scene.add(new RC.scene.SensorMount(p, 120));
    H.sensorEl.style.left = (p.x - 60) + 'px'; H.sensorEl.style.top = (p.y - 60) + 'px';
    H.sensorEl.querySelector('img').src = RC.assets.url(p.sensorView || 'sensor_front');
    if (!silent) { RC.audio.sfx('lock'); RC.scene.add(new RC.scene.Ring({ x: p.x, y: p.y, r0: 30, r1: 100 })); }
    syncTraySensors(); clearFrozen(H); updateCta();
  }
  function placeChip(H, key, index, silent) {
    var slot = H.slots[index], st = RC.state.transfer[H.key];
    if (H.filled[index]) { var old = slot.querySelector('.placed'); if (old) old.remove(); }
    H.filled[index] = key;
    var placed = RC.court.condChip(key, 'placed'); placed.tabIndex = 0;
    slot.appendChild(placed); slot.classList.add('filled');
    if (!silent) RC.audio.sfx('lock');
    var back = function () { if (running || H.locked) return; H.filled[index] = null; slot.classList.remove('filled'); placed.remove(); RC.audio.sfx('press'); st.rule = H.filled.filter(Boolean); clearFrozen(H); updateCta(); };
    placed.addEventListener('click', back);
    placed.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); back(); } });
    st.rule = H.filled.slice();
    clearFrozen(H); updateCta();
  }
  function ready(H) { return !!RC.state.transfer[H.key].sensor && H.filled.every(Boolean); }
  function updateCta() {
    var T = RC.text.transfer, S = RC.state;
    if (S.transferDone) return;
    var pending = HOOP_KEYS.filter(function (hk) { return !S.transfer[hk].done; });
    var allReady = pending.every(function (hk) { return ready(hoops[hk]); }) && pending.length > 0;
    if (allReady) RC.ui.cta.show({ label: T.cta, onClick: run }); else RC.ui.cta.hide();
  }
  function showCall(H, result, ok) {
    var T = RC.text.transfer;
    H.callEl.style.opacity = '1';
    H.callEl.className = 'call-badge reveal transfer-call ' + H.key + ' ' + (result === 'point' ? 'point' : result === 'no_point' ? 'nopoint' : 'lost') + (ok ? '' : ' wrong');
    H.callEl.textContent = result === 'point' ? 'POINT' : result === 'no_point' ? 'NO POINT' : T.lost.toUpperCase();
  }
  function freeze(H, result, silent) {
    var T = RC.text.transfer, st = RC.state.transfer[H.key];
    st.frozen = true; H.wrap.classList.add('frozen');
    H.status.innerHTML = '';
    var obs = RC.rules.observe(st.sensor, RC.shotData.shots[RC.shotData.transferShots[H.key]].path);
    var stream = el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' } });
    obs.forEach(function (e, i) { if (i) stream.appendChild(el('span', { 'class': 'ev-arrow' })); stream.appendChild(RC.court.eventChip(e, true)); });
    if (!obs.length) stream.appendChild(el('span', { 'class': 'ev-chip small', text: T.lost }));
    H.status.appendChild(el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [el('div', { 'class': 'pill-note fix', text: result === 'lost' ? T.lost : T.frozen, style: { fontSize: '22px' } }), stream]));
    if (!silent) RC.audio.sfx('needsFix');
  }
  function clearFrozen(H) {
    var st = RC.state.transfer[H.key];
    if (!st.frozen) return;
    st.frozen = false; st.result = null; H.wrap.classList.remove('frozen'); H.status.innerHTML = ''; H.callEl.style.opacity = '0';
  }
  function markDone(H, silent) {
    var st = RC.state.transfer[H.key]; st.done = true; st.frozen = false; H.locked = true;
    H.wrap.classList.remove('frozen'); H.wrap.classList.add('done');
    H.status.innerHTML = ''; H.status.appendChild(el('div', { 'class': 'pill-note ok', text: RC.text.transfer.ok, style: { fontSize: '22px' } }));
    if (H.sensorEl) H.sensorEl.style.pointerEvents = 'none';
    if (!silent) RC.audio.sfx('correct');
  }
  function run() {
    if (running) return;
    running = true; RC.court.setBusy(true); RC.ui.cta.hide(); RC.input.clearSelection(); RC.hint.disarm();
    var S = RC.state, T = RC.text.transfer;
    var todo = HOOP_KEYS.filter(function (hk) { return !S.transfer[hk].done; });
    todo.forEach(function (hk) { hoops[hk].callEl.style.opacity = '0'; });
    RC.ui.coach.pose('curious');
    var results = {};
    var seq = Promise.resolve();
    todo.forEach(function (hk) {
      seq = seq.then(function () {
        var H = hoops[hk], shotId = RC.shotData.transferShots[hk], shot = RC.shotData.shots[shotId], st = S.transfer[hk];
        H.ball.showTrail = false; H.ball.ghost = false;
        return RC.shots.play({ shot: shotId, hoop: H.geo, ball: H.ball, windup: 0.3 }).then(function () {
          var call = RC.rules.machineCall(st.sensor, st.rule, shot.path);
          st.result = call;
          var ok = call === shot.truth; results[hk] = ok;
          showCall(H, call, ok);
          RC.audio.sfx(ok ? 'lock' : 'needsFix');
          return RC.util.wait(700);
        });
      });
    });
    seq.then(function () {
      running = false; RC.court.setBusy(false);
      var allOk = todo.every(function (hk) { return results[hk]; });
      todo.forEach(function (hk) { if (results[hk]) markDone(hoops[hk], false); else freeze(hoops[hk], S.transfer[hk].result, false); });
      if (allOk) {
        S.transferDone = true; RC.audio.sfx('cheer'); RC.ui.coach.pose('celebrate');
        RC.narration.play('voice_10_success', { replay: false }).then(function () { RC.ui.cta.show({ label: T.ctaDone, completed: true, onClick: function () { RC.router.next(); } }); });
      } else {
        RC.ui.coach.pose('thinking'); RC.hint.failedAttempt();
        RC.narration.play('voice_10_repair', { replay: false }).then(function () {
          RC.hint.arm('transfer', { first: 'voice_10_hint', second: function () { RC.narration.play('voice_10_hint', { replay: false }); todo.forEach(function (hk) { var H = hoops[hk]; if (!S.transfer[hk].done) { H.zones.visible = true; RC.util.tween({ duration: 400, onUpdate: function (k) { H.zones.alpha = k * 0.8; } }); RC.court.ghostShot('cleanSwish', H, { speed: 1.1, onEvent: function (tag) { if (['above', 'hoop', 'below'].indexOf(tag) >= 0) H.zones.pulse(tag); } }); } }); } });
          updateCta();
        });
      }
    });
  }
  return { mount: mount, unmount: function () { hoops = {}; running = false; } };
})());
