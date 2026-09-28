window.RC = window.RC || {};
RC.assets = (function () {
  var base = 'assets/images/';
  var manifest = {
    bg_title: 'backgrounds/bg_first_screen_reference.png',
    bg_second: 'backgrounds/bg_second_screen_reference.png',
    bg_third: 'backgrounds/bg_third_screen_clean-v2.png',
    bg_fourth: 'backgrounds/bg_fourth_screen_clean-v2.png',
    bg_game: 'backgrounds/bg_court_game.jpg',
    bg_two: 'backgrounds/bg_court_two_hoops.jpg',
    bg_complete: 'backgrounds/bg_court_complete.jpg',
    coach_riya_idle: 'characters/coach_riya_idle.png',
    coach_riya_hello: 'characters/coach_riya_hello.png',
    coach_riya_curious: 'characters/coach_riya_curious.png',
    coach_riya_thinking: 'characters/coach_riya_thinking.png',
    coach_riya_thinking_reference: 'characters/coach_riya_thinking-reference-v2.png',
    coach_riya_third: 'characters/coach_riya_third-idle-v2.png',
    coach_riya_celebrate: 'characters/coach_riya_celebrate.png',
    coach_riya_pointing: 'characters/coach_riya_point.png',
    // Separate frames keep the player independent from the court and ball path.
    shooter_ready: 'characters/player_girl_ready-v2.png',
    shooter_release: 'characters/player_girl_release-v2.png',
    teammate_cheer: 'characters/player_teammate_cheer-v2.png',
    react_no_pair: 'characters/players_react_no-pair-v2.png',
    react_yes: 'characters/players_react_yes.png',
    react_no: 'characters/players_react_no.png',
    players_waiting: 'characters/players_waiting.png',
    ball: 'props/ball_basketball.png',
    ball_shadow: 'props/ball_shadow.png',
    screen2_yes: 'screen2/button_yes.png',
    screen2_no: 'screen2/button_no.png',
    // Sensor: one device, eight authored views (520px, alpha). `sensor` is the tray/recap view.
    sensor: 'props/sensor_front.png',
    sensor_fourth: 'screen4/sensor_compact.png',
    sensor_front: 'props/sensor_front.png',
    sensor_front_left: 'props/sensor_front_left.png',
    sensor_left_profile: 'props/sensor_left_profile.png',
    sensor_rear_left: 'props/sensor_rear_left.png',
    sensor_rear: 'props/sensor_rear.png',
    sensor_rear_right: 'props/sensor_rear_right.png',
    sensor_right_profile: 'props/sensor_right_profile.png',
    sensor_front_right: 'props/sensor_front_right.png',
    sensor_top_down: 'props/sensor_top_down.png',
    rim_highlight: 'props/hoop_rim_highlight.png',
    fx_scan: 'fx/fx_sensor_scan.png',
    fx_locked: 'fx/fx_sensor_locked.png',
    fx_noise: 'fx/fx_sensor_noise.png',
    fx_occluded: 'fx/fx_sensor_occluded.png',
    fx_spark: 'fx/fx_correct_spark.png',
    fx_needs_fix: 'fx/fx_needs_fix.png',
    fx_glow: 'fx/fx_completion_glow.png',
    zone_above: 'fx/zone_above.png',
    zone_hoop: 'fx/zone_hoop.png',
    zone_below: 'fx/zone_below.png',
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
