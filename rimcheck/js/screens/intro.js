/* SCREEN 2 - Supplied reference composition with independently animated answer controls. */
RC.router.register(2, (function () {
  var el = RC.util.el;

  function mount(root) {
    var T = RC.text.intro;
    RC.scene.setBackground('bg_second');

    var yes = answerButton('yes', RC.assets.url('screen2_yes'), 'Yes, a sensor could tell');
    var no = answerButton('no', RC.assets.url('screen2_no'), 'No, a sensor could not tell');
    root.appendChild(yes);
    root.appendChild(no);

    function answerButton(kind, source, label) {
      return el('button', {
        'class': 'reference-answer ' + kind,
        'aria-label': label,
        onClick: function () { choose(kind, kind === 'yes' ? yes : no); }
      }, el('img', { src: source, alt: '' }));
    }

    function choose(value, button) {
      if (RC.busy) return;
      RC.busy = true;
      RC.state.disputeChoice = value;
      RC.state.introDone = true;
      yes.disabled = true;
      no.disabled = true;
      button.classList.add('picked');
      RC.audio.sfx('press');
      setTimeout(function () {
        RC.busy = false;
        RC.router.next();
      }, 420);
    }

    if (RC.court.shouldAutoNarrate('voice_02_intro')) {
      setTimeout(function () { RC.narration.play('voice_02_intro', { bubble: false, linger: 0 }); }, 350);
    }
  }

  return { mount: mount, unmount: function () { } };
})());
