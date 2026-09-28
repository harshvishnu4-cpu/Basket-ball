window.RC = window.RC || {};
/* SKAI progress bar (Figma: Group 1171279144) — orange frame, striped fill from the bottom, "n/6" label. */
RC.progress = (function () {
  var root, stripes = [], label, current = 0, TOTAL = 3;
  function init() {
    var el = RC.util.el;
    root = document.getElementById('progress');
    root.innerHTML = '';
    root.appendChild(el('div', { 'class': 'bracket top' }));
    root.appendChild(el('div', { 'class': 'bracket bottom' }));
    root.appendChild(el('img', { 'class': 'frame', src: 'assets/images/ui/skai/progress_frame.svg', alt: '' }));
    var wrap = el('div', { 'class': 'stripes' });
    for (var i = 0; i < TOTAL; i++) { var s = el('div', { 'class': 'stripe' }); stripes.push(s); wrap.appendChild(s); }
    root.appendChild(wrap);
    label = el('div', { 'class': 'label', text: '0/' + TOTAL });
    root.appendChild(label);
  }
  // step: 1..3 = active stripe; completed stripes stay white
  function set(step, opts) {
    opts = opts || {};
    stripes.forEach(function (s, i) {
      var n = i + 1, was = s.className;
      s.classList.remove('just');
      if (n < step) { s.className = 'stripe complete'; if (opts.celebrate && was.indexOf('complete') < 0) s.classList.add('just'); }
      else if (n === step) s.className = 'stripe active';
      else s.className = 'stripe';
    });
    label.textContent = step + '/' + TOTAL;
    if (step > current && current > 0 && opts.celebrate) RC.audio.sfx('progress');
    current = step;
    RC.state.progressStep = step;
  }
  function show(v) { root.hidden = !v; }
  return { init: init, set: set, show: show };
})();
