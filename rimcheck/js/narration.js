window.RC = window.RC || {};
/* Narration player. Order of preference per line:
   1. a local voice file listed in data/voice_manifest.js (assets/audio/voice/*.ogg|mp3)
   2. the browser's offline speech synthesis
   3. a timed Riya speech bubble only.
   Never plays two lines at once; ducks BGM while speaking. */
RC.narration = (function () {
  var current = null, chosenVoice = null, lastText = '';
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var voices = speechSynthesis.getVoices(), prefs = ['en-IN', 'en-GB', 'en-AU', 'en-US', 'en'];
    chosenVoice = null;
    for (var i = 0; i < prefs.length && !chosenVoice; i++) {
      for (var j = 0; j < voices.length; j++) {
        if (voices[j].lang && voices[j].lang.replace('_', '-').toLowerCase().indexOf(prefs[i].toLowerCase()) === 0) { chosenVoice = voices[j]; break; }
      }
    }
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function estimate(text) { return 700 + text.split(/\s+/).length * 400; }

  function play(key, opts) {
    opts = opts || {};
    stop(true);
    var text = (RC.text.voice && RC.text.voice[key]) || key;
    if (opts.replay !== false) lastText = text;
    RC.state.narrationPlayed[key] = true;
    RC.audio.duck(true);
    if (opts.bubble !== false) RC.ui.coach.say(text, { side: opts.side });
    RC.a11y.announce(text);
    if (opts.replay !== false) RC.ui.topbar.setReplay(function () { play(key, opts); });

    return new Promise(function (resolve) {
      var finished = false, safety = 0;
      function end() {
        if (finished) return; finished = true; clearTimeout(safety);
        if (current === entry) current = null;
        RC.audio.duck(false);
        if (opts.bubble !== false) RC.ui.coach.hush(opts.linger == null ? 1500 : opts.linger);
        resolve();
      }
      var entry = { key: key, cancel: function () { if (finished) return; finished = true; clearTimeout(safety); if (current === entry) current = null; RC.audio.duck(false); resolve(); } };
      current = entry;

      if (RC.debugFast) { safety = setTimeout(end, 250); return; }
      if (!RC.state.audioEnabled) { safety = setTimeout(end, estimate(text) * 0.8); return; }

      var file = RC.voiceManifest && RC.voiceManifest[key];
      if (file) {
        var a = new Audio(file); a.volume = RC.audio.VOL.voice;
        a.onended = end; a.onerror = function () { speak(); };
        var baseCancel = entry.cancel;
        entry.cancel = function () { try { a.pause(); } catch (e) { } baseCancel(); };
        a.play().then(null, function () { speak(); });
        return;
      }
      speak();

      function speak() {
        if (finished) return;
        if (!('speechSynthesis' in window)) { safety = setTimeout(end, estimate(text)); return; }
        var u = new SpeechSynthesisUtterance(text);
        if (chosenVoice) u.voice = chosenVoice;
        u.rate = 0.95; u.pitch = 1.05; u.volume = 1;
        u.onend = end; u.onerror = end;
        safety = setTimeout(end, estimate(text) * 2);
        var baseCancel = entry.cancel;
        entry.cancel = function () { try { speechSynthesis.cancel(); } catch (e) { } baseCancel(); };
        try { speechSynthesis.cancel(); setTimeout(function () { if (!finished) speechSynthesis.speak(u); }, 40); }
        catch (e) { safety = setTimeout(end, estimate(text)); }
      }
    });
  }
  function stop(keepBubble) {
    if (current) current.cancel();
    if ('speechSynthesis' in window) { try { speechSynthesis.cancel(); } catch (e) { } }
    if (!keepBubble) RC.ui.coach.hush(0);
  }
  function isPlaying() { return !!current; }
  return { play: play, stop: stop, isPlaying: isPlaying, lastText: function () { return lastText; } };
})();
