window.RC = window.RC || {};
RC.util = (function () {
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) node.setAttribute(k, '');
        else if (v !== false && v != null) node.setAttribute(k, v);
      });
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var ease = {
    linear: function (t) { return t; },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutCubic: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    outBack: function (t) { var c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  // Generic rAF tween. Returns a promise with a .cancel() method.
  function tween(opts) {
    var dur = opts.duration || 300, fn = opts.ease || ease.outCubic, start = null, raf = 0, cancelled = false;
    var p = new Promise(function (resolve) {
      function step(ts) {
        if (cancelled) return;
        if (start === null) start = ts;
        var t = clamp((ts - start) / dur, 0, 1);
        opts.onUpdate(fn(t), t);
        if (t < 1) raf = requestAnimationFrame(step); else resolve();
      }
      raf = requestAnimationFrame(step);
    });
    p.cancel = function () { cancelled = true; cancelAnimationFrame(raf); };
    return p;
  }
  // Position of a pointer event in 1920x1080 shell coordinates
  function shellPoint(clientX, clientY) {
    var s = RC.layout;
    return { x: (clientX - s.rect.left) / s.scale, y: (clientY - s.rect.top) / s.scale };
  }
  function shellRect(node) {
    var r = node.getBoundingClientRect(), s = RC.layout;
    return { x: (r.left - s.rect.left) / s.scale, y: (r.top - s.rect.top) / s.scale, w: r.width / s.scale, h: r.height / s.scale };
  }
  function pointInRect(px, py, r) { return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom; }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function nudge(node) { node.classList.remove('nudge'); void node.offsetWidth; node.classList.add('nudge'); }
  function glow(node) { node.classList.remove('lock-glow'); void node.offsetWidth; node.classList.add('lock-glow'); }
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  return { el: el, wait: wait, clamp: clamp, lerp: lerp, ease: ease, tween: tween, shellPoint: shellPoint, shellRect: shellRect, pointInRect: pointInRect, qs: qs, qsa: qsa, nudge: nudge, glow: glow, shuffle: shuffle };
})();
