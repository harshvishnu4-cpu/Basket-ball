/* SCREEN 7 - Find the shape of a score: order ABOVE -> HOOP -> BELOW */
RC.router.register(7, (function () {
  var el = RC.util.el, h, root, slots = [], cards = {}, filled = [null, null, null], checking = false;
  var ORDER = ['above', 'hoop', 'below'];
  function mount(rootEl) {
    root = rootEl; slots = []; filled = [null, null, null]; checking = false;
    var T = RC.text.sequence, S = RC.state;
    h = RC.court.setupGame({ zones: true, zonesAlpha: 1 });
    root.appendChild(el('div', { 'class': 'analysis-veil' }));
    // zone labels over the canvas zones
    ORDER.forEach(function (n) {
      var r = h.zones.rect(n);
      root.appendChild(el('div', { 'class': 'zone-label ' + n, text: T.cards[n].toUpperCase(), style: { left: (r.x + r.w / 2) + 'px', top: (r.y + r.h / 2) + 'px' } }));
    });
    root.appendChild(el('div', { 'class': 'seq-title anim-fade', text: T.title, style: { top: '150px' } }));

    var slotRow = el('div', { 'class': 'sequence-slots anim-rise' });
    for (var i = 0; i < 3; i++) {
      var s = el('div', { 'class': 'slot event-slot', tabindex: '0', 'aria-label': 'Order slot ' + (i + 1), 'data-index': String(i) }, el('span', { 'class': 'slot-num', text: String(i + 1) }));
      slots.push(s); slotRow.appendChild(s);
      if (i < 2) slotRow.appendChild(el('div', { 'class': 'arrow' }));
    }
    root.appendChild(slotRow);

    var tray = el('div', { 'class': 'tray anim-rise' });
    RC.util.shuffle(ORDER).forEach(function (n) {
      var c = el('div', { 'class': 'event-card ' + n, 'data-key': n, role: 'button', 'aria-label': T.cards[n] }, [el('i', { 'class': 'ico' }), T.cards[n].toUpperCase()]);
      cards[n] = c; tray.appendChild(c);
      RC.input.makeDraggable(c, {
        getZones: function () { return slots.map(function (s, i) { return { el: s, id: i }; }); },
        canDrag: function () { return !checking && !S.sequenceDone; },
        onDrop: function (zone) { placeCard(n, zone.id); }
      });
    });
    root.appendChild(el('div', { 'class': 'card-tray' }, tray));

    RC.court.coachSide('curious');
    if (S.sequenceDone) { ORDER.forEach(function (n, i) { placeCard(n, i, true); }); lockAll(false); }
    else RC.hint.arm('sequence', { first: 'voice_07_hint', second: function () {
      RC.narration.play('voice_07_hint', { replay: false });
      var t = performance.now() / 1000; ORDER.forEach(function (n, i) { setTimeout(function () { h.zones.pulse(n); RC.audio.sfx('progress'); }, i * 450); });
    } });
    if (RC.court.shouldAutoNarrate('voice_07_sequence')) setTimeout(function () { RC.narration.play('voice_07_sequence'); }, 500);
    else RC.ui.topbar.setReplay(function () { RC.narration.play('voice_07_sequence'); });
  }
  function placeCard(key, index, silent) {
    var slot = slots[index], card = cards[key];
    if (filled[index]) return;
    filled[index] = key;
    var placed = card.cloneNode(true); placed.classList.add('placed'); placed.classList.remove('selected'); placed.tabIndex = 0;
    slot.appendChild(placed); slot.classList.add('filled');
    card.style.visibility = 'hidden';
    if (!silent) RC.audio.sfx('lock');
    var back = function () { if (checking || RC.state.sequenceDone) return; filled[index] = null; slot.classList.remove('filled'); placed.remove(); card.style.visibility = 'visible'; RC.audio.sfx('press'); };
    placed.addEventListener('click', back);
    placed.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); back(); } });
    if (!silent && filled.every(Boolean)) check();
  }
  function check() {
    checking = true;
    var ok = filled.every(function (k, i) { return k === ORDER[i]; });
    setTimeout(function () {
      if (ok) {
        RC.state.sequenceOrder = filled.slice(); RC.state.sequenceDone = true;
        lockAll(true);
      } else {
        RC.audio.sfx('needsFix'); RC.hint.failedAttempt();
        slots.forEach(function (s) { RC.util.nudge(s); s.classList.add('bad'); });
        RC.ui.coach.pose('thinking'); RC.ui.coach.say(RC.text.sequence.wrong, { duration: 2600 });
        // tiny ghost trail of a made basket
        RC.court.ghostShot('cleanSwish', h, { speed: 1.3, onEvent: function (tag) { if (ORDER.indexOf(tag) >= 0) h.zones.pulse(tag); } }).then(function () {
          slots.forEach(function (s, i) { s.classList.remove('bad'); var p = s.querySelector('.placed'); if (p) { p.remove(); } s.classList.remove('filled'); if (filled[i]) cards[filled[i]].style.visibility = 'visible'; filled[i] = null; });
          h.ball.visible = false; checking = false; RC.ui.coach.pose('curious');
        });
      }
    }, 350);
  }
  function lockAll(animate) {
    slots.forEach(function (s) { s.classList.add('locked'); });
    var trayWrap = root.querySelector('.card-tray'); if (trayWrap) trayWrap.style.opacity = '0';
    RC.hint.disarm();
    var T = RC.text.sequence;
    var show = function () { RC.ui.cta.show({ label: T.cta, completed: true, onClick: function () { RC.router.next(); } }); checking = false; };
    if (!animate) { show(); return; }
    RC.audio.sfx('correct'); RC.ui.coach.pose('celebrate');
    slots.forEach(function (s) { RC.util.glow(s); });
    RC.court.ghostShot('cleanSwish', h, { speed: 0.9, onEvent: function (tag) { if (ORDER.indexOf(tag) >= 0) { h.zones.pulse(tag); RC.audio.sfx('progress'); } }, keepTrail: true }).then(function () {
      RC.narration.play('voice_07_sequence_correct', { replay: false }).then(show);
    });
  }
  return { mount: mount, unmount: function () { slots = []; cards = {}; } };
})());
