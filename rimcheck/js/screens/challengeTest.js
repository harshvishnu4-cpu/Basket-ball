/* SCREEN 9 - Challenge test: four shots, learner calls each one, machine applies the learner's rule. */
RC.router.register(9, (function () {
  var el = RC.util.el, h, root, rows = [], idx = 0, badge, predictWrap, verdictEl, cleanup = null;
  var SHOTS = RC.shotData.challengeShots;
  function mount(rootEl) {
    root = rootEl; idx = 0; rows = [];
    var T = RC.text.challenge, S = RC.state, rule = S.betterRule;
    h = RC.court.setupGame({ shooter: true, sensor: true });

    var consoleEl = el('div', { 'class': 'panel-dark challenge-console anim-rise' }, [el('div', { 'class': 'panel-title', text: T.title })]);
    var list = el('div', { 'class': 'console' });
    SHOTS.forEach(function (id, i) {
      var row = el('div', { 'class': 'console-row' }, [
        el('div', { 'class': 'num', text: String(i + 1) }),
        el('div', { 'class': 'name' }, [RC.text.firstTest.shots[id], el('small', { text: ' ' })]),
        el('div', { 'class': 'call-badge small pending', text: '?' })
      ]);
      list.appendChild(row); rows.push(row);
    });
    consoleEl.appendChild(list); root.appendChild(consoleEl);

    // the learner's rule, shown compactly (no code syntax)
    var strip = el('div', { 'class': 'rule-strip anim-rise' }, [el('span', { text: 'IF' })]);
    rule.forEach(function (k, i) { if (i) strip.appendChild(el('span', { 'class': 'connector', style: { width: '34px', height: '34px' } })); strip.appendChild(el('span', { 'class': 'mini-chip', text: RC.court.condLabel(k) })); });
    strip.appendChild(el('span', { text: '=' })); strip.appendChild(el('span', { 'class': 'mini-chip action', text: 'Point' }));
    root.appendChild(strip);

    root.appendChild(el('div', { 'class': 'machine-call' }, [el('div', { 'class': 'label', text: T.machine }), badge = el('div', { 'class': 'call-badge big pending', text: '—' })]));
    predictWrap = el('div', { 'class': 'predict-wrap', hidden: true }); root.appendChild(predictWrap);
    verdictEl = el('div', { 'class': 'verdict', hidden: true }); root.appendChild(verdictEl);

    RC.court.coachSide('idle');

    if (S.challengePassed) {
      rows.forEach(function (r, i) { markRow(i, RC.shotData.shots[SHOTS[i]].truth, false); });
      RC.ui.coach.pose('celebrate');
      RC.ui.cta.show({ label: T.cta, completed: true, onClick: function () { RC.router.next(); } });
      return;
    }
    var start = function () { RC.ui.cta.show({ label: T.shoot, onClick: runShot }); };
    if (RC.court.shouldAutoNarrate('voice_09_test_intro')) RC.narration.play('voice_09_test_intro', { linger: 400 }).then(start);
    else { RC.ui.topbar.setReplay(function () { RC.narration.play('voice_09_test_intro'); }); start(); }
  }
  function markRow(i, call, fooled) {
    var id = SHOTS[i], shot = RC.shotData.shots[id], T = RC.text.firstTest, row = rows[i];
    row.classList.remove('current'); row.classList.add('done'); if (fooled) row.classList.add('fooled');
    row.querySelector('small').textContent = shot.truth === 'point' ? T.truthPoint : T.truthNo;
    var b = row.querySelector('.call-badge'); b.className = 'call-badge small ' + (call === 'point' ? 'point' : 'nopoint'); b.textContent = call === 'point' ? 'POINT' : 'NO POINT';
    if (fooled) b.classList.add('wrong');
  }
  function runShot() {
    var id = SHOTS[idx];
    RC.ui.cta.hide(); verdictEl.hidden = true; predictWrap.hidden = true; RC.ui.coach.pose('curious');
    if (cleanup) { cleanup(); cleanup = null; }
    rows.forEach(function (r, i) { r.classList.toggle('current', i === idx); });
    badge.className = 'call-badge big pending'; badge.textContent = '—';
    RC.court.playShot(id, h).then(askPrediction);
  }
  function askPrediction() {
    var T = RC.text.challenge, id = SHOTS[idx], shot = RC.shotData.shots[id];
    predictWrap.innerHTML = ''; predictWrap.hidden = false; predictWrap.classList.add('anim-rise');
    var pt = el('button', { 'class': 'btn btn-call point', text: T.point }), np = el('button', { 'class': 'btn btn-call nopoint', text: T.noPoint });
    predictWrap.appendChild(el('div', { 'class': 'pill-note', text: T.predict }));
    predictWrap.appendChild(el('div', { 'class': 'row' }, [pt, np]));
    RC.hint.arm('challenge', { first: 'voice_09_watch', second: function () { RC.narration.play('voice_09_watch', { replay: false }); RC.court.ghostShot(id, h, { speed: 1.3 }); } });
    function pick(choice, btn) {
      RC.audio.sfx('press');
      if (choice !== shot.truth) { RC.util.nudge(btn); RC.audio.sfx('needsFix'); RC.hint.failedAttempt(); RC.narration.play('voice_09_watch', { replay: false }); return; }
      RC.hint.disarm();
      btn.classList.add('picked'); pt.disabled = np.disabled = true;
      setTimeout(function () { reveal(); }, 350);
    }
    pt.addEventListener('click', function () { pick('point', pt); });
    np.addEventListener('click', function () { pick('no_point', np); });
    pt.focus();
  }
  function reveal() {
    var T = RC.text.challenge, S = RC.state, id = SHOTS[idx], shot = RC.shotData.shots[id];
    var observed = RC.rules.observe(S.sensorPlacement || 'hoopSide', shot.path);
    var call = RC.rules.sequenceRuleCall(observed, S.betterRule);
    var ok = call === shot.truth;
    badge.className = 'call-badge big reveal ' + (call === 'point' ? 'point' : 'nopoint'); badge.textContent = call === 'point' ? 'POINT' : 'NO POINT';
    RC.audio.sfx(ok ? 'correct' : 'needsFix');
    predictWrap.hidden = true;
    markRow(idx, call, !ok);
    verdictEl.innerHTML = ''; verdictEl.hidden = false;
    verdictEl.appendChild(el('div', { 'class': 'pill-note anim-pop ' + (ok ? 'ok' : 'fix'), text: ok ? T.held : T.fooled }));
    S.challengeResults[idx] = { id: id, call: call, ok: ok };
    if (ok) {
      RC.ui.coach.pose('celebrate');
      idx++;
      if (idx >= SHOTS.length) {
        S.challengePassed = true; S.fooledShot = null;
        RC.audio.sfx('cheer');
        RC.narration.play('voice_09_all_good', { replay: false }).then(function () { RC.ui.cta.show({ label: T.cta, completed: true, onClick: function () { RC.router.next(); } }); });
      } else {
        RC.narration.play('voice_09_held', { replay: false, linger: 300 }).then(function () { RC.ui.cta.show({ label: T.next, onClick: runShot }); });
      }
    } else {
      badge.classList.add('wrong');
      S.fooledShot = id;
      RC.ui.coach.pose('thinking');
      RC.narration.play('voice_09_fooled', { replay: false }).then(function () {
        RC.ui.coach.say(T.checkOrder, { duration: 4000 });
        RC.ui.cta.show({ label: T.fixCta, onClick: function () { RC.router.go(8, { fooled: id }); } });
      });
    }
  }
  return { mount: mount, unmount: function () { if (cleanup) cleanup(); cleanup = null; rows = []; } };
})());
