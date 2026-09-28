window.RC = window.RC || {};
/* Drag-and-drop with a tap-to-place fallback and keyboard activation.
   makeDraggable(el, { getZones: () => [{el, id}], accepts(zone, el), onDrop(zone, el), onReject(zone, el), onPick(), onEnd(), allowFilled })
   - Drag: pointer moves > 8px -> a ghost follows; release over a zone -> ghost flies in -> onDrop.
   - Tap: tap the item to select it, then tap a zone -> ghost flies in -> onDrop.
   - Keyboard: Enter/Space on the item selects it; Enter/Space on a focused zone drops it. */
RC.input = (function () {
  var selected = null, shell;
  function init() {
    shell = document.getElementById('shell');
    document.addEventListener('pointerdown', onDocDown, true);
    document.addEventListener('keydown', onDocKey);
  }
  function zonesOf(opts) { return opts.getZones ? opts.getZones() : []; }
  function acceptable(zone, el, opts) {
    if (!zone) return false;
    if (zone.el.classList.contains('filled') && !opts.allowFilled) return false;
    if (opts.accepts && !opts.accepts(zone, el)) return false;
    return true;
  }
  function zoneAt(cx, cy, opts) {
    var zones = zonesOf(opts);
    for (var i = 0; i < zones.length; i++) { if (RC.util.pointInRect(cx, cy, zones[i].el.getBoundingClientRect())) return zones[i]; }
    return null;
  }
  function makeGhost(el, w, h) {
    var g = el.cloneNode(true);
    g.classList.remove('selected', 'source-dragging'); g.classList.add('ghost');
    g.removeAttribute('id'); g.removeAttribute('tabindex');
    g.style.width = w + 'px'; g.style.height = h + 'px'; g.style.margin = '0';
    shell.appendChild(g); return g;
  }
  function moveGhost(g, x, y) { g.style.left = x + 'px'; g.style.top = y + 'px'; }
  function removeGhost(g) { if (g && g.parentNode) g.parentNode.removeChild(g); }
  function flyGhostTo(g, targetEl) {
    if (!g) return Promise.resolve();
    var tr = RC.util.shellRect(targetEl), w = parseFloat(g.style.width), h = parseFloat(g.style.height);
    var tx = tr.x + tr.w / 2 - w / 2, ty = tr.y + tr.h / 2 - h / 2, sx = parseFloat(g.style.left), sy = parseFloat(g.style.top);
    return RC.util.tween({ duration: RC.a11y.reducedMotion ? 1 : 180, onUpdate: function (k) { moveGhost(g, RC.util.lerp(sx, tx, k), RC.util.lerp(sy, ty, k)); } });
  }
  function makeDraggable(el, opts) {
    if (el.tabIndex < 0) el.tabIndex = 0;
    var drag = null;
    function canStart() { return !el.classList.contains('placed') && !el.classList.contains('disabled') && !(opts.canDrag && !opts.canDrag()); }
    el.addEventListener('pointerdown', function (e) {
      if (!canStart()) return;
      e.preventDefault(); e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch (_) { }
      var p = RC.util.shellPoint(e.clientX, e.clientY), r = RC.util.shellRect(el);
      drag = { id: e.pointerId, sx: p.x, sy: p.y, ox: p.x - r.x, oy: p.y - r.y, w: r.w, h: r.h, ghost: null, moved: false, zone: null };
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var p = RC.util.shellPoint(e.clientX, e.clientY);
      if (!drag.moved) {
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) < 8) return;
        drag.moved = true; clearSelection();
        drag.ghost = makeGhost(el, drag.w, drag.h); el.classList.add('source-dragging');
        if (opts.onPick) opts.onPick(el);
      }
      moveGhost(drag.ghost, p.x - drag.ox, p.y - drag.oy);
      var z = zoneAt(e.clientX, e.clientY, opts);
      if (z && !acceptable(z, el, opts)) z = null;
      if (drag.zone && drag.zone !== z) drag.zone.el.classList.remove('over');
      if (z && z !== drag.zone) { z.el.classList.add('over'); RC.audio.sfx('hover'); }
      drag.zone = z;
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      try { el.releasePointerCapture(e.pointerId); } catch (_) { }
      if (!d.moved) { toggleSelect(el, opts); return; }
      if (opts.onEnd) opts.onEnd(el);
      el.classList.remove('source-dragging');
      if (d.zone) d.zone.el.classList.remove('over');
      var z = e.type === 'pointercancel' ? null : zoneAt(e.clientX, e.clientY, opts);
      if (z && acceptable(z, el, opts)) {
        flyGhostTo(d.ghost, z.el).then(function () { removeGhost(d.ghost); opts.onDrop(z, el); });
      } else {
        flyGhostTo(d.ghost, el).then(function () { removeGhost(d.ghost); if (z && opts.onReject) opts.onReject(z, el); });
      }
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && canStart()) { e.preventDefault(); e.stopPropagation(); toggleSelect(el, opts); }
    });
    return { select: function () { toggleSelect(el, opts); } };
  }
  function toggleSelect(el, opts) {
    if (selected && selected.el === el) { clearSelection(); return; }
    clearSelection();
    selected = { el: el, opts: opts };
    el.classList.add('selected'); RC.audio.sfx('press');
    zonesOf(opts).forEach(function (z) { if (acceptable(z, el, opts)) { z.el.classList.add('valid', 'tap-target'); if (z.el.tabIndex < 0) z.el.tabIndex = 0; } });
    if (opts.onSelect) opts.onSelect(el);
  }
  function clearSelection() {
    if (!selected) return;
    var s = selected; selected = null;
    s.el.classList.remove('selected');
    zonesOf(s.opts).forEach(function (z) { z.el.classList.remove('valid', 'tap-target'); });
    if (s.opts.onDeselect) s.opts.onDeselect(s.el);
  }
  function placeSelected(zone) {
    var s = selected; clearSelection();
    var r = RC.util.shellRect(s.el), g = makeGhost(s.el, r.w, r.h); moveGhost(g, r.x, r.y);
    s.el.classList.add('source-dragging');
    flyGhostTo(g, zone.el).then(function () { removeGhost(g); s.el.classList.remove('source-dragging'); s.opts.onDrop(zone, s.el); });
  }
  function onDocDown(e) {
    if (!selected) return;
    var s = selected, zones = zonesOf(s.opts), hit = null;
    for (var i = 0; i < zones.length; i++) { if (zones[i].el.contains(e.target)) { hit = zones[i]; break; } }
    if (hit) {
      e.preventDefault(); e.stopPropagation();
      if (acceptable(hit, s.el, s.opts)) placeSelected(hit); else { RC.util.nudge(hit.el); if (s.opts.onReject) s.opts.onReject(hit, s.el); }
      return;
    }
    if (s.el.contains(e.target)) return;
    if (e.target.closest && e.target.closest('.btn, #hint-btn')) return;
    clearSelection();
  }
  function onDocKey(e) {
    if (!selected) return;
    if (e.key === 'Escape') { clearSelection(); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var s = selected, zones = zonesOf(s.opts), a = document.activeElement;
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].el === a || zones[i].el.contains(a)) { e.preventDefault(); if (acceptable(zones[i], s.el, s.opts)) placeSelected(zones[i]); else RC.util.nudge(zones[i].el); return; }
    }
  }
  return { init: init, makeDraggable: makeDraggable, clearSelection: clearSelection, flyGhostTo: flyGhostTo, makeGhost: makeGhost, removeGhost: removeGhost, moveGhost: moveGhost };
})();
