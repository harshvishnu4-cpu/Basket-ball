/* Optional recorded narration. Add an entry per line when a local voice file exists, e.g.
     voice_02_intro: "assets/audio/voice/voice_02_intro.ogg"
   Keys match RC.text.voice in narration.js. Lines without an entry fall back to offline speech synthesis. */
window.RC = window.RC || {};
RC.voiceManifest = {};
