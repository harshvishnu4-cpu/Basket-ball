# BUILD.md - RimCheck Grade 6 Implementation Specification

## 1. Build goal

Build a polished, full-screen, offline HTML5 mission game for Grade 6 learners.

The learner helps a sensor make a fair basketball call. The game teaches that one clue can be misleading, so the machine must check two clear pieces of evidence.

Core learning flow:

**predict -> watch a disputed shot -> place a sensor -> check two clues -> make the call**

Keep the experience concrete. Use the ball, rim, net, and a visible YES/NO comparison. Do not turn the lesson into an abstract path-ordering puzzle.

---

## 2. Learning rule

The machine uses this rule:

```text
IF the ball dips inside the rim
AND the ball comes out under the net
THEN count 1 point.
```

Child-facing summary:

```text
Both clues must be YES.
```

Evidence examples:

| Shot | Dipped inside rim? | Came out under net? | Call |
|---|---:|---:|---|
| Rattle-out | YES | NO | NO POINT |
| Made basket | YES | YES | POINT |
| Rim miss | NO | NO | NO POINT |

The disputed shot is a rattle-out. The ball briefly dips inside the rim but bounces away instead of leaving under the net. This makes the need for the second clue easy to see.

---

## 3. Required technology

- HTML5, CSS3, and vanilla JavaScript
- Canvas and/or DOM layers
- Local images, fonts, and audio only
- No build step required
- No CDN scripts, remote fonts, remote media, analytics, online APIs, or external fetch requests
- Must work with Wi-Fi disabled and through the included local launcher

---

## 4. Project structure

```text
rimcheck/
|- index.html
|- css/
|- data/
|  |- narration.js
|  `- voice_manifest.js
|- js/
|  |- app.js
|  |- state.js
|  |- rules.js
|  |- router.js
|  `- screens/
|     |- title.js
|     |- intro.js
|     |- dispute.js
|     `- sensorPlacement.js
|- assets/
|- tools/e2e-four.js
|- Play.bat
`- serve.js
```

The shipped mission has four screens. Do not load unused legacy screen modules from `index.html`.

---

## 5. Display and input

- Master resolution: `1920 x 1080`
- Scale proportionally to fill the browser while preserving 16:9
- Letterbox when the window ratio differs
- Never stretch images or show scrollbars
- Disable accidental text selection during play
- Support mouse, touch, and keyboard activation
- Give drag activities a tap-to-place fallback
- Minimum touch target: `64 x 64 px`
- Respect `prefers-reduced-motion`

Recommended scale:

```js
const scale = Math.min(
  window.innerWidth / 1920,
  window.innerHeight / 1080
);
```

---

## 6. State model

Use JavaScript state as the source of truth. The DOM is only a view.

```js
const gameState = {
  currentScreen: 1,
  introDone: false,
  disputeSeen: false,
  disputeChoice: null,
  pointsCall: null,

  sensorPlacement: null,
  sensorPlacementTests: {
    backboard: false,
    farPole: false,
    hoopSide: false
  },
  learnedTwoClueRule: false,

  hintsUsed: {},
  failedAttempts: {},
  narrationPlayed: {},
  audioEnabled: true,
  bgmEnabled: true
};
```

Reset learning state on replay while preserving the learner's audio preferences.

---

## 7. Rule engine

Keep the learning logic in `js/rules.js`, not inside screen markup.

```js
function makeCall(evidence) {
  return evidence.insideRim === true &&
         evidence.exitsUnderNet === true
    ? "point"
    : "no_point";
}
```

Required authored evidence:

```js
const shots = {
  rattleOut: {
    insideRim: true,
    exitsUnderNet: false,
    truth: "no_point"
  },
  madeBasket: {
    insideRim: true,
    exitsUnderNet: true,
    truth: "point"
  },
  rimMiss: {
    insideRim: false,
    exitsUnderNet: false,
    truth: "no_point"
  }
};
```

Use authored outcomes rather than a physics simulation so every learner sees the same evidence.

---

## 8. Navigation and shared UI

- Use a central router with `go(id)`, `next()`, and `back()`
- Each screen exposes `mount(root, options)` and `unmount()`
- Disable navigation during unskippable animation moments
- Screen 1 has no top bar or progress UI
- Keep important controls in stable positions
- Use short labels and visible focus states
- Never rely on color alone; pair color with YES/NO, check/cross, or POINT/NO POINT text

---

## 9. Screen requirements

### Screen 1 - Title

Show only the mission title, a short question, and `Start Mission`.

On start:

1. Unlock local audio.
2. Play a short button sound.
3. Run the court transition.
4. Open Screen 2.

### Screen 2 - Prediction

Ask:

> Could a sensor tell if this counts?

Offer `Yes` and `No`. Both choices continue; the choice records the learner's prediction but does not block the mission.

### Screen 3 - Disputed shot

Play one deterministic rattle-out:

1. The player releases the ball.
2. The ball hits and rattles around the rim.
3. It dips inside the rim.
4. It bounces away and lands on the court.

After the ball stops, ask `Points or no points?` and record the answer. Do not mark the learner wrong yet; Screen 4 supplies the evidence.

### Screen 4 - Sensor test and rule reveal

Offer three sensor positions:

- Backboard
- Far support
- Beside net

The learner may test positions in any order.

#### Backboard result

Explain that a backboard hit can happen on a score or a miss. It is not enough evidence.

#### Far support result

Explain that the sensor is too far away and may lose the ball.

#### Beside-net result

Replay the disputed rattle-out and reveal a compact evidence board:

| Shot | Inside rim | Under net | Call |
|---|---|---|---|
| Rattle-out | YES | NO | NO POINT |
| Made basket | YES | YES | POINT |

Finish with `Both clues must be YES.`

The completion condition is:

```js
gameState.sensorPlacementTests.hoopSide === true &&
gameState.learnedTwoClueRule === true
```

Then show `Replay Mission`.

---

## 10. Sensor placement behavior

Sensor states:

- idle
- selected
- dragging
- over a valid spot
- mounted
- scanning
- tested

The beside-net position is useful because it can see both evidence areas: the rim opening and the space under the net. Avoid language about seeing an entire trajectory. The sensor only needs a clear view of the two clues used by the rule.

Testing a location must visibly change the result. A failed location gives a calm explanation and lets the learner try again without resetting the mission.

---

## 11. Animation

- Use authored animation for the disputed shot and sensor replay
- Keep outcomes deterministic
- Use movement to show where the ball went, not to decorate the screen
- The sensor replay should show the rattle-out moving into the rim area and then leaving to the side
- Do not show abstract region labels or an ordered path diagram
- Avoid flashing and harsh failure effects

---

## 12. Copy rules

- Button labels: 1-3 words
- Prompts: one short sentence
- Feedback: no more than two short sentences when possible
- Prefer familiar words such as `rim`, `net`, `YES`, `NO`, and `point`
- Explain the word `AND` through the sentence `Both clues must be YES.`
- Keep learner-facing copy in `data/narration.js`

---

## 13. Audio and hints

- Preload all local audio
- Start background audio only after the first user interaction
- Duck background music during narration
- Never overlap narration clips
- Replay should replay only the current screen's narration
- Show a hint after 12 seconds of inactivity or after two unsuccessful attempts
- Hide the hint when the learner resumes interacting

---

## 14. Accessibility and classroom robustness

- Keyboard focus must be obvious
- Every image that communicates meaning needs useful alternative text
- Decorative images use empty alternative text
- All controls must be usable without precise dragging
- Correctness must use words/icons as well as color
- Reduced-motion mode should finish animations quickly without hiding the evidence
- Wrong attempts must never reset the whole mission

---

## 15. Performance and offline requirements

- Target 60 fps on a normal school laptop; 30 fps minimum
- Keep the first interactive screen fast
- Use compressed local images and WOFF2 fonts
- Do not make network requests after launch
- Support `file://` where browser rules allow it
- Include `Play.bat` and the local server fallback

---

## 16. QA checklist

### Learning

- [ ] The rattle-out is visibly different from a made basket.
- [ ] The final rule contains exactly two evidence checks joined by AND.
- [ ] The rattle-out produces YES + NO = NO POINT.
- [ ] The made basket produces YES + YES = POINT.
- [ ] No abstract path-ordering graphic appears.
- [ ] A Grade 6 learner can explain why both clues are needed.

### Interaction

- [ ] Yes and No prediction buttons both continue.
- [ ] The disputed shot ends before the call question appears.
- [ ] All three sensor spots can be selected and tested.
- [ ] Failed sensor tests allow another try.
- [ ] The beside-net test reveals the evidence board.
- [ ] Replay resets the mission.

### UI and accessibility

- [ ] The 16:9 layout stays stable without scrolling.
- [ ] Touch and keyboard input work.
- [ ] Focus states are visible.
- [ ] YES/NO and POINT/NO POINT remain readable without color.
- [ ] Reduced-motion mode still reveals the complete result.

### Offline

- [ ] No CDN or remote API is used.
- [ ] Images and fonts load locally.
- [ ] No console errors occur during a full playthrough.
- [ ] `node tools/e2e-four.js` completes successfully.
