window.RC = window.RC || {};
/* Single source of truth. Screens read from and write to RC.state; the DOM is only a view. */
RC.initialState = function () {
  return {
    currentScreen: 1,
    progressStep: 0,
    introDone: false,
    disputeSeen: false,
    disputeChoice: null,
    pointsCall: null, // screen 3 answer: 'points' | 'none'

    sensorPlacement: null,
    sensorPlacementTests: { backboard: false, farPole: false, hoopSide: false },
    learnedTwoClueRule: false,

    hintsUsed: {},
    failedAttempts: {},
    narrationPlayed: {},
    audioEnabled: true,
    bgmEnabled: true
  };
};
RC.state = RC.initialState();
RC.resetState = function () {
  var audio = RC.state.audioEnabled, bgm = RC.state.bgmEnabled;
  RC.state = RC.initialState();
  RC.state.audioEnabled = audio;
  RC.state.bgmEnabled = bgm;
};
RC.busy = false; // true while an unskippable shot animation plays (disables Back)
