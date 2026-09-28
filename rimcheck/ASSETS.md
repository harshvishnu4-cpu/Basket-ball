# ASSETS.md — RimCheck Mission Asset Specification

## 1. Asset Goal

Create a unified asset set for the basketball detection-rule mission defined in `FLOW.md`.

All visual assets should look like they belong to the **same game world**.

The most important quality rule is consistency:
- same camera logic
- same lighting direction
- same rendering style
- same court materials
- same character proportions
- same color system
- same perspective
- same level of detail

Do not generate each asset as if it belongs to a different illustration.

---

# 2. Visual Style

## Overall
- polished 2.5D game art
- clean kid-friendly stylization
- Grade 3 appropriate
- soft dimensional shading
- clear silhouettes
- colorful but not noisy
- modern school basketball environment
- mild futuristic sports-tech accents
- no cyberpunk clutter
- no photorealism
- no gritty texture
- no excessive detail

## Rendering
- smooth surfaces
- controlled gradients
- soft ambient shadows
- subtle rim lighting
- slightly exaggerated readable forms
- minimal texture noise
- crisp game-ready edges

## Mood
- exciting
- fair
- curious
- playful
- problem-solving

---

# 3. World Continuity Rules

Every background and prop must share:

### Camera
- eye-level to slightly low game camera
- court depth visible
- hoop readable at all times
- avoid extreme fisheye distortion

### Lighting
- bright indoor school gym
- main light from upper-left/front
- soft fill from court
- no harsh dramatic shadows

### Court palette
Use the Figma color system if provided.

Suggested fallback families:
- warm maple floor
- deep navy structural elements
- cyan/teal tech accents
- warm orange basketball/rim
- white markings
- small lime/green success accents
- amber correction accents

Do not let background colors overpower interaction UI.

---

# 4. Image Format

Generate:
- WEBP for raster assets
- transparent WEBP for isolated characters/props where alpha is required

Keep source PNG only during creation if needed, but final game should use optimized WEBP.

---

# 5. Master Asset Naming

Use lower snake_case.

Examples:
- `bg_court_title.webp`
- `milo_idle.webp`
- `prop_sensor_device.webp`
- `fx_sensor_scan.webp`

Do not use:
- spaces
- capital letters
- random version names like `final2_new_latest.webp`

---

# 6. Background Assets

## A01 — Title Court

**Filename:** `bg_court_title.webp`

**Size:** 1920 × 1080

**Use:** Screen 1

**Description:**
A polished indoor school basketball court. One hoop is visible in the middle-to-right area. The center should leave clean visual space for the title and Start Mission button. No players. No referee. No text. No logo.

**Composition:**
- clear center title zone
- court floor gives depth
- hoop visible but not dominant
- soft background crowd/gym details only if very minimal

**Prompt direction:**
“2.5D stylized school basketball gym for a Grade 3 educational game, bright polished maple court, clean hoop and backboard, modern friendly sports environment, subtle futuristic sports-tech details, soft dimensional lighting, uncluttered center space for title, no text, no people, 16:9, consistent game art”

---

## A02 — Main Court Gameplay

**Filename:** `bg_court_game.webp`

**Size:** 1920 × 1080

**Use:** Screens 2–9

**Description:**
Same court as title, but camera positioned closer to the primary hoop.

**Must include clear regions for:**
- player shot origin
- hoop
- sensor placement zones
- Milo position
- UI overlays

No embedded players.

---

## A03 — Two-Hoop Court

**Filename:** `bg_court_two_hoops.webp`

**Size:** 1920 × 1080

**Use:** Screen 10

**Description:**
Same school gym world, wider camera showing two usable hoops with enough separation to configure each independently.

Both hoops should feel part of the same court, not mirrored duplicates.

---

## A04 — Completion Court

**Filename:** `bg_court_complete.webp`

**Size:** 1920 × 1080

**Use:** Screen 11

**Description:**
Same court with subtly brighter celebratory lighting and slightly calmer composition.

Do not add confetti directly into the background.

---

# 7. Milo Character Assets

## Character design
Milo is a small friendly court-helper robot.

### Shape language
- rounded
- compact
- stable stance
- no sharp dangerous parts
- simple face display or expressive eyes
- sports-tech look

### Avoid
- humanoid realism
- militaristic robot styling
- excessive cables
- tiny visual details
- overly babyish proportions

### Suggested colors
Follow Figma system.
Fallback:
- white/light neutral shell
- navy structure
- cyan/teal light accents
- tiny orange sports accent

All Milo assets should be transparent WEBP.

---

## C01 — Milo Idle

**Filename:** `milo_idle.webp`

**Canvas:** 900 × 1100 transparent

Use:
- general dialogue
- completion
- waiting states

Pose:
friendly neutral standing/rolling pose.

---

## C02 — Milo Hello

**Filename:** `milo_hello.webp`

**Canvas:** 900 × 1100 transparent

Use:
Screen 2.

Pose:
one arm raised in a welcoming wave.

Expression:
happy and confident.

---

## C03 — Milo Curious

**Filename:** `milo_curious.webp`

**Canvas:** 900 × 1100 transparent

Use:
Screen 3 and exploratory moments.

Pose:
slight lean toward hoop.

Expression:
curious.

---

## C04 — Milo Thinking

**Filename:** `milo_thinking.webp`

**Canvas:** 900 × 1100 transparent

Use:
when rule fails.

Pose:
hand/arm near chin or side of head.

Expression:
focused, not sad.

---

## C05 — Milo Celebrate

**Filename:** `milo_celebrate.webp`

**Canvas:** 900 × 1100 transparent

Use:
correct sequence and mission complete.

Pose:
small victory gesture.

Avoid:
huge confetti baked into asset.

---

## C06 — Milo Pointing

**Filename:** `milo_pointing.webp`

**Canvas:** 900 × 1100 transparent

Use:
optional subtle guidance.

Pose:
pointing sideways so the UI can position him next to a clue.

---

# 8. Player / Court Character Assets

Keep human characters secondary.

Use a consistent small group of 4–6 diverse school-age basketball players.

Do not make any one child the “main hero.”

All transparent WEBP.

## P01 — Shooter

`player_shooter_ready.webp`

Pose:
holding basketball before shot.

## P02 — Shooter Release

`player_shooter_release.webp`

Pose:
arms extended after release.

## P03 — Group Reaction Left

`players_react_yes.webp`

2–3 students gesturing that the shot counted.

## P04 — Group Reaction Right

`players_react_no.webp`

2–3 students gesturing that it did not count.

## P05 — Neutral Players

`players_waiting.webp`

Use in background moments.

### Character rules
- Grade 3/elementary age appearance
- school sports clothing
- no branded uniforms
- no readable jersey text
- friendly body language

---

# 9. Basketball Assets

## B01 — Ball

**Filename:** `ball_basketball.webp`

**Canvas:** 512 × 512 transparent

Clean readable basketball.

Generate without motion blur.

Motion blur should be created in CSS/canvas, not baked into the base asset.

---

## B02 — Ball Shadow

**Filename:** `ball_shadow.webp`

**Canvas:** 512 × 256 transparent

Soft elliptical floor shadow.

Optional if rendered dynamically.

---

# 10. Hoop Assets

If the hoop cannot be separated cleanly from the background for animation/debug overlays, generate separate pieces.

## H01 — Hoop Assembly

`hoop_main.webp`

Transparent.

Includes:
- backboard
- rim
- net
- mounting structure

Front three-quarter view matching gameplay background camera.

## H02 — Rim Highlight Mask

`hoop_rim_highlight.webp`

Transparent.
Used for:
- sensor visualization
- hit pulse

## H03 — Net Foreground

`hoop_net_front.webp`

Transparent.

Optional.
Allows ball to pass visually “inside” the hoop by layering:
- back hoop layer
- ball
- front net layer

This improves depth.

---

# 11. Sensor Assets

## S01 — Sensor Device

**Filename:** `sensor_device.webp`

**Canvas:** 520 × 520 transparent

Design:
- small clampable court sensor
- rounded body
- one visible lens/receiver
- teal indicator light
- sturdy but friendly

Should look movable by a child.

---

## S02 — Sensor Scanning Glow

`fx_sensor_scan.webp`

Transparent.

Soft radial or cone scan effect.

Do not add words.

---

## S03 — Sensor Locked Glow

`fx_sensor_locked.webp`

Transparent.

Small confirmation ring.

---

## S04 — Sensor Noisy Detection

`fx_sensor_noise.webp`

Transparent.

Several overlapping soft detection rings.

Use to show why backboard placement is confusing.

---

## S05 — Sensor Occlusion

`fx_sensor_occluded.webp`

Transparent.

A broken/dotted tracking beam or interrupted scan.

Use to show far-pole placement missing the ball.

---

# 12. Detection Zone Assets

Prefer CSS/canvas for simple translucent zones.

If art assets are needed:

## D01
`zone_above.webp`

## D02
`zone_hoop.webp`

## D03
`zone_below.webp`

Style:
- translucent
- soft rounded geometry
- visually distinct
- not text-heavy

The words `ABOVE`, `HOOP`, and `BELOW` should be rendered as HTML text for localization and crispness.

---

# 13. Ball Path Assets

Prefer dynamically drawn SVG/canvas paths.

If static helper overlays are useful:

## T01 — Valid Score Path

`path_score.webp`

Transparent.

Visual:
curved line moving:
above → through hoop → below.

## T02 — Rattle-Out Path

`path_rattle_out.webp`

Transparent.

Visual:
above → hoop → side/out.

## T03 — Bank Score Path

`path_bank_score.webp`

Transparent.

Visual:
above → backboard → hoop → below.

## T04 — Rim Miss Path

`path_rim_miss.webp`

Transparent.

Visual:
above → rim → side.

Use subtle dotted trail with arrowless movement if possible.

---

# 14. Rule Builder Assets

Prefer reusable UI components made in HTML/CSS.

Only create decorative art where necessary.

## R01 — Rule Slot Frame

`ui_rule_slot.webp`

Transparent.

Rounded inset slot.

## R02 — Rule Chip Base

`ui_rule_chip.webp`

Transparent.

No text baked in.

## R03 — Rule Connector

`ui_rule_connector.webp`

Transparent.

Simple arrow/flow connector.

All labels should remain HTML text.

---

# 15. Progress Assets

Prefer CSS.

If art-driven:

## U01
`ui_progress_pip_empty.webp`

## U02
`ui_progress_pip_active.webp`

## U03
`ui_progress_pip_complete.webp`

Must remain visually consistent with the Figma mission system.

---

# 16. Navigation and Utility Assets

Use Figma-exported assets where available.

Required:
- `ui_icon_back.webp`
- `ui_icon_replay.webp`
- `ui_icon_hint.webp`
- `ui_icon_audio_on.webp`
- `ui_icon_audio_off.webp`
- `ui_skai_logo_mark.webp`

Important:
The logo asset may contain the visual SKAI mark, but no visible text reading `SKAI Space`.

If the existing Figma logo includes that wording, create/use a mark-only variant for this mission.

---

# 17. Button Visuals

Recommended:
build buttons with CSS, using Figma colors and local font.

Do not generate every button as an image because:
- text becomes harder to update
- scaling is worse
- hover/disabled states are harder to maintain

Generate only optional decorative button overlays if the design system requires them.

---

# 18. Effect Assets

## F01 — Correct Spark

`fx_correct_spark.webp`

Small, clean, non-confetti success sparkle.

## F02 — Needs-Fix Pulse

`fx_needs_fix.webp`

Soft amber/red pulse.

Not an explosion or failure symbol.

## F03 — Completion Glow

`fx_completion_glow.webp`

Soft celebratory halo.

---

# 19. Shot Animation Asset Strategy

Do not generate separate images for every animation frame.

Use:
- one ball sprite
- authored motion paths
- optional motion blur via CSS/canvas
- hoop front/back layering
- player start/release poses

This gives:
- smaller package
- cleaner motion
- easier iteration
- consistent event timing

---

# 20. Audio Assets

Store everything locally.

## BGM

### `bgm_court_mission_loop.ogg`
Length:
45–90 seconds loop.

Style:
- upbeat
- sporty
- light tech
- kid-friendly
- no vocals
- not too busy

Create seamless loop.

---

## Court SFX

### `sfx_ball_bounce_01.ogg`
Short realistic but softened bounce.

### `sfx_ball_bounce_02.ogg`
Variation.

### `sfx_rim_hit_01.ogg`
Metallic rim hit, not harsh.

### `sfx_rim_rattle.ogg`
Short rattle sequence.

### `sfx_swish.ogg`
Clear net swish.

### `sfx_crowd_murmur.ogg`
Low-volume reaction.

### `sfx_crowd_cheer_short.ogg`
Short positive group reaction.

---

## UI SFX

### `sfx_ui_hover.ogg`
Very subtle.

### `sfx_ui_press.ogg`
Soft sports-tech click.

### `sfx_sensor_scan.ogg`
Short scanning tone.

### `sfx_sensor_lock.ogg`
Positive lock-in sound.

### `sfx_correct.ogg`
Short warm confirmation.

### `sfx_needs_fix.ogg`
Neutral correction cue.

### `sfx_progress.ogg`
Tiny progress fill sound.

### `sfx_complete.ogg`
Short mission-complete sting.

---

# 21. Voice Assets

Preferred format:
OGG or MP3.

Use consistent:
- Indian accent
- warm adult or young-adult narrator
- clear Grade 3 pacing
- energetic but calm
- no exaggerated cartoon voice

File naming:

```text
voice_02_intro.ogg
voice_03_dispute.ogg
voice_04_sensor_instruction.ogg
voice_04_sensor_backboard.ogg
voice_04_sensor_far.ogg
voice_04_sensor_good.ogg
voice_05_first_rule.ogg
voice_06_rule_fail.ogg
voice_06_failure_clue.ogg
voice_07_sequence.ogg
voice_07_sequence_correct.ogg
voice_08_better_rule.ogg
voice_09_test_intro.ogg
voice_10_transfer.ogg
voice_10_hint.ogg
voice_11_complete.ogg
```

Keep narration files small and modular so one line can be replaced without regenerating everything.

---

# 22. Font Assets

The user will download fonts.

Recommended font roles:

## Display font
Use only:
- title screen
- completion badge

Characteristics:
- rounded
- playful
- highly readable
- not childish bubble lettering

## UI font
Use everywhere else.

Characteristics:
- rounded sans-serif
- strong numeral readability
- clear uppercase labels
- excellent readability at 24–36 px

Store:

```text
assets/fonts/display.woff2
assets/fonts/ui_regular.woff2
assets/fonts/ui_semibold.woff2
assets/fonts/ui_bold.woff2
```

Do not make the game dependent on the exact font filenames if the final selection changes. Define font tokens in CSS.

---

# 23. Asset Generation Prompt Template

Use this base at the beginning of every ChatGPT image-generation prompt:

> “Create a game-ready asset for the same visual world as a polished Grade 3 basketball mission: clean 2.5D stylized school gym, friendly modern sports-tech design, soft dimensional lighting from upper-left/front, smooth gradients, clean silhouettes, minimal texture noise, consistent maple court / navy / cyan / warm orange visual system, no text, no logos unless explicitly requested, no photorealism, no clutter. Maintain exactly the same camera, lighting logic, rendering quality, and world design as the previously generated RimCheck assets.”

Then append the asset-specific instruction.

---

# 24. Consistency Sheet to Generate First

Before generating all production assets, create one master reference sheet containing:

1. Milo front 3/4
2. Milo side
3. Milo color swatches
4. sensor device
5. basketball
6. hoop crop
7. court material crop
8. UI shape samples
9. lighting sample
10. line/edge treatment sample

**Filename:**
`reference_world_style.webp`

Use this as the visual reference for every later image-generation request.

This is the single most important step for reducing visual iteration.

---

# 25. Recommended Generation Order

Generate in this order:

1. `reference_world_style.webp`
2. `bg_court_game.webp`
3. `bg_court_title.webp`
4. `bg_court_two_hoops.webp`
5. `bg_court_complete.webp`
6. Milo pose set
7. hoop layered assets
8. sensor device + FX
9. player poses
10. basketball
11. path helper visuals
12. effects
13. UI icons not already supplied from Figma
14. audio
15. voice
16. fonts

Do not start generating minor FX before the world reference and main court are approved.

---

# 26. Asset-to-Screen Mapping

| Screen | Primary assets |
|---|---|
| 1 | bg_court_title, title font, start button |
| 2 | bg_court_game, milo_hello |
| 3 | bg_court_game, shooter poses, ball, hoop layers, player reaction groups, milo_curious |
| 4 | bg_court_game, sensor_device, sensor_scan, sensor_noise, sensor_occluded, ball, hoop |
| 5 | bg_court_game, sensor_device, rule UI |
| 6 | bg_court_game, ball, hoop, player reactions, milo_thinking, needs-fix FX |
| 7 | bg_court_game, zone overlays, score path, rule cards |
| 8 | bg_court_game, rule UI, event chips |
| 9 | bg_court_game, all shot path logic assets, sensor effects |
| 10 | bg_court_two_hoops, two sensor instances, ball, rule UI |
| 11 | bg_court_complete, milo_celebrate, completion glow |

---

# 27. Quality Rules for Generated Images

Reject and regenerate an asset if it has:
- different camera angle from the world
- inconsistent rim/backboard design
- different court floor material
- different Milo proportions
- muddy edges
- visible compression artifacts
- unwanted text
- extra logos
- random props
- unnecessary background clutter
- photorealistic textures
- incorrect transparency
- distorted basketball geometry
- deformed hands/robot limbs
- inconsistent lighting

---

# 28. Final Asset Checklist

## Backgrounds
- [ ] title court
- [ ] main court
- [ ] two-hoop court
- [ ] completion court

## Character
- [ ] Milo idle
- [ ] Milo hello
- [ ] Milo curious
- [ ] Milo thinking
- [ ] Milo celebrate
- [ ] Milo pointing

## Players
- [ ] shooter ready
- [ ] shooter release
- [ ] yes reaction group
- [ ] no reaction group
- [ ] neutral group

## Court props
- [ ] basketball
- [ ] hoop assembly
- [ ] rim highlight
- [ ] optional front net layer

## Sensor
- [ ] sensor device
- [ ] scan
- [ ] lock
- [ ] noise
- [ ] occlusion

## Rule/gameplay
- [ ] rule slot
- [ ] rule chip
- [ ] connector
- [ ] path helpers if not dynamic
- [ ] zone overlays if not dynamic

## UI
- [ ] back
- [ ] replay
- [ ] hint
- [ ] audio on
- [ ] audio off
- [ ] SKAI logo mark

## FX
- [ ] correct
- [ ] needs-fix
- [ ] completion glow

## Audio
- [ ] BGM
- [ ] bounce variations
- [ ] rim hit
- [ ] rattle
- [ ] swish
- [ ] crowd
- [ ] UI feedback
- [ ] sensor feedback
- [ ] completion sting

## Voice
- [ ] all narration clips

## Fonts
- [ ] display
- [ ] UI regular
- [ ] UI semibold
- [ ] UI bold

Before coding the full game, verify that the title background, main court, Milo, sensor, hoop, and UI system already look like one coherent world.
