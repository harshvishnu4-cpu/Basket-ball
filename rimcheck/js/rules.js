window.RC = window.RC || {};
/* The four-screen game teaches one grade-6 AND rule.
   A basket counts only when the sensor confirms both observable clues. */
RC.rules = (function () {
  var BEST_PLACEMENT = 'hoopSide';
  var SHOTS = {
    rattleOut: { insideRim: true, exitsUnderNet: false, truth: 'no_point' },
    madeBasket: { insideRim: true, exitsUnderNet: true, truth: 'point' },
    rimMiss: { insideRim: false, exitsUnderNet: false, truth: 'no_point' }
  };

  function evaluatePlacement(sensorKey) {
    if (sensorKey === BEST_PLACEMENT) {
      return { success: true, canSeeInsideRim: true, canSeeUnderNet: true };
    }
    if (sensorKey === 'backboard') {
      return { success: false, canSeeInsideRim: false, canSeeUnderNet: false, reason: 'backboard_only' };
    }
    return { success: false, canSeeInsideRim: false, canSeeUnderNet: false, reason: 'too_far' };
  }

  function makeCall(evidence) {
    return evidence && evidence.insideRim === true && evidence.exitsUnderNet === true ? 'point' : 'no_point';
  }

  function inspectShot(sensorKey, shotKey) {
    if (sensorKey !== BEST_PLACEMENT || !SHOTS[shotKey]) return null;
    var evidence = Object.assign({}, SHOTS[shotKey]);
    evidence.call = makeCall(evidence);
    return evidence;
  }

  function basketCounts(sensorKey, evidence) {
    return sensorKey === BEST_PLACEMENT && makeCall(evidence) === 'point';
  }

  function learningRule() {
    return {
      conditions: ['Ball dips inside the rim', 'Ball comes out under the net'],
      operator: 'AND',
      action: 'Count the point'
    };
  }

  return {
    BEST_PLACEMENT: BEST_PLACEMENT,
    SHOTS: SHOTS,
    evaluatePlacement: evaluatePlacement,
    inspectShot: inspectShot,
    makeCall: makeCall,
    basketCounts: basketCounts,
    learningRule: learningRule
  };
})();
