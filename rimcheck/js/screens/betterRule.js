/* SCREEN 8 - Build the better rule: three ordered condition slots + action. Any full rule can be locked; the test exposes weakness. */
RC.router.register(8, (function () {
  var el = RC.util.el, h, root, condSlots = [], actionSlot, chips = {}, actionChip, filled = [null, null, null], actionFilled = false, locked = false;
  var CHIPS = ['above', 'hoop', 'below', 'beside', 'rim_shakes'];
  function mount(rootEl, opts) {
    root = rootEl; condSlots = []; filled = [null, null, null]; actionFilled = false; locked = false; chips = {};
    var T = RC.text.builder, S = RC.state;
    h = RC.court.setupGame({ sensor: true, zones: true, zonesVisible: false, zonesAlpha: 0 });

    var row = el('div', { 'class': 'rule-row' });
    for (var i = 0; i < 3; i++) {
      var s = el('div', { 'class': 'slot', tabindex: '0', 'aria-label': 'Moment ' + (i + 1), 'data-index': String(i) }, el('span', { 'class': 'slot-num', text: String(i + 1) }));
      condSlots.push(s); row.appendChild(s);
      if (i < 2) row.appendChild(el('div', { 'class': 'connector' }));
    }
    row.appendChild(el('div', { 'class': 'connector eq', text: '=' }));
    actionSlot = el('div', { 'class': 'slot', tabindex: '0', 'aria-label': 'Action slot' });
    row.appendChild(actionSlot);
    root.appendChild(el('div', { 'class': 'panel builder-panel anim-rise' }, [el('div', { 'class': 'panel-title', text: T.title }), row]));

    var tray = el('div', { 'class': 'tray anim-rise' }, el('span', { 'class': 'tray-label', text: T.tray }));
    RC.util.shuffle(CHIPS).forEach(function (key) {
      var c = RC.court.condChip(key); chips[key] = c; tray.appendChild(c);
      RC.input.makeDraggable(c, {
        getZones: function () { return condSlots.map(function (s, i) { return { el: s, id: i }; }); },
        canDrag: function () { return !locked; },
        onDrop: function (zone) { placeCond(key, zone.id, false); }
      });
    });
    actionChip = el('div', { 'class': 'chip action', role: 'button', 'aria-label': T.action }, [el('i', { 'class': 'ico', style: { background: '#fff' } }), T.action]);
    tray.appendChild(actionChip);
    RC.input.makeDraggable(actionChip, {
      getZones: function () { return [{ el: actionSlot, id: 'action' }]; },
      canDrag: function () { return !locked; },
      onDrop: function () { placeAction(false); }
    });
    root.appendChild(el('div', { 'class': 'chip-tray' }, tray));

    var note = el('div', { 'class': 'builder-note', hidden: true }, el('div', { 'class': 'pill-note fix anim-pop', text: T.note }));
    root.appendChild(note);

    RC.court.coachSide('pointing');

    // Restore a preserved rule (returning from the challenge test or via Back)
    var savedRule = (S.betterRule || []).slice(), savedAction = !!S.betterRuleAction;
    if (savedAction) placeAction(true);
    savedRule.forEach(function (k, i) { if (CHIPS.indexOf(k) >= 0) placeCond(k, i, true); });
    S.betterRuleLocked = false;

    var fooled = opts && opts.fooled || (S.fooledShot && !S.challengePassed ? S.fooledShot : null);
    if (fooled && opts && opts.fooled) {
      note.hidden = false;
      RC.ui.coach.pose('thinking');
      h.zones.visible = true; h.zones.alpha = 0.8;
      var shot = RC.shotData.shots[fooled];
      setTimeout(function () {
        RC.narration.play('voice_08_return', { replay: false });
        RC.court.ghostShot(fooled, h, { speed: 0.85, keepTrail: true, onEvent: function (tag) { if (['above', 'hoop', 'below'].indexOf(tag) >= 0) h.zones.pulse(tag); } });
      }, 400);
      RC.ui.topbar.setReplay(function () { RC.narration.play('voice_08_return', { replay: false }); RC.court.ghostShot(fooled, h, { speed: 0.85, keepTrail: true }); });
    } else if (RC.court.shouldAutoNarrate('voice_08_better_rule')) setTimeout(function () { RC.narration.play('voice_08_better_rule'); }, 500);
    else RC.ui.topbar.setReplay(function () { RC.narration.play('voice_08_better_rule'); });

    RC.hint.arm('betterRule', { first: 'voice_08_hint', second: function () {
      RC.narration.play('voice_08_hint', { replay: false });
      h.zones.visible = true; RC.util.tween({ duration: 300, onUpdate: function (k) { h.zones.alpha = Math.max(h.zones.alpha, k * 0.8); } });
      RC.court.ghostShot('cleanSwish', h, { speed: 1.0, onEvent: function (tag) { if (['above', 'hoop', 'below'].indexOf(tag) >= 0) h.zones.pulse(tag); } });
    } });
    updateCta();
  }
  function placeCond(key, index, silent) {
    var slot = condSlots[index], chip = chips[key];
    if (!chip || filled[index]) return;
    filled[index] = key;
    var placed = chip.cloneNode(true); placed.classList.add('placed'); placed.classList.remove('selected'); placed.tabIndex = 0;
    slot.appendChild(placed); slot.classList.add('filled');
    chip.style.visibility = 'hidden';
    if (!silent) RC.audio.sfx('lock');
    var back = function () { if (locked) return; filled[index] = null; slot.classList.remove('filled'); placed.remove(); chip.style.visibility = 'visible'; RC.audio.sfx('press'); sync(); };
    placed.addEventListener('click', back);
    placed.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); back(); } });
    sync();
  }
  function placeAction(silent) {
    if (actionFilled) return;
    actionFilled = true;
    var placed = actionChip.cloneNode(true); placed.classList.add('placed'); placed.classList.remove('selected'); placed.tabIndex = 0;
    actionSlot.appendChild(placed); actionSlot.classList.add('filled');
    actionChip.style.visibility = 'hidden';
    if (!silent) RC.audio.sfx('lock');
    var back = function () { if (locked) return; actionFilled = false; actionSlot.classList.remove('filled'); placed.remove(); actionChip.style.visibility = 'visible'; RC.audio.sfx('press'); sync(); };
    placed.addEventListener('click', back);
    placed.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); back(); } });
    sync();
  }
  function sync() {
    RC.state.betterRule = filled.filter(Boolean);
    RC.state.betterRuleAction = actionFilled;
    updateCta();
  }
  function updateCta() {
    var ready = filled.every(Boolean) && actionFilled;
    if (ready) RC.ui.cta.show({ label: RC.text.builder.cta, onClick: lock });
    else RC.ui.cta.hide();
  }
  function lock() {
    if (locked) return;
    locked = true; RC.hint.disarm();
    RC.state.betterRule = filled.slice(); RC.state.betterRuleLocked = true; RC.state.fooledShot = null;
    condSlots.concat([actionSlot]).forEach(function (s) { s.classList.add('locked'); RC.util.glow(s); });
    RC.audio.sfx('lock'); RC.ui.coach.pose('celebrate');
    RC.ui.cta.show({ label: RC.text.builder.cta, completed: true, enabled: false });
    RC.narration.play('voice_08_locked', { replay: false, linger: 300 }).then(function () { RC.router.next(); });
  }
  return { mount: mount, unmount: function () { condSlots = []; chips = {}; } };
})());
