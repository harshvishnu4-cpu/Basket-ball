/* SCREEN 4 - Reference-matched, layered sensor-placement screen. */
RC.router.register(4, (function () {
  var el = RC.util.el;
  var root, sensorEl, sensorSlotEl, instructionEl, resultEl, trayEl, dragArrowEl, ballEl, logicEl, testing = false, dragControl;
  var zones = {};
  // markX/markY: centre of each drop mark (matches .fourth-zone in screens.css); the sensor mounts centred on it.
  var SPOTS = {
    backboard: { label: 'Backboard', markX: 1535, markY: 217 },
    farPole: { label: 'Far support', markX: 1582, markY: 338 },
    hoopSide: { label: 'Beside net', markX: 1535, markY: 500 }
  };
  var MOUNTED_W = 112, MOUNTED_H = 88;

  function mount(rootEl) {
    root = rootEl;
    testing = false;
    zones = {};
    RC.scene.setBackground('bg_fourth');
    document.getElementById('shell').classList.add('fourth-reference-active');

    root.appendChild(el('img', {
      'class': 'fourth-coach anim-fade',
      src: RC.assets.url('coach_riya_thinking_reference'),
      alt: 'Coach Riya considering where to place the sensor'
    }));

    ballEl = el('img', {
      'class': 'fourth-test-ball',
      src: RC.assets.url('ball'),
      alt: 'The disputed basketball dipping into the rim and bouncing out',
      hidden: true
    });
    root.appendChild(ballEl);

    addCallout('backboard');
    addCallout('farPole');
    addCallout('hoopSide');

    sensorSlotEl = el('div', { 'class': 'fourth-sensor-slot' });
    sensorEl = el('div', {
      'class': 'sensor-item fourth-sensor',
      role: 'button',
      tabindex: '0',
      'aria-label': 'Drag the sensor to a spot'
    }, el('img', { src: RC.assets.url('sensor_fourth'), alt: '' }));
    sensorSlotEl.appendChild(sensorEl);

    instructionEl = el('div', { 'class': 'fourth-instruction', text: 'DRAG IT TO A SPOT' });
    resultEl = el('div', { 'class': 'fourth-result', hidden: true });
    dragArrowEl = el('div', { 'class': 'fourth-drag-arrow', 'aria-hidden': 'true' });
    trayEl = el('div', { 'class': 'fourth-tray anim-rise' }, [
      sensorSlotEl,
      instructionEl,
      resultEl,
      dragArrowEl
    ]);
    root.appendChild(trayEl);

    dragControl = RC.input.makeDraggable(sensorEl, {
      getZones: function () {
        return Object.keys(zones).map(function (key) { return { el: zones[key], id: key }; });
      },
      canDrag: function () { return !testing; },
      // light up every drop mark while the sensor is in hand
      onPick: function () { root.classList.add('fourth-dragging'); },
      onEnd: function () { root.classList.remove('fourth-dragging'); },
      allowFilled: true,
      accepts: function (zone) { return zone.id !== RC.state.sensorPlacement; },
      onDrop: function (zone) { place(zone.id, true); }
    });

    if (RC.state.sensorPlacement) place(RC.state.sensorPlacement, false);
    else RC.ui.cta.hide();

    if (RC.court.shouldAutoNarrate('voice_04_sensor_instruction')) {
      setTimeout(function () { RC.narration.play('voice_04_sensor_instruction', { bubble: false }); }, 500);
    }
  }

  function addCallout(key) {
    var spot = SPOTS[key];
    var wrap = el('div', { 'class': 'fourth-callout ' + key, 'aria-hidden': 'true' }, [
      el('span', { 'class': 'fourth-leader' }),
      el('span', { 'class': 'fourth-callout-label', text: spot.label })
    ]);
    var zone = el('div', {
      'class': 'zone-target fourth-zone ' + key,
      'data-key': key,
      tabindex: '0',
      'aria-label': 'Place sensor: ' + spot.label
    });
    root.appendChild(wrap);
    root.appendChild(zone);
    zones[key] = zone;
  }

  function place(key, withSound) {
    var spot = SPOTS[key];
    RC.state.sensorPlacement = key;
    Object.keys(zones).forEach(function (zoneKey) {
      zones[zoneKey].classList.toggle('occupied', zoneKey === key);
    });

    sensorEl.classList.remove('selected');
    sensorEl.classList.add('fourth-mounted');
    sensorEl.style.position = 'absolute';
    sensorEl.style.left = (spot.markX - MOUNTED_W / 2) + 'px';
    sensorEl.style.top = (spot.markY - MOUNTED_H / 2) + 'px';
    sensorEl.style.width = MOUNTED_W + 'px';
    sensorEl.style.height = MOUNTED_H + 'px';
    sensorEl.querySelector('img').src = RC.assets.url('sensor_fourth');
    root.appendChild(sensorEl);

    instructionEl.textContent = spot.label + ' selected';
    instructionEl.hidden = false;
    resultEl.hidden = true;
    sensorSlotEl.hidden = false;
    if (logicEl) { logicEl.remove(); logicEl = null; }
    trayEl.classList.remove('rule-learned');
    dragArrowEl.hidden = true;
    ballEl.hidden = true;
    ballEl.classList.remove('drop', 'rattle');
    if (withSound) {
      RC.audio.sfx('lock');
      RC.util.glow(sensorEl);
    }
    RC.ui.cta.show({ label: RC.text.sensor.cta, onClick: runTest });
  }

  function runTest() {
    if (testing || !RC.state.sensorPlacement) return;
    var key = RC.state.sensorPlacement;
    var outcome = RC.rules.evaluatePlacement(key);
    testing = true;
    RC.ui.cta.hide();
    sensorEl.classList.add('scanning');
    RC.audio.sfx('scan');
    if (outcome.success) {
      ballEl.hidden = false;
      ballEl.classList.remove('drop', 'rattle');
      void ballEl.offsetWidth;
      ballEl.classList.add('rattle');
    }

    setTimeout(function () {
      var good = outcome.success;
      RC.state.sensorPlacementTests[key] = true;
      testing = false;
      sensorEl.classList.remove('scanning');
      zones[key].classList.add('tested');
      if (!good) zones[key].classList.add('bad');
      resultEl.hidden = false;
      resultEl.textContent = good ? '' : (key === 'backboard' ? RC.text.sensor.backboard : RC.text.sensor.far);
      resultEl.className = 'fourth-result ' + (good ? 'ok' : 'fix');
      instructionEl.textContent = good ? RC.text.sensor.logicTitle : 'TRY ANOTHER SPOT';
      RC.audio.sfx(good ? 'correct' : 'needsFix');

      if (good) {
        var rattle = RC.rules.inspectShot(key, 'rattleOut');
        var made = RC.rules.inspectShot(key, 'madeBasket');
        RC.state.learnedTwoClueRule = rattle.call === 'no_point' && RC.rules.basketCounts(key, made);
        sensorSlotEl.hidden = true;
        instructionEl.hidden = true;
        resultEl.hidden = true;
        logicEl = buildLogicBoard(rattle, made);
        trayEl.appendChild(logicEl);
        trayEl.classList.add('rule-learned');
        RC.ui.cta.show({
          label: RC.text.sensor.ctaDone,
          completed: true,
          onClick: function () { RC.resetState(); RC.router.go(1, { push: true }); }
        });
      } else {
        RC.ui.cta.show({ label: 'Try Another Spot', onClick: function () {
          resultEl.hidden = true;
          instructionEl.textContent = 'DRAG IT TO A SPOT';
          dragArrowEl.hidden = false;
          RC.ui.cta.hide();
          if (dragControl) dragControl.select();
        } });
      }
      RC.narration.play(good ? 'voice_04_sensor_good' : (key === 'backboard' ? 'voice_04_sensor_backboard' : 'voice_04_sensor_far'), { bubble: false, replay: false });
    }, RC.a11y.reducedMotion ? 20 : 850);
  }

  function buildLogicBoard(rattle, made) {
    var T = RC.text.sensor;
    return el('div', { 'class': 'fourth-logic anim-pop', role: 'group', 'aria-label': T.logicTitle }, [
      el('div', { 'class': 'fourth-logic-title', text: T.logicTitle }),
      el('div', { 'class': 'fourth-logic-head' }, [
        el('span', { text: 'SHOT' }),
        el('span', { text: T.clueInside }),
        el('span', { text: T.clueExit }),
        el('span', { text: 'CALL' })
      ]),
      logicRow(T.rattleLabel, rattle, T.noPoint),
      logicRow(T.madeLabel, made, T.point),
      el('div', { 'class': 'fourth-rule-line', text: T.ruleLine })
    ]);
  }

  function logicRow(label, evidence, call) {
    return el('div', { 'class': 'fourth-logic-row' }, [
      el('strong', { text: label }),
      clue(evidence.insideRim),
      clue(evidence.exitsUnderNet),
      el('b', { 'class': 'fourth-logic-call ' + (evidence.call === 'point' ? 'point' : 'no-point'), text: call })
    ]);
  }

  function clue(value) {
    return el('span', { 'class': 'fourth-clue ' + (value ? 'yes' : 'no'), text: value ? 'YES ✓' : 'NO ✕' });
  }

  function unmount() {
    testing = false;
    zones = {};
    sensorEl = null;
    sensorSlotEl = trayEl = dragArrowEl = ballEl = logicEl = null;
    document.getElementById('shell').classList.remove('fourth-reference-active');
  }

  return { mount: mount, unmount: unmount };
})());
