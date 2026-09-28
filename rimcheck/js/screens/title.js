/* SCREEN 1 - The supplied first-screen artwork is used intact as the background. */
RC.router.register(1, (function () {
  var el = RC.util.el;
  function mount(root) {
    RC.scene.setBackground('bg_title');
    var start = el('button', { 'class': 'title-reference-start', 'aria-label': RC.text.title.start, onClick: function () {
      RC.audio.unlock(); RC.audio.startBgm(); RC.audio.sfx('press');
      start.disabled = true;
      RC.router.go(2, { push: true });
    } });
    root.appendChild(start);
  }
  return { mount: mount, unmount: function () { } };
})());
