/* SCREEN 6 - Test the simple rule: swish OK, bank OK, rattle-out fools it. Then the causal question. */
RC.router.register(6, (function () {
  var el = RC.util.el, h, root, rows = [], badge, idx = 0, cleanup = null;
  var SHOTS = RC.shotData.firstTestShots;
  function mount(rootEl) {
    root = rootEl; idx = 0; rows = [];
    var T = RC.text.firstTest, S = RC.state;
    h = RC.court.setupGame({ shooter: true, sensor: true });

    var consoleEl = el('div', { 'class': 'panel-dark test-console anim-rise' }, [el('div', { 'class': 'panel-title', text: T.title })]);
    var list = el('div', { 'class': 'console' });
    SHOTS.forEach(function (id, i) {
      var row = el('div', { 'class': 'console-row' }, [
        el('div', { 'class': 'num', text: String(i + 1) }),
        el('div', { 'class': 'name' }, [T.shots[id], el('small', { text: ' ' })]),
        el('div', { 'class': 'call-badge small pending', text: '?' })
      ]);
      list.appendChild(row); rows.push(row);
    });
    consoleEl.appendChild(list); root.appendChild(consoleEl);

    var callWrap = el('div', { 'class': 'machine-call' }, [el('div', { 'class': 'label', text: T.machine }), badge = el('div', { 'class': 'call-badge big pending', text: '—' })]);
    root.appendChild(callWrap);

    RC.court.coachSide('idle');

    if (S.firstTestDone) {
      rows.forEach(function (r, i) { markRow(i, i === 2); });
      badge.className = 'call-badge big point wrong'; badge.textContent = 'POINT';
      RC.ui.coach.pose('thinking');
      RC.ui.cta.show({ label: T.cta, completed: true, onClick: function () { RC.router.next(); } });
      RC.ui.topbar.setReplay(function () { RC.narration.play('voice_06_rule_fail'); });
      return;
    }
    var startCta = function () { RC.ui.cta.show({ label: idx === 0 ? RC.text.challenge.shoot : T.shoot, onClick: runShot }); };
    if (RC.court.shouldAutoNarrate('voice_06_test_intro')) RC.narration.play('voice_06_test_intro', { linger: 600 }).then(startCta);
    else startCta();
  }
  function markRow(i, fooled) {
    var id = SHOTS[i], shot = RC.shotData.shots[id], T = RC.text.firstTest, row = rows[i];
    row.classList.remove('current'); row.classList.add('done'); if (fooled) row.classList.add('fooled');
    row.querySelector('small').textContent = shot.truth === 'point' ? T.truthPoint : T.truthNo;
    var b = row.querySelector('.call-badge'); b.className = 'call-badge small point'; b.textContent = 'POINT';
    if (fooled) b.classList.add('wrong');
  }
  function runShot() {
    var T = RC.text.firstTest, id = SHOTS[idx], shot = RC.shotData.shots[id];
    RC.ui.cta.hide(); RC.ui.coach.pose('curious');
    rows.forEach(function (r, i) { r.classList.toggle('current', i === idx); });
    badge.className = 'call-badge big pending'; badge.textContent = '—';
    if (cleanup) { cleanup(); cleanup = null; }
    var isFail = shot.truth === 'no_point';
    RC.court.playShot(id, h, { onEvent: function (tag) {
      if (tag === 'hoop') { // the simple rule fires the instant the ball is seen in the hoop area
        badge.className = 'call-badge big point reveal'; badge.textContent = 'POINT'; RC.audio.sfx('lock');
        RC.scene.add(new RC.scene.Ring({ x: h.sensorSpot.x, y: h.sensorSpot.y, r0: 30, r1: 120, life: 0.5 }));
      }
      if (tag === 'floor' && isFail) { cleanup = RC.court.reactions('no', root); badge.classList.add('wrong'); RC.audio.sfx('needsFix'); }
      if (tag === 'floor' && !isFail && idx === 0) RC.audio.sfx('cheer');
    } }).then(function () {
      markRow(idx, isFail);
      if (!isFail) {
        RC.ui.coach.pose('celebrate');
        var p = idx === 1 ? RC.narration.play('voice_06_still_good', { replay: false }) : RC.util.wait(500);
        idx++;
        p.then(function () { RC.ui.cta.show({ label: T.shoot, onClick: runShot }); });
      } else {
        RC.state.firstTestDone = true;
        RC.ui.coach.pose('thinking');
        RC.narration.play('voice_06_rule_fail').then(showWhy);
      }
    });
  }
  function showWhy() {
    var T = RC.text.firstTest, S = RC.state;
    var wrap = el('div', { 'class': 'why-wrap anim-rise' });
    var whyBtn = el('button', { 'class': 'btn btn-choice', text: T.why });
    wrap.appendChild(whyBtn); root.appendChild(wrap);
    whyBtn.focus();
    whyBtn.addEventListener('click', function () {
      RC.audio.sfx('press');
      wrap.innerHTML = '';
      var good = el('button', { 'class': 'btn btn-choice', text: T.evidence.correct });
      var bad = el('button', { 'class': 'btn btn-choice', text: T.evidence.wrong });
      var ev = el('div', { 'class': 'evidence anim-pop' }, Math.random() < 0.5 ? [good, bad] : [bad, good]);
      wrap.appendChild(ev);
      RC.hint.arm('firstTestWhy', { first: 'voice_06_failure_clue', second: function () { RC.narration.play('voice_06_failure_clue', { replay: false }); RC.court.ghostShot('rattleOut', h, { speed: 1.2 }); } });
      good.addEventListener('click', function () {
        RC.audio.sfx('correct'); good.classList.add('correct'); bad.disabled = true; good.disabled = true;
        S.failureReasonSelected = 'moment'; RC.hint.disarm();
        RC.ui.coach.pose('celebrate');
        RC.narration.play('voice_06_failure_correct', { replay: false }).then(function () {
          wrap.hidden = true; // the answered question clears the bottom-centre for the CTA
          RC.ui.cta.show({ label: T.cta, onClick: function () { RC.router.next(); } });
        });
      });
      bad.addEventListener('click', function () {
        RC.audio.sfx('needsFix'); RC.util.nudge(bad); bad.classList.add('wrong'); RC.hint.failedAttempt();
        RC.narration.play('voice_06_failure_clue', { replay: false });
      });
    });
  }
  function unmount() { if (cleanup) cleanup(); cleanup = null; rows = []; }
  return { mount: mount, unmount: unmount };
})());
