window.RC = window.RC || {};
/* Helpers shared by the court screens. (The shot/actor/reaction helpers went with the removed screens 5-11.) */
RC.court = (function () {
  /* Narration plays automatically only the first time a screen is seen. */
  function shouldAutoNarrate(key) { return !RC.state.narrationPlayed[key]; }
  return { shouldAutoNarrate: shouldAutoNarrate };
})();
