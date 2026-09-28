window.RC = window.RC || {};
/* Helpers shared by the court screens: standard actors, shot playback with Back disabled, crowd reactions. */
RC.court = (function () {
  var el = RC.util.el;
  var SHOOTER = { x: 900, bottom: 938, h: 560 }; // leaves room for the guide bubble beside Riya
  /* Riya's standard spot on activity screens: clear of the SKAI hint gear (bottom-left) and the shooter */
  var COACH_SIDE = { left: 40, bottom: 36, height: 470 }; // guide column; bubble sits above her head
  var COACH_UNDER_CONSOLE = { left: 40, bottom: 36, height: 400 }; // screens with the test console above her; bubble goes to her right

  function setBusy(v) {
    RC.busy = !!v;
    RC.ui.topbar.setBackEnabled(!v && RC.state.currentScreen > 1);
  }
  /* Build the main-court actors. opts: { shooter, sensor, zones, zonesAlpha } */
  function setupGame(opts) {
    opts = opts || {};
    RC.scene.setBackground('bg_game');
    var hoop = RC.shotData.hoops.game, h = { hoop: hoop };
    if (opts.zones) h.zones = RC.scene.add(new RC.scene.Zones(hoop, { alpha: opts.zonesAlpha != null ? opts.zonesAlpha : 1, visible: opts.zonesVisible !== false }));
    if (opts.shooter) h.shooter = RC.scene.add(new RC.scene.Sprite({ key: 'shooter_ready', x: SHOOTER.x, y: SHOOTER.bottom, h: SHOOTER.h, z: 2 }));
    if (opts.sensor) {
      var spot = RC.shotData.sensorSpots[opts.sensor === true ? 'hoopSide' : opts.sensor];
      RC.scene.add(new RC.scene.SensorMount(spot, 150));
      h.sensor = RC.scene.add(new RC.scene.Sprite({ key: spot.sensorView || 'sensor_front', x: spot.x, y: spot.y, h: 150, anchor: 'center', z: 2.2 }));
      h.sensorSpot = spot;
    }
    h.ball = RC.scene.add(new RC.scene.Ball(hoop));
    return h;
  }
  /* Play an authored shot on the main court. Disables Back while it runs. */
  function playShot(id, h, opts) {
    opts = opts || {};
    setBusy(true);
    var p = RC.shots.play(Object.assign({ shot: id, hoop: h.hoop, ball: h.ball, shooter: h.shooter || null }, opts));
    return p.then(function () { if (!opts.keepBusy) setBusy(false); });
  }
  /* Ghost replay of a shot (no shooter, translucent ball with trail). */
  function ghostShot(id, h, opts) {
    opts = opts || {};
    h.ball.showTrail = true; h.ball.ghost = true;
    return RC.shots.play(Object.assign({ shot: id, hoop: h.hoop, ball: h.ball, windup: 0.1, speed: opts.speed || 1.1, silent: true }, opts)).then(function () {
      if (!opts.keepTrail) { h.ball.showTrail = false; h.ball.ghost = false; }
    });
  }
  /* Crowd reaction: kind = 'split' (yes+no), 'yes', 'no'. Returns a cleanup fn. Bubbles go into `container`. */
  function reactions(kind, container) {
    var made = [], nodes = [];
    function group(key, x, h, shout, bx) {
      var s = RC.scene.add(new RC.scene.Sprite({ key: key, x: x, y: 1040, h: h, alpha: 0, z: 2.5 }));
      made.push(s);
      RC.util.tween({ duration: 350, onUpdate: function (k) { s.alpha = k; } });
      if (shout && container) {
        var b = el('div', { 'class': 'kids-shout anim-pop', text: shout, style: { left: bx + 'px', top: (1040 - h - 45) + 'px' } }); // just over the heads, under the machine-call badge
        container.appendChild(b); nodes.push(b);
      }
    }
    // the two groups stand on the right half so the choice buttons (x 430-1060) and the shooter stay clear
    if (kind === 'split') { group('react_yes', 1240, 340, RC.text.dispute.yes, 1130); group('react_no', 1580, 340, RC.text.dispute.no, 1480); }
    if (kind === 'yes') group('react_yes', 1010, 400, RC.text.dispute.yes, 900);
    if (kind === 'no') group('react_no', 1610, 400, RC.text.firstTest.shout, 1500);
    if (kind === 'yes') RC.audio.sfx('cheer'); else RC.audio.sfx('murmur');
    return function () { made.forEach(function (s) { RC.scene.remove(s); }); nodes.forEach(function (n) { n.remove(); }); };
  }
  function shouldAutoNarrate(key) { return !RC.state.narrationPlayed[key]; }
  /* Small labelled event chip used in event streams */
  function eventChip(name, small) {
    var labels = { above: 'Above', hoop: 'Hoop', below: 'Below', side: 'Side', rim: 'Rim', backboard: 'Board', rim_shakes: 'Rim shakes', beside: 'Beside' };
    return el('span', { 'class': 'ev-chip ev-' + name + (small ? ' small' : ''), text: labels[name] || name });
  }
  function condLabel(key) { return RC.text.builder.chips[key] || key; }
  /* A rule condition chip element */
  function condChip(key, extraClass) {
    return el('div', { 'class': 'chip cond-' + key + (extraClass ? ' ' + extraClass : ''), 'data-key': key, role: 'button', 'aria-label': condLabel(key) }, [el('i', { 'class': 'ico' }), condLabel(key)]);
  }
  function coachSide(pose) { var id = RC.router.current(); RC.ui.coach.show(pose, (id === 6 || id === 9) ? COACH_UNDER_CONSOLE : COACH_SIDE); }
  return { setBusy: setBusy, setupGame: setupGame, playShot: playShot, ghostShot: ghostShot, reactions: reactions, shouldAutoNarrate: shouldAutoNarrate, eventChip: eventChip, condChip: condChip, condLabel: condLabel, SHOOTER: SHOOTER, COACH_SIDE: COACH_SIDE, coachSide: coachSide };
})();
