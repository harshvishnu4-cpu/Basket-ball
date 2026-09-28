window.RC = window.RC || {};
/* Audio manager. Channels: BGM (generative sporty-tech loop), SFX, voice (see narration.js). Voice ducks BGM.
   SFX play the ElevenLabs clips in assets/audio/sfx/ (HTML audio, so they also work from file://);
   if a clip is missing or not loaded yet, the Web Audio synth version of that sound plays instead. */
RC.audio = (function () {
  var ctx = null, master, bgmBus, sfxBus, unlocked = false;
  var VOL = { bgmNormal: 0.28, bgmDucked: 0.09, voice: 0.95, sfx: 0.65 };
  var ducked = false;

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = RC.state.audioEnabled ? 1 : 0; master.connect(ctx.destination);
    bgmBus = ctx.createGain(); bgmBus.gain.value = 0; bgmBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = VOL.sfx; sfxBus.connect(master);
    return ctx;
  }
  function unlock() {
    var c = ensure(); if (!c) return;
    if (c.state === 'suspended') c.resume();
    unlocked = true;
  }
  function now() { return ctx.currentTime; }
  function fadeTo(g, v, dur) {
    var t = now(); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + dur);
  }

  /* ---------- synth helpers ---------- */
  function tone(o) {
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, o.t0);
    if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(o.freqEnd, o.t0 + o.dur);
    var a = o.attack || 0.005, peak = o.gain || 0.3;
    g.gain.setValueAtTime(0.0001, o.t0);
    g.gain.linearRampToValueAtTime(peak, o.t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, o.t0 + o.dur);
    var dest = o.dest || sfxBus;
    if (o.filter) { var f = ctx.createBiquadFilter(); f.type = o.filter; f.frequency.value = o.filterFreq || 1200; f.Q.value = o.q || 1; osc.connect(f); f.connect(g); } else osc.connect(g);
    g.connect(dest);
    osc.start(o.t0); osc.stop(o.t0 + o.dur + 0.05);
  }
  var noiseBuf = null;
  function getNoise() {
    if (noiseBuf) return noiseBuf;
    var len = ctx.sampleRate * 1.5, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = b; return b;
  }
  function noise(o) {
    var src = ctx.createBufferSource(); src.buffer = getNoise();
    var f = ctx.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.frequency.setValueAtTime(o.freq || 2000, o.t0);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, o.t0 + o.dur);
    f.Q.value = o.q || 0.8;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, o.t0);
    g.gain.linearRampToValueAtTime(o.gain || 0.3, o.t0 + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, o.t0 + o.dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    src.start(o.t0); src.stop(o.t0 + o.dur + 0.05);
  }

  /* ---------- SFX library ---------- */
  var SFX = {
    hover: function (t) { tone({ freq: 1400, t0: t, dur: 0.05, gain: 0.05 }); },
    press: function (t) { tone({ freq: 640, freqEnd: 330, t0: t, dur: 0.09, gain: 0.22, type: 'triangle' }); noise({ t0: t, dur: 0.04, freq: 3000, gain: 0.05 }); },
    scan: function (t) { for (var i = 0; i < 4; i++) tone({ freq: 500 + i * 180, freqEnd: 900 + i * 180, t0: t + i * 0.09, dur: 0.12, gain: 0.12, type: 'triangle' }); },
    lock: function (t) { tone({ freq: 660, t0: t, dur: 0.18, gain: 0.25, type: 'triangle' }); tone({ freq: 990, t0: t + 0.1, dur: 0.3, gain: 0.25, type: 'triangle' }); },
    bounce: function (t) { tone({ freq: 170, freqEnd: 60, t0: t, dur: 0.16, gain: 0.5 }); noise({ t0: t, dur: 0.05, freq: 800, gain: 0.12, filter: 'lowpass' }); },
    rimhit: function (t) { tone({ freq: 920, freqEnd: 860, t0: t, dur: 0.22, gain: 0.22, type: 'triangle' }); tone({ freq: 1370, freqEnd: 1300, t0: t, dur: 0.16, gain: 0.12 }); noise({ t0: t, dur: 0.05, freq: 2500, gain: 0.15 }); },
    rattle: function (t) { for (var i = 0; i < 3; i++) SFX.rimhit(t + i * 0.11); },
    swish: function (t) { noise({ t0: t, dur: 0.32, freq: 2600, freqEnd: 900, gain: 0.35, q: 0.6, attack: 0.03 }); },
    murmur: function (t) { noise({ t0: t, dur: 0.9, freq: 500, freqEnd: 380, gain: 0.14, q: 0.5, attack: 0.25, filter: 'lowpass' }); },
    cheer: function (t) { noise({ t0: t, dur: 0.8, freq: 1500, freqEnd: 2400, gain: 0.22, q: 0.4, attack: 0.15 }); [523, 659, 784].forEach(function (f, i) { tone({ freq: f, t0: t + 0.1 + i * 0.08, dur: 0.35, gain: 0.08, type: 'triangle' }); }); },
    correct: function (t) { [523, 659, 784].forEach(function (f, i) { tone({ freq: f, t0: t + i * 0.08, dur: 0.28, gain: 0.2, type: 'triangle' }); }); },
    needsFix: function (t) { tone({ freq: 440, t0: t, dur: 0.22, gain: 0.16, type: 'triangle' }); tone({ freq: 349, t0: t + 0.18, dur: 0.32, gain: 0.16, type: 'triangle' }); },
    progress: function (t) { tone({ freq: 880, t0: t, dur: 0.08, gain: 0.12, type: 'triangle' }); tone({ freq: 1320, t0: t + 0.06, dur: 0.12, gain: 0.1, type: 'triangle' }); },
    complete: function (t) { [523, 659, 784, 1047].forEach(function (f, i) { tone({ freq: f, t0: t + i * 0.13, dur: 0.5, gain: 0.2, type: 'triangle' }); }); noise({ t0: t + 0.4, dur: 0.7, freq: 3000, gain: 0.08, attack: 0.1 }); },
    whoosh: function (t) { noise({ t0: t, dur: 0.35, freq: 600, freqEnd: 2200, gain: 0.12, attack: 0.08 }); }
  };
  /* ---------- ElevenLabs SFX clips ---------- */
  // name -> playback volume (clips were generated at different loudness; tuned by ear against the synth mix)
  var CLIP_GAIN = { rimhit: 0.8, bounce: 0.85, swish: 0.7, whoosh: 0.55, murmur: 0.5, cheer: 0.6, press: 0.45, hover: 0.2,
    lock: 0.6, scan: 0.55, correct: 0.6, needsFix: 0.55, progress: 0.5, complete: 0.65 };
  var POOL = 3, clips = {};
  function loadClips() {
    if (typeof Audio === 'undefined') return;
    Object.keys(CLIP_GAIN).forEach(function (name) {
      var list = [];
      for (var i = 0; i < POOL; i++) { var a = new Audio('assets/audio/sfx/sfx_' + name + '.mp3'); a.preload = 'auto'; list.push(a); }
      clips[name] = { list: list, next: 0 };
    });
  }
  function playClip(name) {
    var c = clips[name]; if (!c) return false;
    var a = c.list[c.next]; c.next = (c.next + 1) % c.list.length; // round-robin so rapid repeats overlap
    if (a.error || a.readyState < 2) return false;
    a.volume = Math.min(1, CLIP_GAIN[name] * VOL.sfx / 0.65);
    try { a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { return false; }
    return true;
  }
  function stopClips() { Object.keys(clips).forEach(function (n) { clips[n].list.forEach(function (a) { try { a.pause(); } catch (e) { } }); }); }
  loadClips();

  function sfx(name) {
    if (!unlocked || !RC.state.audioEnabled) return;
    if (playClip(name) || !ctx) return;
    var f = SFX[name]; if (f) { try { f(now() + 0.005); } catch (e) { /* ignore */ } }
  }

  /* ---------- Generative BGM (112 BPM, two-bar loop, sporty-tech, no vocals) ---------- */
  var bgm = { playing: false, timer: null, next: 0, step: 0 };
  var SIXTEENTH = 60 / 112 / 4;
  var BASS = [45, 0, 0, 45, 0, 0, 52, 0, 45, 0, 0, 45, 0, 0, 50, 0, 41, 0, 0, 41, 0, 0, 48, 0, 43, 0, 0, 43, 0, 0, 50, 0];
  var PLUCK = [0, 0, 64, 0, 0, 67, 0, 0, 0, 0, 69, 0, 0, 0, 67, 0, 0, 0, 65, 0, 0, 64, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0];
  var PADS = [[57, 60, 64], [53, 57, 60]];
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function scheduleStep(step, t) {
    var s = step % 32, bar = Math.floor(s / 16);
    // soft kick
    if (s % 8 === 0) tone({ freq: 110, freqEnd: 45, t0: t, dur: 0.18, gain: 0.5, dest: bgmBus });
    // hat on offbeats
    if (s % 2 === 0) noise({ t0: t, dur: 0.05, freq: 7000, gain: s % 4 === 2 ? 0.09 : 0.045, filter: 'highpass', dest: bgmBus });
    // bass
    if (BASS[s]) tone({ freq: mtof(BASS[s]), t0: t, dur: SIXTEENTH * 2.6, gain: 0.35, type: 'sawtooth', filter: 'lowpass', filterFreq: 520, q: 2, attack: 0.01, dest: bgmBus });
    // pad chord at bar start
    if (s % 16 === 0) PADS[bar].forEach(function (m) { tone({ freq: mtof(m), t0: t, dur: SIXTEENTH * 15, gain: 0.05, type: 'triangle', attack: 0.4, dest: bgmBus }); });
    // pluck melody
    if (PLUCK[s]) tone({ freq: mtof(PLUCK[s]), t0: t, dur: SIXTEENTH * 3, gain: 0.09, type: 'square', filter: 'lowpass', filterFreq: 1800, attack: 0.005, dest: bgmBus });
  }
  function scheduler() {
    if (!bgm.playing) return;
    while (bgm.next < now() + 0.2) { scheduleStep(bgm.step, bgm.next); bgm.step++; bgm.next += SIXTEENTH; }
  }
  function startBgm() {
    if (!ensure() || bgm.playing || !RC.state.bgmEnabled) return;
    bgm.playing = true; bgm.step = 0; bgm.next = now() + 0.05;
    fadeTo(bgmBus, ducked ? VOL.bgmDucked : VOL.bgmNormal, 0.8);
    bgm.timer = setInterval(scheduler, 60);
  }
  function stopBgm() {
    if (!bgm.playing) return;
    bgm.playing = false; clearInterval(bgm.timer);
    if (ctx) fadeTo(bgmBus, 0, 0.4);
  }
  function duck(on) {
    ducked = !!on;
    if (!ctx || !bgm.playing) return;
    fadeTo(bgmBus, on ? VOL.bgmDucked : VOL.bgmNormal, on ? 0.2 : 0.35);
  }
  function setEnabled(v) {
    RC.state.audioEnabled = !!v;
    if (!v) stopClips();
    if (ctx) fadeTo(master, v ? 1 : 0, 0.15);
  }
  function setBgmEnabled(v) {
    RC.state.bgmEnabled = !!v;
    if (v) startBgm(); else stopBgm();
  }
  return { unlock: unlock, sfx: sfx, startBgm: startBgm, stopBgm: stopBgm, duck: duck, setEnabled: setEnabled, setBgmEnabled: setBgmEnabled, VOL: VOL };
})();
