window.RC = window.RC || {};
RC.assets = (function () {
  var base = 'assets/images/';
  var manifest = {
    bg_title: 'backgrounds/bg_first_screen_reference.png',
    bg_second: 'backgrounds/bg_second_screen_reference.png',
    bg_third: 'backgrounds/bg_third_screen_clean-v2.png',
    bg_fourth: 'backgrounds/bg_fourth_screen_clean-v2.png',
    coach_riya_thinking_reference: 'characters/coach_riya_thinking-reference-v2.png',
    coach_riya_third: 'characters/coach_riya_third-idle-v2.png',
    // Separate frames keep the player independent from the court and ball path.
    shooter_ready: 'characters/player_girl_ready-v2.png',
    shooter_release: 'characters/player_girl_release-v2.png',
    teammate_cheer: 'characters/player_teammate_cheer-v2.png',
    react_no_pair: 'characters/players_react_no-pair-v2.png',
    ball: 'props/ball_basketball.png',
    ball_shadow: 'props/ball_shadow.png',
    screen2_yes: 'screen2/button_yes.png',
    screen2_no: 'screen2/button_no.png',
    // Compact sensor for screen 4 (tray + mounted on a drop mark).
    sensor_fourth: 'screen4/sensor_compact.png',
    icon_replay: 'ui/ui_icon_replay.png',
    logo: 'ui/ui_skai_logo_mark.png',
    rule_connector: 'ui/ui_rule_connector.png',
    // SKAI mission shell components (Figma "SKAI final" / Main), cleaned by tools/strip-svg-bg.js
    skai_gear_back: 'ui/skai/gear_back.svg',
    skai_gear_sound: 'ui/skai/gear_sound.svg',
    skai_gear_info: 'ui/skai/gear_info.svg',
    skai_gear_hint: 'ui/skai/gear_hint.svg',
    skai_gear_close: 'ui/skai/gear_close.svg',
    skai_icon_close: 'ui/skai/icon_close_x.svg',
    skai_logo_tag: 'ui/skai/logo_tag.svg',
    skai_logo_mark: 'ui/skai/logo_mark.svg',
    skai_timer: 'ui/skai/timer_sign.svg',
    skai_progress: 'ui/skai/progress_frame.svg',
    skai_bolt: 'ui/skai/bolt.svg',
    skai_panel: 'ui/skai/panel_info.svg'
  };
  var images = {};
  function url(key) { return base + manifest[key]; }
  function preload(onProgress) {
    var keys = Object.keys(manifest), done = 0;
    return Promise.all(keys.map(function (key) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = img.onerror = function () { done++; if (onProgress) onProgress(done / keys.length); resolve(); };
        img.src = url(key);
        images[key] = img;
      });
    }));
  }
  function img(key) { return images[key]; }
  return { manifest: manifest, url: url, preload: preload, img: img };
})();
