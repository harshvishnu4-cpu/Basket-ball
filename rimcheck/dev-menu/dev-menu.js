/* DEV MENU (testing only) - hamburger in the top-left corner that jumps straight to any screen.
   To remove: delete the rimcheck/dev-menu/ folder and its two tags in index.html (marked "DEV MENU"). */
(function () {
  // Screens currently loaded in index.html. Add a row here if another screen script is added.
  var PAGES = [
    { id: 1, name: 'Title' },
    { id: 2, name: 'Could a sensor tell?' },
    { id: 3, name: 'Rim-out shot + points question' },
    { id: 4, name: 'Sensor placement' }
  ];

  var root, button, panel, badge, open = false;

  function current() { return window.RC && RC.router ? RC.router.current() : 0; }

  function build() {
    root = document.createElement('div');
    root.id = 'dev-menu';

    button = document.createElement('button');
    button.className = 'dev-menu-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Dev menu: jump to a page');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'dev-menu-panel');
    button.innerHTML = '<span class="dev-menu-bars" aria-hidden="true"><i></i><i></i><i></i></span>';
    badge = document.createElement('span');
    badge.className = 'dev-menu-badge';
    button.appendChild(badge);

    panel = document.createElement('nav');
    panel.id = 'dev-menu-panel';
    panel.className = 'dev-menu-panel';
    panel.setAttribute('aria-label', 'Dev pages');
    panel.hidden = true;
    var title = document.createElement('div');
    title.className = 'dev-menu-title';
    title.textContent = 'Dev menu - jump to page';
    panel.appendChild(title);

    PAGES.forEach(function (page) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'dev-menu-item';
      item.dataset.page = page.id;
      item.innerHTML = '<span class="dev-menu-num">' + page.id + '</span><span class="dev-menu-name"></span>';
      item.querySelector('.dev-menu-name').textContent = page.name;
      item.addEventListener('click', function () { jump(page.id); });
      panel.appendChild(item);
    });

    button.addEventListener('click', function () { setOpen(!open); });
    root.appendChild(button);
    root.appendChild(panel);
    document.body.appendChild(root);

    // Keep the game from seeing clicks on the menu (drag/drop selection, click-to-skip layers, etc.)
    ['pointerdown', 'click'].forEach(function (type) {
      root.addEventListener(type, function (e) { e.stopPropagation(); });
    });
    // Close on any click outside the menu, or on Escape. The closing click is swallowed so it doesn't also act in the game.
    var swallowClick = false;
    document.addEventListener('pointerdown', function (e) {
      if (!open || root.contains(e.target)) return;
      setOpen(false); swallowClick = true;
      setTimeout(function () { swallowClick = false; }, 600); // only the click belonging to this press
      e.preventDefault(); e.stopPropagation();
    }, true);
    document.addEventListener('click', function (e) {
      if (!swallowClick) return;
      swallowClick = false; e.preventDefault(); e.stopPropagation();
    }, true);
    document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') { setOpen(false); button.focus(); } });

    refresh();
    setInterval(refresh, 400); // follow in-game navigation (Next buttons, Back, etc.)
  }

  function refresh() {
    var id = current();
    badge.textContent = id || '';
    Array.prototype.forEach.call(panel.querySelectorAll('.dev-menu-item'), function (item) {
      var active = Number(item.dataset.page) === id;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
    });
  }

  function setOpen(v) {
    open = v;
    panel.hidden = !v;
    button.setAttribute('aria-expanded', String(v));
    root.classList.toggle('open', v);
    if (v) { refresh(); var a = panel.querySelector('.dev-menu-item.active') || panel.querySelector('.dev-menu-item'); if (a) a.focus(); }
  }

  function jump(id) {
    setOpen(false);
    if (!window.RC || id === current()) return;
    RC.busy = false;
    if (RC.narration && RC.narration.stop) RC.narration.stop();
    // RC.debug.jump fills in the state earlier screens would have set (same as ?screen=N).
    if (RC.debug && RC.debug.jump) RC.debug.jump(id); else RC.router.go(id);
    setTimeout(refresh, 700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
