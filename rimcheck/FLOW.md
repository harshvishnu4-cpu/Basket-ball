# FLOW.md — RimCheck Mission

## 1. Mission Purpose

**Working game name:** `RimCheck: Did It Count?`

> The game name is shown **only on the Title Screen**. It must never appear again after the player presses **Start Mission**.

### Target learner
- Grade 3
- Single-player mission
- Full-screen digital HTML game
- Mouse/touch friendly
- Designed for 16:9 screens
- No scrolling
- Works fully offline

### Core capability
The learner should understand that a machine should not decide an event from one instant alone. A reliable detection rule may need to look at a **short sequence of what happened**.

### Learning arc
The learner experiences this idea in this order:

**Dispute → Try a sensor → Discover placement matters → Make a simple rule → Watch it fail → Notice the event sequence → Build a better rule → Test it → Transfer the idea independently**

The game should never explain the abstract principle before the learner experiences the failure that makes the principle necessary.

---

# 2. Non-Negotiable Experience Rules

1. The experience must feel like a game, not a webpage.
2. Use the full viewport.
3. No browser-style tabs, cards, dashboards, side menus, long text blocks, or scrolling.
4. Keep one clear action per screen.
5. Do not show:
   - “SKAI Space” as text
   - “Grade”
   - “Stage”
   - “Screen”
6. Use the SKAI **logo mark** in the fixed top bar, but do not spell out “SKAI Space.”
7. The mission name appears only on the Title Screen.
8. After the Title Screen, the top bar may show a short **section label**, such as:
   - `Court Trouble`
   - `Sensor Test`
   - `Rule Lab`
   - `Final Call`
9. Narration carries most instructions. Do not duplicate narration as large text.
10. Primary CTA appears only when the required interaction is complete.
11. Hint appears only after **12 seconds of inactivity** on screens where a hint is useful.
12. Every interaction must have clear hover, selected, correct, incorrect, disabled, and completed feedback where relevant.
13. Avoid harsh “wrong” punishment. Incorrect attempts should be treated as evidence that helps improve the rule.
14. Do not require reading-heavy instructions.
15. No interaction should require fine motor control.

---

# 3. Standard Mission Shell

## Aspect ratio
Design master: **1920 × 1080, 16:9**

Use proportional scaling with letterboxing/pillarboxing when needed. Never stretch artwork.

## Safe area
Keep all important interactive content inside:
- X: 90–1830
- Y: 70–1010

## Fixed top bar
Shown from Screen 2 onward.

### Left
- Back button
- Fixed position

### Center
- Current section label
- Not the game name

### Right
- SKAI logo mark
- Timer only when a timed sequence is actively playing
- Replay button only when narration/video can be replayed

## Progress
A vertical mission progress indicator remains fixed on the right side from Screen 2 onward.

Use **6 mission pips**, based on conceptual progress rather than raw screen count:

1. Meet the problem
2. Place the sensor
3. Build a rule
4. Find the failure
5. Fix the rule
6. Make the final call

## Primary CTA
Fixed lower-right area.

Examples:
- `Try It`
- `Test Rule`
- `Lock Rule`
- `Make the Call`
- `Finish`

Do not display a CTA until the learner has completed the required interaction.

---

# 4. Story World

## Setting
A bright school basketball court during a friendly game.

Visual tone:
- energetic
- modern
- kid-friendly
- sporty
- slightly futuristic
- clean, not cluttered

The court is the common visual world for the whole mission. The game should feel like one continuous event rather than separate disconnected mini-games.

## Main character
**Milo**, a small friendly court-helper robot.

Role:
- curious, not all-knowing
- asks the learner for help
- celebrates reasoning rather than speed
- never gives the final answer before the learner has a chance to infer it

Milo should have simple readable expressions:
- curious
- surprised
- thinking
- happy
- encouraging

---

# 5. Full Storyboard and Game Flow

## SCREEN 1 — Title Screen

### Section
None

### Visual
Full basketball court background at a calm moment.

Center:
- Game name: **RimCheck: Did It Count?**
- `Start Mission` button

Nothing else.

### Audio
Soft court ambience.
Light upbeat mission music begins.

### Interaction
Click/tap `Start Mission`.

### Transition
Camera pushes toward the hoop.

---

## SCREEN 2 — Character Introduction

### Section label
`Court Trouble`

### Visual
Milo rolls in beside the sideline.

The court is active in the background but visually softened so Milo remains the focus.

### Narration
> “Hi! I’m Milo. I help watch the court. But today I need your eyes and your ideas.”

### On-screen text
Only:
`Milo`

Optional tiny speech line:
`Can you help me make a fair call?`

### Interaction
After narration, show `Let’s Go`.

### Learning function
Establishes the helper relationship without explaining the solution.

---

## SCREEN 3 — The Disputed Shot

### Section label
`Court Trouble`

### Visual sequence
A short 4–5 second in-engine animation:

1. Player takes a shot.
2. Ball hits the rim hard.
3. Ball dips toward the hoop.
4. Ball rattles.
5. Ball bounces back out.
6. Two groups of kids react differently.

No referee is present.

### Narration
> “Whoa! Some players say it went in. Others say it didn’t. There’s no referee. Could a machine make the call?”

### Interaction
Two large choice buttons:
- `Maybe`
- `Let’s test it`

Both choices continue.

If `Maybe`:
Milo says:
> “Good thinking. A machine needs a clear way to decide.”

If `Let’s test it`:
Milo says:
> “Yes! First, we need to know what the machine can notice.”

### CTA
`Test a Sensor`

### Learning function
Creates the authentic need for a detection rule.

---

## SCREEN 4 — Sensor Placement Experiment

### Section label
`Sensor Test`

### Visual
The hoop fills the center of the screen.

A sensor device appears in a tray at the bottom.

Three large snap zones glow when hovered:

A. high on the backboard  
B. far on the court-side pole  
C. beside the hoop with a clear view of the ball path

### Narration
> “A sensor can only judge what it can see. Try placing it where it can best watch the ball near the hoop.”

### Interaction
Drag the sensor into one of the three snap zones.

After placement, the learner presses `Try It`.

### Test behavior

#### Position A — Backboard
Play two quick shots:
- bank shot
- rim hit

Sensor flashes constantly.

Milo:
> “It notices lots of hits, but it’s hard to tell what the ball really did.”

#### Position B — Far pole
Play one fast shot.

Sensor loses the ball behind players/hoop.

Milo:
> “It misses part of the action.”

#### Position C — Beside hoop
Play the same shot.

A translucent tracking arc clearly follows:
- above rim
- hoop area
- below net

Milo:
> “Nice view. It can follow the ball around the hoop.”

### Completion
The screen is complete only after the learner tests Position C.

### Hint after 12 seconds
A small hint icon pulses.

On tap:
> “Try a place with a clear view of the whole hoop.”

### Learning function
The learner discovers that **sensor placement changes what evidence is available**.

---

## SCREEN 5 — Build the First Rule

### Section label
`Rule Lab`

### Visual
The sensor remains beside the hoop.

Show one simplified event strip:

`BALL SEEN IN HOOP AREA`

Below it is a machine rule builder with two large pieces:

`IF ball is seen in the hoop area`
→
`COUNT 1 POINT`

### Narration
> “Now the machine needs a rule. What should it do when it detects the ball near the hoop?”

### Interaction
The learner drags the `COUNT 1 POINT` action onto the rule line.

Then `Test Rule` activates.

### Expected rule
`IF ball is seen in the hoop area → COUNT 1 POINT`

This rule is intentionally too simple.

### Learning function
The learner builds a plausible but incomplete rule before seeing why it fails.

---

## SCREEN 6 — Rule Test: It Works… Until It Doesn’t

### Section label
`Rule Lab`

### Visual
A test console overlays the live court.

Three mystery shots are tested one by one.

### Shot 1 — Clean swish
Ball path:
`above → hoop → below`

Machine:
`POINT`

Feedback:
Milo celebrates briefly.

### Shot 2 — Bank shot that scores
Ball path:
`above → backboard → hoop → below`

Machine:
`POINT`

Feedback:
Milo:
> “Still good.”

### Shot 3 — Hard rattle-out
Ball path:
`above → hoop area → side/out`

The simple rule sees the ball in the hoop area and outputs:
`POINT`

But the ball visibly bounces out.

Players react:
`No basket!`

Machine result pulses red.

### Narration
> “Uh-oh. The sensor saw the ball near the hoop… but the ball came back out. The machine made the wrong call.”

### Interaction
The learner taps `Why?`

Then two large evidence choices appear:
- `It looked at only one moment`
- `The hoop is the wrong color`

Correct:
`It looked at only one moment`

If wrong:
The option gently shakes, then Milo says:
> “Look at what changed from start to finish.”

### Completion
After correct choice:
`Fix the Rule` activates.

### Learning function
Creates the key cognitive conflict:
**detection at one instant is not enough**.

---

## SCREEN 7 — Find the Shape of a Score

### Section label
`Rule Lab`

### Visual
Freeze the game world into a clean analysis view.

Show three large zones around the hoop:
- `ABOVE`
- `HOOP`
- `BELOW`

At the bottom, show three event cards:
- Above
- Hoop
- Below

### Narration
> “A real score has a shape. The ball starts above, moves through the hoop, then ends below. Build that order.”

### Interaction
Drag the three event cards into three ordered slots.

Expected:
`ABOVE → HOOP → BELOW`

### Incorrect handling
If the learner submits an incorrect order:
- cards bounce back
- replay a tiny ghost trail of a made basket
- no negative buzzer

### Correct feedback
The ball path animates across the three zones.

Milo:
> “That’s the whole event—not just one moment.”

### CTA
`Build Better Rule`

### Learning function
Makes the sequence visible and manipulable.

---

## SCREEN 8 — Build the Better Rule

### Section label
`Rule Lab`

### Visual
Rule builder now has three ordered condition slots.

Available chips:
- `Ball above`
- `Ball in hoop`
- `Ball below`
- `Ball beside hoop`
- `Rim shakes`

Action chip:
- `COUNT 1 POINT`

### Narration
> “Use the three moments that prove the ball really passed through.”

### Interaction
Learner places:
1. `Ball above`
2. `Ball in hoop`
3. `Ball below`

Then connects:
`COUNT 1 POINT`

Final visible rule:

`ABOVE → HOOP → BELOW = POINT`

Keep this visually simple. Do not use programming syntax.

### Wrong combinations
Allow experimentation.

Examples:
- `Rim shakes → point`
- `Above → hoop → point`
- `Hoop → below → point`

Do not block placement.

`Lock Rule` activates once three sequence slots and the action are filled.

### On lock
Milo:
> “Let’s see if your rule can tell a score from a rattle-out.”

### Learning function
Learner converts observed event structure into a detection rule.

---

## SCREEN 9 — Challenge Test

### Section label
`Final Call`

### Visual
No tutorial overlays.

Run four randomized but predetermined shots:

1. Clean swish
2. Hard rattle-out
3. Bank shot score
4. Rim miss

For each shot:
- play animation
- machine applies learner rule
- learner predicts `POINT` or `NO POINT`
- reveal machine call
- compare to true outcome

### Correct target behavior
- Swish → POINT
- Rattle-out → NO POINT
- Bank score → POINT
- Rim miss → NO POINT

### Rule validation
If the learner built the correct sequence:
all four calls succeed.

If not:
show which event fooled the rule and return the learner to Screen 8 with the current rule preserved.

Do not restart the mission.

### Feedback language
Use:
- `That rule held up.`
- `This shot fooled the rule.`
- `Check the order of the ball’s path.`

Avoid:
- `You failed`
- `Wrong again`

### Completion
When all four are correctly handled:
`Use It on a New Court`

### Learning function
Confirms the rule before transfer.

---

## SCREEN 10 — Independent Transfer: Two Hoops, No Referee

### Section label
`Final Call`

### Visual
A new court arrangement with **two hoops**.

Milo moves to the edge and does not guide the process.

Each hoop gets:
- a sensor placement spot
- a compact three-step sequence rule strip

### Narration
> “New court. Two hoops. No referee. Set up both machines so they can make the call on their own.”

No extra hints initially.

### Interaction — Part A
For Hoop 1:
- choose sensor position
- build the sequence

For Hoop 2:
- choose sensor position
- build the sequence

The learner should independently reproduce:
- useful sensor placement beside each hoop
- `ABOVE → HOOP → BELOW`

### Interaction — Part B
Press `Run Game`.

Two disputed shots occur nearly back-to-back:
- Hoop 1: rattle-out
- Hoop 2: clean score

Machines make calls independently.

### Success
Hoop 1:
`NO POINT`

Hoop 2:
`POINT`

Crowd reacts happily because the calls are consistent.

### Failure
If one setup is wrong:
- freeze only that hoop
- show the detected path
- let learner repair only that setup
- do not reset the other hoop

### Hint after 12 seconds
Only after inactivity:
> “What must the sensor see from the start of a score to the end?”

### Learning function
Unaided transfer proves the learner can apply the reasoning beyond the original example.

---

## SCREEN 11 — Mission Reflection / Outcome

### Section label
`Complete`

### Visual
Court lights brighten slightly.
Milo stands beside a compact visual recap.

Do not show the game title.

### Recap animation
Three icons animate in order:

1. Sensor beside hoop
2. Path: `ABOVE → HOOP → BELOW`
3. Machine gives correct call

### Narration
> “You made the machine watch the whole event. You chose a useful sensor view, found a rule that could be fooled, and fixed it by tracking the ball’s path.”

### On-screen text
Keep minimal:

`You built a rule that watches what happened, not just one moment.`

### Completion badge text
`Court Rule Builder`

### Buttons
- `Replay Mission`
- optional `Exit`

No score, stars, percentage, or leaderboard is required.

---

# 6. Learning Logic

## What the learner should infer

### First idea
A sensor must be positioned where it can observe useful evidence.

### Second idea
A single detection can be ambiguous.

### Third idea
Some events are recognized by their **ordered pattern**.

### Fourth idea
A rule should be tested with cases that can trick it.

### Fifth idea
When a rule fails, improve the weak part instead of rebuilding everything.

---

# 7. Interaction Pattern Map

| Moment | Interaction | Why it exists |
|---|---|---|
| Dispute | Choice | Creates agency |
| Sensor experiment | Drag + test | Makes placement causal |
| First rule | Drag rule piece | Builds commitment |
| Failure | Evidence choice | Focuses attention on why |
| Event shape | Sequence ordering | Makes temporal reasoning concrete |
| Better rule | Rule construction | Encodes learning |
| Challenge test | Predict + observe | Verifies reasoning |
| Two-hoop transfer | Independent setup | Checks transfer |

---

# 8. Hint Rules

Hint icon must not stay visible permanently.

## Trigger
Show after:
- 12 seconds with no pointer/touch interaction, or
- two unsuccessful attempts on the same action

## Hint behavior
1. Small icon softly appears.
2. Does not cover the main interaction.
3. Tapping it plays one short narrated clue.
4. Never gives the entire answer on first use.

## Hint escalation
First hint:
focuses attention.

Second hint:
shows a partial visual clue.

Do not add a third hint. Instead simplify the interaction subtly.

---

# 9. Feedback System

## Correct
- gentle scale-up
- green/teal glow
- short positive SFX
- 500–900 ms
- narration only when educationally useful

## Incorrect
- small horizontal nudge or soft shake
- amber/red outline
- neutral correction sound
- preserve the learner’s current work where possible

## Completed
- interaction locks
- progress pip fills
- CTA becomes active

---

# 10. Audio Direction

## Narrator
- warm Indian accent
- clear Grade 3 vocabulary
- lively but not cartoonishly exaggerated
- slightly slower than normal adult speech
- one instruction per sentence

## Milo
Can share the narrator voice or use a slightly lighter character voice.

## BGM
One continuous sporty-tech loop.

Requirements:
- no vocals
- low complexity
- no sharp high-frequency elements
- loop cleanly
- duck to 25–35% volume during speech

## SFX family
Use one consistent court-tech sound family:
- UI hover
- UI press
- sensor scan
- sensor lock
- ball bounce
- rim hit
- swish
- crowd murmur
- correct
- needs-fix
- completion

---

# 11. Transition Rules

Use short transitions:
- 250–450 ms UI transitions
- 500–800 ms scene moves
- no long loading-style animations

Preferred:
- camera pan
- court light sweep
- scoreboard wipe
- ball-path trail transition

Avoid:
- page slides that feel like a website
- full-screen white flashes
- unrelated decorative transitions

---

# 12. Quality Check Before Build Is Approved

The flow is ready only if all answers are YES:

- Does the game name appear only on Screen 1?
- Is the second screen the character introduction?
- Is the core problem experienced before being explained?
- Does sensor placement visibly change the evidence?
- Does the learner build an initially flawed rule?
- Does that rule fail in a believable rattle-out example?
- Does the learner discover a sequence rather than receive it immediately?
- Can the learner build `ABOVE → HOOP → BELOW` themselves?
- Is the improved rule tested against multiple cases?
- Is there a final unaided two-hoop transfer?
- Can a learner recover from a mistake without restarting?
- Is narration not duplicated as large on-screen text?
- Is there no scrolling?
- Is the interaction readable at 16:9?
- Are hints delayed rather than permanent?
- Does the ending state what the learner actually did and learned?

If any answer is NO, revise the flow before asset generation or coding.
