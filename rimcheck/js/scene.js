window.RC = window.RC || {};
/* Canvas court renderer + authored shot player. The background is a DOM layer; the canvas holds everything that moves. */
RC.scene = (function () {
  var canvas, ctx, items = [], tickers = [], running = false, last = 0, raf = 0, bgKey = null;
  function init() {
    canvas = document.getElementById('scene-canvas'); canvas.width = 1920; canvas.height = 1080;
    ctx = canvas.getContext('2d');
  }
  function setBackground(key) {
    bgKey = key;
    var layer = document.getElementById('bg-layer');
    layer.style.backgroundImage = key ? 'url(' + RC.assets.url(key) + ')' : 'none';
  }
  function add(item) { items.push(item); items.sort(function (a, b) { return (a.z || 0) - (b.z || 0); }); start(); return item; }
  function remove(item) { var i = items.indexOf(item); if (i >= 0) items.splice(i, 1); }
  function addTicker(fn) { tickers.push(fn); start(); return fn; }
  function removeTicker(fn) { var i = tickers.indexOf(fn); if (i >= 0) tickers.splice(i, 1); }
  function clear() { items = []; tickers = []; if (ctx) ctx.clearRect(0, 0, 1920, 1080); }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
  function loop(ts) {
    if (!running) return;
    var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    tickers.slice().forEach(function (f) { f(dt, ts / 1000); });
    ctx.clearRect(0, 0, 1920, 1080);
    for (var i = 0; i < items.length; i++) { var it = items[i]; if (it.visible !== false) it.draw(ctx, ts / 1000); }
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  /* ---------- Sprite ---------- */
  function Sprite(o) { this.x = 0; this.y = 0; this.h = 100; this.alpha = 1; this.anchor = 'bottom'; this.flip = false; this.z = 2; this.visible = true; Object.assign(this, o); }
  Sprite.prototype.draw = function (c) {
    var img = RC.assets.img(this.key); if (!img || !img.naturalWidth) return;
    var h = this.h, w = img.naturalWidth * h / img.naturalHeight;
    var x = this.x - w / 2, y = this.anchor === 'bottom' ? this.y - h : this.y - h / 2;
    c.save(); c.globalAlpha = this.alpha;
    if (this.flip) { c.translate(this.x, 0); c.scale(-1, 1); c.translate(-this.x, 0); }
    c.drawImage(img, x, y, w, h); c.restore();
  };

  /* The clamp closes around this arm, which terminates on actual court hardware.
     Shared by canvas sprites and DOM drag targets so a placed sensor never floats. */
  /* Mounting bracket for the box sensor: a navy plate with two screws directly behind the device, so it reads as
     fixed to the surface it sits on. When the anchor (mountX/mountY) is away from the device, an arm joins the two.
     `size` is the sensor's rendered box; the plate is sized to the device's visible footprint inside that box. */
  function SensorMount(spot, size) { this.spot = spot; this.size = size || 110; this.z = 2.1; }
  SensorMount.prototype.draw = function (c) {
    var p = this.spot, s = this.size, w = s * 0.62, h = s * 0.30, x = p.x - w / 2, y = p.y - h / 2 + s * 0.06;
    var dx = p.mountX - p.x, dy = p.mountY - p.y, dist = Math.hypot(dx, dy);
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    if (dist > 24) {
      // arm from the plate to the anchor, then a small anchor pad on the hardware
      c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 6; c.shadowOffsetY = 3;
      c.strokeStyle = '#1f3d66'; c.lineWidth = s * 0.11; c.beginPath(); c.moveTo(p.x, p.y + s * 0.08); c.lineTo(p.mountX, p.mountY); c.stroke();
      c.shadowColor = 'transparent'; c.strokeStyle = '#4b76a8'; c.lineWidth = s * 0.04; c.stroke();
      roundRect(c, p.mountX - s * 0.09, p.mountY - s * 0.13, s * 0.18, s * 0.26, s * 0.04); c.fillStyle = '#1f3d66'; c.fill();
    }
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 8; c.shadowOffsetY = 4;
    roundRect(c, x, y, w, h, s * 0.06);
    var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#34568a'); g.addColorStop(1, '#152a4f');
    c.fillStyle = g; c.fill();
    c.shadowColor = 'transparent'; c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#fca01b';
    [x + s * 0.07, x + w - s * 0.07].forEach(function (sx) { c.beginPath(); c.arc(sx, y + h - s * 0.06, s * 0.028, 0, Math.PI * 2); c.fill(); });
    c.restore();
  };

  /* ---------- Ball ---------- */
  function Ball(hoop) { this.hoop = hoop; this.x = 0; this.y = 0; this.visible = false; this.rot = 0; this.trail = []; this.showTrail = false; this.trailColor = 'rgba(58,168,160,.95)'; this.z = 3; this.shadow = true; this.ghost = false; this.alpha = 1; this.netOverlay = true; }
  Ball.prototype.set = function (x, y) {
    if (this.showTrail) { this.trail.push({ x: x, y: y }); if (this.trail.length > 60) this.trail.shift(); }
    this.rot += Math.hypot(x - this.x, y - this.y) / this.hoop.ballR * 0.7;
    this.x = x; this.y = y;
  };
  Ball.prototype.reset = function () { this.trail = []; this.visible = false; this.ghost = false; };
  Ball.prototype.draw = function (c) {
    var h = this.hoop, r = h.ballR, img = RC.assets.img('ball');
    if (this.shadow) {
      var floorY = h.rimY + h.floorDy * h.halfW, d = RC.util.clamp((floorY - this.y) / (h.halfW * 5), 0, 1);
      c.save(); c.globalAlpha = (1 - d * 0.8) * 0.3 * this.alpha; c.fillStyle = '#000'; c.beginPath();
      c.ellipse(this.x, floorY + r * 0.7, r * (1.1 - d * 0.5), r * 0.32 * (1 - d * 0.5), 0, 0, Math.PI * 2); c.fill(); c.restore();
    }
    if (this.showTrail && this.trail.length > 1) {
      c.save(); c.strokeStyle = this.trailColor; c.lineWidth = 7; c.lineCap = 'round'; c.setLineDash([3, 18]); c.beginPath();
      c.moveTo(this.trail[0].x, this.trail[0].y); for (var i = 1; i < this.trail.length; i++) c.lineTo(this.trail[i].x, this.trail[i].y); c.stroke(); c.restore();
    }
    c.save(); c.globalAlpha = this.alpha * (this.ghost ? 0.35 : 1); c.translate(this.x, this.y); c.rotate(this.rot);
    if (img && img.naturalWidth) c.drawImage(img, -r, -r, r * 2, r * 2); c.restore();
    // Ball inside the net: paint the background's net back over it so it reads as "inside"
    if (this.netOverlay && this.x > h.netX0 - r * 0.3 && this.x < h.netX1 + r * 0.3 && this.y > h.rimY + r * 0.15 && this.y < h.netBottom + r * 0.6) {
      var bg = RC.assets.img(bgKey);
      if (bg && bg.naturalWidth) {
        var sx = h.netX0 - 16, sy = h.rimY + 4, sw = (h.netX1 - h.netX0) + 32, sh = (h.netBottom - h.rimY) + 24, kx = bg.naturalWidth / 1920, ky = bg.naturalHeight / 1080;
        c.save(); c.globalAlpha = 0.85; c.drawImage(bg, sx * kx, sy * ky, sw * kx, sh * ky, sx, sy, sw, sh); c.restore();
      }
    }
  };

  /* ---------- Detection zones ---------- */
  var ZONE_COLORS = { above: [74, 141, 240], hoop: [239, 122, 42], below: [58, 168, 160] };
  function zoneRect(hoop, name) {
    if (hoop.zones && hoop.zones[name]) return hoop.zones[name];
    var hw = hoop.halfW, rx = hoop.rimX, ry = hoop.rimY;
    if (name === 'above') return { x: rx - hw * 2.0, y: ry - hw * 1.5, w: hw * 4.0, h: hw * 1.25 };
    if (name === 'hoop') return { x: rx - hw * 1.05, y: ry - hw * 0.3, w: hw * 2.1, h: hw * 0.9 };
    return { x: rx - hw * 1.15, y: ry + hw * 0.62, w: hw * 2.3, h: hw * 1.7 };
  }
  function Zones(hoop, o) { this.hoop = hoop; this.visible = true; this.active = null; this.z = 1.5; this.alpha = 1; this.flash = {}; this.names = ['above', 'hoop', 'below']; Object.assign(this, o || {}); }
  Zones.prototype.rect = function (name) { return zoneRect(this.hoop, name); };
  Zones.prototype.pulse = function (name, t) { this.flash[name] = (t || performance.now() / 1000) + 0.6; };
  Zones.prototype.draw = function (c, t) {
    var self = this;
    this.names.forEach(function (n) {
      var r = self.rect(n), col = ZONE_COLORS[n], hot = self.active === n || (self.flash[n] && self.flash[n] > t);
      c.save(); c.globalAlpha = self.alpha;
      roundRect(c, r.x, r.y, r.w, r.h, 22);
      c.fillStyle = 'rgba(' + col.join(',') + ',' + (hot ? 0.5 : 0.2) + ')'; c.fill();
      c.lineWidth = hot ? 6 : 3; c.strokeStyle = 'rgba(' + col.join(',') + ',' + (hot ? 1 : 0.7) + ')'; c.setLineDash(hot ? [] : [12, 10]); c.stroke();
      c.restore();
    });
  };

  /* ---------- Sensor beam (dotted tracking line) ---------- */
  function Beam(o) { this.from = { x: 0, y: 0 }; this.target = null; this.isHidden = null; this.color = 'rgba(58,168,160,.95)'; this.z = 2.6; this.visible = true; Object.assign(this, o); }
  Beam.prototype.draw = function (c) {
    var b = this.target; if (!b || !b.visible) return;
    var hidden = this.isHidden ? this.isHidden(b) : false;
    var ex = b.x, ey = b.y;
    if (hidden) { ex = RC.util.lerp(this.from.x, b.x, 0.42); ey = RC.util.lerp(this.from.y, b.y, 0.42); }
    c.save(); c.strokeStyle = hidden ? 'rgba(240,165,42,.95)' : this.color; c.lineWidth = 6; c.lineCap = 'round'; c.setLineDash([4, 16]);
    c.beginPath(); c.moveTo(this.from.x, this.from.y); c.lineTo(ex, ey); c.stroke();
    if (hidden) { c.setLineDash([]); c.lineWidth = 7; c.strokeStyle = 'rgba(240,165,42,1)'; c.beginPath(); c.moveTo(ex - 16, ey - 16); c.lineTo(ex + 16, ey + 16); c.moveTo(ex + 16, ey - 16); c.lineTo(ex - 16, ey + 16); c.stroke(); }
    c.restore();
  };

  /* ---------- Image effect ---------- */
  function Fx(o) { this.key = 'fx_scan'; this.x = 0; this.y = 0; this.size = 200; this.alpha = 1; this.rot = 0; this.pulse = 0; this.z = 4; this.visible = true; this.spin = 0; this.born = performance.now() / 1000; this.life = 0; Object.assign(this, o); }
  Fx.prototype.draw = function (c, t) {
    var img = RC.assets.img(this.key); if (!img || !img.naturalWidth) return;
    var age = t - this.born, a = this.alpha;
    if (this.life) { if (age > this.life) { remove(this); return; } a *= age < 0.15 ? age / 0.15 : Math.min(1, (this.life - age) / 0.3); }
    var s = this.size * (this.pulse ? 1 + 0.08 * Math.sin(t * this.pulse * 6.283) : 1);
    c.save(); c.globalAlpha = a; c.translate(this.x, this.y); c.rotate(this.rot + this.spin * age); c.drawImage(img, -s / 2, -s / 2, s, s); c.restore();
  };

  /* ---------- Soft ring pulse (canvas, no asset) ---------- */
  function Ring(o) { this.x = 0; this.y = 0; this.color = '58,168,160'; this.born = performance.now() / 1000; this.life = 0.7; this.r0 = 20; this.r1 = 120; this.z = 4; Object.assign(this, o); }
  Ring.prototype.draw = function (c, t) {
    var k = (t - this.born) / this.life; if (k >= 1) { remove(this); return; }
    c.save(); c.globalAlpha = 1 - k; c.lineWidth = 8 * (1 - k) + 2; c.strokeStyle = 'rgba(' + this.color + ',1)'; c.beginPath(); c.arc(this.x, this.y, RC.util.lerp(this.r0, this.r1, k), 0, Math.PI * 2); c.stroke(); c.restore();
  };

  return { init: init, setBackground: setBackground, bgKey: function () { return bgKey; }, add: add, remove: remove, addTicker: addTicker, removeTicker: removeTicker, clear: clear, start: start, stop: stop,
    Sprite: Sprite, SensorMount: SensorMount, Ball: Ball, Zones: Zones, Beam: Beam, Fx: Fx, Ring: Ring, zoneRect: zoneRect, roundRect: roundRect };
})();

/* ---------- Shot player ---------- */
RC.shots = (function () {
  var RELEASE = 0.45;
  function buildPath(shot, hoop) {
    var hw = hoop.halfW, pts = [{ x: hoop.rimX + hoop.launch[0] * hw, y: hoop.rimY + hoop.launch[1] * hw, t: 0, tag: null }];
    shot.keys.forEach(function (k) {
      var dy = k[1] === 'floor' ? hoop.floorDy : k[1];
      pts.push({ x: hoop.rimX + k[0] * hw, y: hoop.rimY + dy * hw, t: k[2], tag: k[3] || null });
    });
    return pts;
  }
  function catmull(p0, p1, p2, p3, u) {
    var u2 = u * u, u3 = u2 * u;
    return {
      x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
      y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3)
    };
  }
  function posAt(pts, t) {
    if (t <= 0) return pts[0];
    var n = pts.length; if (t >= pts[n - 1].t) return pts[n - 1];
    for (var i = 0; i < n - 1; i++) {
      if (t >= pts[i].t && t <= pts[i + 1].t) {
        var u = (t - pts[i].t) / (pts[i + 1].t - pts[i].t);
        return catmull(pts[Math.max(i - 1, 0)], pts[i], pts[i + 1], pts[Math.min(i + 2, n - 1)], u);
      }
    }
    return pts[n - 1];
  }
  // Sample a full path as a polyline (for ghost trails)
  function sample(shotId, hoop, steps) {
    var pts = buildPath(RC.shotData.shots[shotId], hoop), end = pts[pts.length - 1].t, out = [];
    for (var i = 0; i <= steps; i++) out.push(posAt(pts, end * i / steps));
    return out;
  }
  function tagSfx(tag) {
    if (tag === 'rim') RC.audio.sfx('rimhit');
    else if (tag === 'backboard') RC.audio.sfx('bounce');
    else if (tag === 'below') RC.audio.sfx('swish');
    else if (tag === 'floor') RC.audio.sfx('bounce');
  }
  /* play({ shot, hoop, ball, shooter, windup, speed, onEvent(tag, point), silent, stopAt })  -> Promise */
  function play(o) {
    var shot = RC.shotData.shots[o.shot], hoop = o.hoop, pts = buildPath(shot, hoop);
    var windup = o.windup != null ? o.windup : (o.shooter ? RELEASE : 0.25), speed = o.speed || 1, elapsed = 0, fired = {}, done = false;
    var ball = o.ball; ball.reset();
    if (o.shooter) o.shooter.key = 'shooter_ready';
    return new Promise(function (resolve) {
      var tick = function (dt) {
        elapsed += dt * speed; var t = elapsed - windup;
        if (t < 0) return;
        if (!ball.visible) { ball.visible = true; ball.x = pts[0].x; ball.y = pts[0].y; if (o.shooter) o.shooter.key = 'shooter_release'; if (o.onEvent) o.onEvent('release', pts[0]); if (!o.silent) RC.audio.sfx('whoosh'); }
        var p = posAt(pts, t); ball.set(p.x, p.y);
        for (var i = 1; i < pts.length; i++) {
          if (pts[i].t <= t && !fired[i]) { fired[i] = true; if (pts[i].tag) { if (!o.silent) tagSfx(pts[i].tag); if (o.onEvent) o.onEvent(pts[i].tag, pts[i]); } }
        }
        var endT = o.stopAt != null ? o.stopAt : pts[pts.length - 1].t + 0.1;
        if (t >= endT) finish();
      };
      function finish() { if (done) return; done = true; RC.scene.removeTicker(tick); resolve(); }
      RC.scene.addTicker(tick);
      if (o.handle) o.handle.cancel = finish;
    });
  }
  return { play: play, sample: sample, buildPath: buildPath, RELEASE: RELEASE };
})();
