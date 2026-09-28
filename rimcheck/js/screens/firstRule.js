/* SCREEN 5 - Build the first (too simple) rule: IF ball seen in hoop area -> COUNT 1 POINT */
RC.router.register(5, (function () {
  var el = RC.util.el, h;
  function mount(root) {
    var T = RC.text.firstRule, S = RC.state;
    h = RC.court.setupGame({ sensor: true });
    var slot = el('div', { 'class': 'slot', tabindex: '0', 'aria-label': 'Action slot' });
    var panel = el('div', { 'class': 'panel rule-panel anim-rise' }, [
      el('div', { 'class': 'panel-title', text: T.title }),
      el('div', { 'class': 'rule-row' }, [
        el('span', { 'class': 'rule-kw', text: 'IF' }),
        el('div', { 'class': 'chip fixed wide' }, [el('i', { 'class': 'ico', style: { background: 'var(--c-orange)' } }), T.ifText]),
        el('div', { 'class': 'connector' }),
        slot
      ])
    ]);
    root.appendChild(panel);
    var action = el('div', { 'class': 'chip action', role: 'button', 'aria-label': T.action }, [el('i', { 'class': 'ico', style: { background: '#fff' } }), T.action]);
    var tray = el('div', { 'class': 'tray rule-tray anim-rise' }, [el('span', { 'class': 'tray-label', text: T.tray }), action]);
    root.appendChild(tray);

    function lockIn(withSound) {
      slot.classList.add('filled', 'locked');
      var placed = action.cloneNode(true); placed.classList.add('placed'); placed.removeAttribute('role'); placed.tabIndex = -1;
      slot.appendChild(placed);
      action.style.visibility = 'hidden';
      tray.style.opacity = '0.4';
      S.firstRuleBuilt = true;
      if (withSound) { RC.audio.sfx('lock'); RC.util.glow(slot); RC.ui.coach.pose('celebrate'); }
      RC.ui.cta.show({ label: T.cta, onClick: function () { RC.router.next(); } });
      RC.hint.disarm();
    }
    RC.input.makeDraggable(action, {
      getZones: function () { return [{ el: slot, id: 'action' }]; },
      onDrop: function () { lockIn(true); }
    });
    RC.court.coachSide('pointing');
    if (S.firstRuleBuilt) lockIn(false);
    else RC.hint.arm('firstRule', { first: 'voice_05_hint', second: function () { RC.narration.play('voice_05_hint', { replay: false }); slot.classList.remove('valid'); void slot.offsetWidth; slot.classList.add('valid'); } });

    if (RC.court.shouldAutoNarrate('voice_05_first_rule')) setTimeout(function () { RC.narration.play('voice_05_first_rule'); }, 500);
    else RC.ui.topbar.setReplay(function () { RC.narration.play('voice_05_first_rule'); });
  }
  return { mount: mount, unmount: function () { } };
})());
