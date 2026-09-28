/* SCREEN 3 - Animated rim-out: the shot rattles on the rim and drops out, the others run in to argue,
   and once the ball settles on the floor the player makes the call: points or no points. */
RC.router.register(3, (function () {
  var el = RC.util.el;
  var raf = 0, timers = [], finished = false, finish = null;

  /* Ball path in stage px (ball centre). Each segment is an arc: x eases linearly, y follows the chord minus a
     parabola of height `h`. `fall` accelerates from rest. `hit` fires a sound (and rim marks) on arrival. */
  var PATH = [
    { to: [1612, 206], h: 330, dur: 1000, size: 100, hit: 'rim' },   // shot lands on the back of the rim
    { to: [1502, 208], h: 105, dur: 420, hit: 'rim' },               // pops forward onto the front rim
    { to: [1562, 210], h: 44, dur: 300, hit: 'rim' },                // rattles back
    { to: [1478, 216], h: 28, dur: 300, hit: 'rim' },                // and forward again...
    { to: [1432, 262], h: 6, dur: 220, out: true },                  // ...then tips off the outside of the rim
    { to: [1336, 904], fall: true, dur: 480, size: 96, hit: 'floor' },
    { to: [1244, 904], h: 190, dur: 600, hit: 'floor' },
    { to: [1184, 904], h: 70, dur: 360, hit: 'floor' },
    { to: [1156, 904], h: 22, dur: 220, hit: 'floor' },
    { to: [1118, 904], roll: true, dur: 520 }
  ];
  var START = [744, 390], START_SIZE = 80, FLOOR_Y = 904;
  var T_RELEASE = 850;

  function mount(root) {
    var T = RC.text.dispute;
    finished = false;
    RC.scene.setBackground('bg_third');

    // Teammate and the white pair are off-screen until the ball comes out; teammate runs in behind the coach.
    var teammate = layer('teammate_cheer', 'third-teammate third-offstage', 'Teammate watching the basket');
    var coach = layer('coach_riya_third', 'third-coach', 'Coach watching the shot');
    var shooter = layer('shooter_ready', 'third-shooter', 'Player lining up her shot');
    var pair = layer('react_no_pair', 'third-reaction-pair third-offstage', 'Two players reacting to the shot');
    [teammate, coach, shooter, pair].forEach(function (n) { root.appendChild(n); });

    var shadow = el('img', { 'class': 'third-ball-shadow', src: RC.assets.url('ball_shadow'), alt: '' });
    var ball = el('img', { 'class': 'third-rim-ball', src: RC.assets.url('ball'), alt: 'Basketball bouncing off the rim' });
    var impact = el('div', { 'class': 'third-impact', 'aria-hidden': 'true' });
    var made = el('div', { 'class': 'third-bubble made', text: T.yes });
    var doubt = el('div', { 'class': 'third-bubble doubt', text: T.no });
    [shadow, ball, impact, made, doubt].forEach(function (n) { root.appendChild(n); });

    // Tapping during the play skips to the end; it never answers the question.
    var skipButton = el('button', {
      'class': 'third-screen-continue',
      'aria-label': 'Skip to the end of the play',
      onClick: function () { if (!RC.busy && !finished) finish(); }
    });
    root.appendChild(skipButton);

    var pointsBtn = answer('points', T.points), noPointsBtn = answer('none', T.noPoints);
    var question = el('div', { 'class': 'third-question', role: 'group', 'aria-labelledby': 'third-question-title' },
      [el('h2', { id: 'third-question-title', text: T.question }), el('div', { 'class': 'third-answers' }, [pointsBtn, noPointsBtn])]);
    question.hidden = true;
    root.appendChild(question);

    function answer(value, label) {
      return el('button', { 'class': 'btn btn-predict third-answer ' + (value === 'points' ? 'yes' : 'no'), 'data-call': value, text: label,
        onClick: function () { choose(value, this); } });
    }
    function askQuestion() {
      if (!question.hidden) return;
      skipButton.remove();
      question.hidden = false; question.classList.add('anim-pop');
      RC.audio.sfx('progress');
      pointsBtn.focus({ preventScroll: true });
    }
    function choose(value, button) {
      if (RC.busy) return;
      RC.busy = true;
      RC.state.pointsCall = value;
      pointsBtn.disabled = noPointsBtn.disabled = true;
      button.classList.add('picked');
      RC.audio.sfx('press');
      setTimeout(function () { RC.busy = false; RC.router.next(); }, 520);
    }
    RC.state.disputeSeen = true;

    /* ---- characters ---- */
    function enterOthers() {
      teammate.classList.remove('third-offstage'); teammate.classList.add('third-run-left');
      pair.classList.remove('third-offstage'); pair.classList.add('third-run-right');
      RC.audio.sfx('murmur');
    }
    // each speaker talks once they've arrived
    teammate.addEventListener('animationend', function () { made.classList.add('shown', 'anim-pop'); });
    pair.addEventListener('animationend', function () { later(function () { doubt.classList.add('shown', 'anim-pop'); }, 250); });
    function narrate() {
      if (RC.court.shouldAutoNarrate('voice_03_dispute')) RC.narration.play('voice_03_dispute', { bubble: false, linger: 0 });
    }

    /* ---- ball ---- */
    function place(x, y, size, rot) {
      ball.style.transform = 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px) rotate(' + rot + 'deg)';
      ball.style.width = ball.style.height = size + 'px';
      var lift = FLOOR_Y - y; // shadow only once the ball is heading for the floor
      if (y > 420) {
        var k = Math.max(0, 1 - lift / 520), w = 70 + 50 * k;
        shadow.style.opacity = (0.15 + 0.6 * k).toFixed(3);
        shadow.style.width = w + 'px'; shadow.style.height = w / 2 + 'px';
        shadow.style.transform = 'translate(' + (x - w / 2) + 'px,' + (FLOOR_Y + size / 2 - w / 4 - 4) + 'px)';
      } else shadow.style.opacity = 0;
    }
    function rimMarks(x, y) {
      impact.style.left = (x - 108) + 'px'; impact.style.top = (y - 26) + 'px';
      impact.classList.remove('flash'); void impact.offsetWidth; impact.classList.add('flash');
    }

    var t0 = 0, rot = 0, last = null, segIndex = -1, crossedOut = false;
    function frame(ts) {
      if (!t0) t0 = ts;
      var t = ts - t0, from = START, fromSize = START_SIZE;
      for (var i = 0; i < PATH.length; i++) {
        var s = PATH[i], size = s.size || fromSize;
        if (t <= s.dur || i === PATH.length - 1) {
          var u = Math.min(1, t / s.dur);
          var ux = s.roll ? 1 - Math.pow(1 - u, 2) : u;
          var uy = s.fall ? u * u : u;
          var x = from[0] + (s.to[0] - from[0]) * ux;
          var y = from[1] + (s.to[1] - from[1]) * uy - (s.h ? 4 * s.h * u * (1 - u) : 0);
          var sz = fromSize + (size - fromSize) * u;
          if (last) rot -= Math.hypot(x - last[0], y - last[1]) / (sz / 2) * 57.3 * 0.6; // spins backward, like a shot
          last = [x, y];
          place(x, y, sz, rot);
          if (i !== segIndex) { arrive(segIndex); segIndex = i; }
          if (u >= 1 && i === PATH.length - 1) { arrive(i); return done(); }
          break;
        }
        t -= s.dur; from = s.to; fromSize = size;
      }
      raf = requestAnimationFrame(frame);
    }
    function arrive(i) {
      if (i < 0) return;
      var s = PATH[i];
      if (s.hit === 'rim') { RC.audio.sfx('rimhit'); rimMarks(s.to[0], s.to[1]); }
      if (s.hit === 'floor') RC.audio.sfx('bounce');
      if (s.out && !crossedOut) { crossedOut = true; enterOthers(); }
    }
    function done() {
      if (finished) return;
      finished = true; raf = 0;
      later(askQuestion, 350); // the ball has stopped on the floor
      later(narrate, 450);
    }

    finish = function () {
      if (finished) return;
      cancelAnimationFrame(raf); clearTimers();
      shooter.src = RC.assets.url('shooter_release'); shooter.classList.remove('third-windup');
      ball.classList.add('shown');
      var end = PATH[PATH.length - 1];
      place(end.to[0], end.to[1], 96, rot);
      if (!crossedOut) { crossedOut = true; enterOthers(); }
      [teammate, pair].forEach(function (n) { n.classList.add('third-settled'); });
      made.classList.add('shown'); doubt.classList.add('shown');
      finished = true;
      askQuestion();
      narrate();
    };

    /* ---- timeline ---- */
    if (RC.debugFast || RC.a11y.reducedMotion) { finish(); return; }
    later(function () { shooter.classList.add('third-windup'); }, 380);
    later(function () {
      shooter.src = RC.assets.url('shooter_release');
      ball.classList.add('shown');
      RC.audio.sfx('whoosh');
      raf = requestAnimationFrame(frame);
    }, T_RELEASE);
  }

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function layer(key, className, alt) {
    return el('img', { 'class': 'third-character ' + className, src: RC.assets.url(key), alt: alt });
  }

  function unmount() { cancelAnimationFrame(raf); raf = 0; clearTimers(); finish = null; }

  return { mount: mount, unmount: unmount };
})());
