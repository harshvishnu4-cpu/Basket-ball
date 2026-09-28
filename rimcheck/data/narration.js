/* Learner-facing copy for the four-screen RimCheck mission.
   The grade-6 learning goal is a simple two-clue AND rule. */
window.RC = window.RC || {};
RC.text = {
  voice: {
    voice_02_intro: "Could a sensor tell if this basket counts? Make your prediction.",
    voice_03_dispute: "The shot bounced out. A machine needs evidence before it can make the call.",
    voice_04_sensor_instruction: "Put the sensor where it can see the rim and the space under the net.",
    voice_04_sensor_backboard: "The backboard can shake on a basket or a miss, so that signal is not enough.",
    voice_04_sensor_far: "This spot is too far away. The sensor may miss the ball.",
    voice_04_sensor_good: "The sensor checks two clues. The ball dipped inside the rim, but it did not come out under the net, so this shot does not count. A basket needs both clues.",
    voice_04_hint: "Try beside the net, where the sensor can see both clues."
  },
  sections: { courtTrouble: "Court Trouble", sensorTest: "Sensor Test" },
  title: {
    name: "RimCheck",
    sub: "Can a machine make the call?",
    start: "Start Mission",
    tapHint: "Sound on for the best experience"
  },
  intro: {
    name: "Riya",
    line: "Could a sensor tell if this counts?",
    yes: "Yes",
    no: "No"
  },
  dispute: {
    yes: "It went in!",
    no: "No way!",
    question: "Points or no points?",
    points: "Points",
    noPoints: "No Points"
  },
  sensor: {
    tray: "Sensor",
    trayHint: "Drag it to a spot",
    cta: "Test Sensor",
    ctaDone: "Replay Mission",
    backboard: "A hit can happen on a basket or a miss. This signal is not enough.",
    far: "Too far away. The sensor may miss the ball.",
    logicTitle: "CHECK BOTH CLUES",
    clueInside: "Dipped inside rim",
    clueExit: "Came out under net",
    rattleLabel: "Rattle-out",
    madeLabel: "Made basket",
    noPoint: "NO POINT",
    point: "POINT",
    ruleLine: "Both clues must be YES."
  },
  hintLabel: "Hint"
};
