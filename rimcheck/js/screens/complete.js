/* SCREEN 11 - Completion: recap, badge, one learning sentence, replay. No title reuse. */
RC.router.register(11, (function () {
  var el = RC.util.el;
  function mount(root) {
    var T = RC.text.complete;
    RC.scene.setBackground('bg_complete');
    RC.ui.coach.show('celebrate', { left: 60, bottom: 40, height: 780 });

    var items = [
      el('div', { 'class': 'recap-item' }, [el('div', { 'class': 'art' }, el('img', { src: RC.assets.url('sensor'), alt: '' })), el('div', { 'class': 'cap', text: T.recap[0] })]),
      el('div', { 'class': 'recap-item' }, [el('div', { 'class': 'art' }, [el('i', { 'class': 'dot', style: { background: '#4a8df0' } }), el('span', { 'class': 'ev-arrow' }), el('i', { 'class': 'dot', style: { background: 'var(--c-orange)' } }), el('span', { 'class': 'ev-arrow' }), el('i', { 'class': 'dot', style: { background: 'var(--c-teal)' } })]), el('div', { 'class': 'cap', text: T.recap[1] })]),
      el('div', { 'class': 'recap-item' }, [el('div', { 'class': 'art' }, el('div', { 'class': 'call-badge point small', text: 'POINT' })), el('div', { 'class': 'cap', text: T.recap[2] })])
    ];
    var arrows = [el('div', { 'class': 'arrow' }), el('div', { 'class': 'arrow' })];
    var recap = el('div', { 'class': 'recap' }, [items[0], arrows[0], items[1], arrows[1], items[2]]);
    var badge = el('div', { 'class': 'badge' }, [el('div', { 'class': 'glow' }), el('small', { text: T.badgeSmall }), T.badge]);
    var replay = el('button', { 'class': 'btn btn-primary', text: T.replay, onClick: function () { RC.audio.sfx('press'); RC.resetState(); RC.router.go(1); } });
    var exit = el('button', { 'class': 'btn btn-secondary', text: T.exit, onClick: function () { RC.audio.sfx('press'); try { window.close(); } catch (e) { } setTimeout(function () { RC.resetState(); RC.router.go(1); }, 300); } });
    var panel = el('div', { 'class': 'complete-panel anim-rise' }, [badge, recap, el('div', { 'class': 'learning-line', text: T.line }), el('div', { 'class': 'complete-actions' }, [replay, exit])]);
    root.appendChild(panel);

    RC.audio.sfx('complete');
    items.forEach(function (it, i) { setTimeout(function () { it.classList.add('on'); if (i > 0) arrows[i - 1].classList.add('on'); RC.audio.sfx('progress'); }, 900 + i * 550); });
    setTimeout(function () { RC.narration.play('voice_11_complete'); }, 1200);
    setTimeout(function () { replay.focus(); }, 2600);
  }
  return { mount: mount, unmount: function () { } };
})());
