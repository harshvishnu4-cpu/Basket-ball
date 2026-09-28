/* Authored shot paths. Coordinates are hoop-relative: 1 unit = half the rim width, y grows downward,
   (0,0) = centre of the rim opening. Each keypoint: [dx, dy, t(seconds), tag?].
   Tags drive the detection event stream and SFX so every play-through is identical. */
window.RC = window.RC || {};
RC.shotData = {
  // Logical hoops on each background (1920x1080 space)
  hoops: {
    game: { rimX: 1500, rimY: 284, halfW: 100, netBottom: 440, netX0: 1418, netX1: 1582, ballR: 40,
      launch: [-6.0, 1.5], floorDy: 4.6, zones: {
        above: { x: 1300, y: 120, w: 400, h: 135 }, hoop: { x: 1395, y: 258, w: 210, h: 90 }, below: { x: 1385, y: 350, w: 230, h: 170 } } },
    left:  { rimX: 250, rimY: 326, halfW: 54, netBottom: 408, netX0: 206, netX1: 296, ballR: 22, launch: [-3.9, 3.1], floorDy: 4.8 },
    right: { rimX: 1736, rimY: 345, halfW: 54, netBottom: 426, netX0: 1690, netX1: 1782, ballR: 22, launch: [-3.9, 3.1], floorDy: 4.8 }
  },
  shots: {
    cleanSwish: {
      id: "cleanSwish", truth: "point", path: ["above", "hoop", "below"],
      keys: [[-3.2, -1.2, 0.5], [-1.5, -1.75, 0.8], [-0.35, -1.2, 1.05, "above"], [0.0, 0.25, 1.28, "hoop"], [0.05, 1.0, 1.45], [0.1, 1.9, 1.66, "below"], [0.25, "floor", 2.25, "floor"]]
    },
    bankScore: {
      id: "bankScore", truth: "point", path: ["above", "backboard", "hoop", "below"],
      keys: [[-2.6, -1.4, 0.5], [0.1, -1.85, 0.85, "above"], [1.3, -1.15, 1.05, "backboard"], [0.4, -0.35, 1.28], [0.0, 0.3, 1.42, "hoop"], [0.05, 1.9, 1.78, "below"], [0.2, "floor", 2.35, "floor"]]
    },
    rattleOut: {
      id: "rattleOut", truth: "no_point", path: ["above", "hoop", "side"],
      keys: [[-3.0, -1.3, 0.5], [-1.1, -1.6, 0.85, "above"], [-0.92, -0.08, 1.05, "rim"], [0.0, 0.38, 1.3, "hoop"], [0.9, -0.05, 1.5, "rim"], [-0.2, -0.75, 1.72], [-1.55, -0.2, 1.92, "side"], [-2.6, 0.9, 2.15], [-3.4, "floor", 2.7, "floor"]]
    },
    rimMiss: {
      id: "rimMiss", truth: "no_point", path: ["above", "rim", "side"],
      keys: [[-3.2, -1.2, 0.5], [-1.75, -1.3, 0.85, "above"], [-1.05, -0.15, 1.05, "rim"], [-1.9, -1.1, 1.3], [-2.7, -0.4, 1.55, "side"], [-3.6, "floor", 2.25, "floor"]]
    }
  },
  // Screen 6: the three fixed test clips for the first (too simple) rule
  firstTestShots: ["cleanSwish", "bankScore", "rattleOut"],
  // Screen 9: the four challenge shots (fixed order)
  challengeShots: ["cleanSwish", "rattleOut", "bankScore", "rimMiss"],
  // Screen 10
  transferShots: { hoop1: "rattleOut", hoop2: "cleanSwish" },
  // Screen 4 sensor spots on the game background
  sensorSpots: {
    // x/y = sensor centre; mountX/mountY = where the bracket meets court hardware.
    // sensorView: the lens must face the hoop. front_right / right_profile look LEFT, front_left / left_profile look RIGHT, top_down looks DOWN.
    backboard: { x: 1580, y: 168, mountX: 1580, mountY: 168, label: "Backboard", sensorView: "sensor_top_down" },
    farPole:   { x: 1830, y: 200, mountX: 1830, mountY: 200, label: "Far support", sensorView: "sensor_right_profile" },
    hoopSide:  { x: 1652, y: 362, mountX: 1800, mountY: 372, label: "Beside net", sensorView: "sensor_front_right" } // hugs the right edge of the net (net x 1418-1582), arm back to the pole
  },
  // Every spot sits on a physical surface of the two-hoop background: backboard glass, the wall bracket / door pillar, or the wall beside the rim
  transferSpots: {
    // Hoop 2 mounts stay left of x 1770 so nothing hides under the progress bar (x 1790-1920, y 256-825)
    hoop1: { backboard: { x: 190, y: 200, mountX: 190, mountY: 200, sensorView: "sensor_top_down" }, farPole: { x: 60, y: 390, mountX: 60, mountY: 390, sensorView: "sensor_left_profile" }, hoopSide: { x: 365, y: 335, mountX: 365, mountY: 335, sensorView: "sensor_front_right" } },
    hoop2: { backboard: { x: 1745, y: 200, mountX: 1745, mountY: 200, sensorView: "sensor_top_down" }, farPole: { x: 1850, y: 180, mountX: 1850, mountY: 180, sensorView: "sensor_right_profile" }, hoopSide: { x: 1640, y: 372, mountX: 1640, mountY: 372, sensorView: "sensor_front_left" } }
  }
};
