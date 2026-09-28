# RimCheck: Did It Count? — offline HTML5 mission

Grade 6 mission game built from `BUILD.md`, wearing the SKAI mission shell from the Figma file
"SKAI final" (section *Main*, node 618-9652). Vanilla HTML5 + CSS + JavaScript, no build step, no network.

## Run it

* **Double-click `Play.bat`** (Windows). With Node.js installed it serves the game at `http://localhost:8080/`; without Node it opens `index.html` directly.
* Or: `node serve.js` and open http://localhost:8080/
* Or: open `index.html` straight in Chrome or Edge (classic scripts, so `file://` works).

Press **F11** for full screen. The 1920×1080 stage scales to any window with letterboxing.

## Folder layout

```
something/
├─ FLOW.md · BUILD.md · ASSETS.md      specs (copies also live inside rimcheck/)
├─ source-art/                         raw inputs, not shipped
│  ├─ png/                             generated 1200–2000px PNG art (+ prompts.json, gallery.html)
│  ├─ figma-ui/                        Main.svg / Main-1.svg exports of the SKAI shell frames
│  └─ rimcheck_modern_png_assets.zip
└─ rimcheck/                           the game (ship this folder)
   ├─ index.html                       shell markup + script order
   ├─ css/                             tokens · layout (SKAI chrome) · components · screens · animations
   ├─ js/                              engine: state, router, scene (canvas), shots, rules, input, audio, narration, hint, progress, ui
   │  └─ screens/                      one module per screen (mount / unmount)
   ├─ data/                            narration.js (all copy) · shots.js (paths, hoop geometry, sensor spots) · voice_manifest.js
   ├─ assets/images/
   │  ├─ backgrounds/ characters/ props/ fx/ paths/   optimised game art (JPEG backgrounds, PNG sprites)
   │  └─ ui/skai/                      SKAI shell components exported from Figma as SVG (see below)
   ├─ assets/audio/voice/              drop recorded narration here (optional)
   ├─ assets/fonts/                    Fredoka One + Poppins (latin WOFF2, bundled)
   ├─ tools/optimize-assets.ps1        regenerates assets/images from ../source-art/png
   ├─ tools/strip-svg-bg.js            cleans freshly exported Figma SVGs (removes frame backgrounds / empty clipPaths)
   ├─ tools/e2e.js                     headless Chrome playthrough test
   └─ serve.js · Play.bat              offline launcher
```

## SKAI shell (from Figma)

`assets/images/ui/skai/` holds the design-system pieces, each an SVG at its Figma size:

| File | Figma layer | Used for |
|---|---|---|
| `gear_back.svg` | Group 1171279133 | Back button (top-left, 124px) |
| `logo_tag.svg` + `logo_mark.svg` | Group 1171279071 / Group 2590 | White corner tag with the SKAI mark. The mark is a **mark-only variant**: the word "Space" is stripped, per FLOW.md rule 6 |
| `gear_sound.svg` · `gear_info.svg` | Group 1171279146 / 2593 | Mute and Info gears (top-right, 93px) |
| `gear_close.svg` + `icon_close_x.svg` | Group 1171279147 / Union | Close gear on the info panel; the ring alone frames the Replay-narration gear |
| `timer_sign.svg` | Group 1171279095 + Volt | Hanging orange sign; counts down from the 35:00 mission budget shown in Figma (reaching zero has no effect) |
| `progress_frame.svg` | Group 1171279144 | Vertical progress bar (right edge); three story steps fill from the bottom, label reads `n/3` |
| `gear_hint.svg` | Group 2597 | Hint gear (bottom-left), appears after 12 s idle or two misses |
| `button_plate.svg` · `bolt.svg` | Rectangle 158 + Volt | Primary CTA: blue gradient plate with four bolts (`.btn-primary`), fixed bottom-centre as in the Main frame |
| `panel_info.svg` | Rectangle 128 | Skewed navy panel behind the info dialog |
| Cards frame (Rectangle 144) | | Reproduced in CSS as `--skai-card-grad` + orange top edge: `.panel`, `.btn-choice`, `.btn-call`, `.tray` |

Colours live in `css/tokens.css` (`--skai-*`). To refresh a component, export the node from Figma as SVG into that folder and run `node tools/strip-svg-bg.js`.

## Guide character

The guide is **Coach Riya** (`assets/images/characters/coach_riya_*.png`: idle, hello, curious, thinking, celebrate, point). FLOW.md still describes the original robot guide "Milo"; the game replaced him and all Milo art was removed. `RC.ui.coach.pose(name)` switches between the `<img data-pose>` entries in `index.html`; an unknown pose falls back to the first image. She stands still (no idle animation) so the scene does not feel synthetic.

## Sensor device

One box-style sensor with eight authored views in `assets/images/props/sensor_*.png` (520px, alpha). `data/shots.js` gives each mount a centre, an anchor on court hardware (`mountX/Y`) and the view that faces the court (`sensorView`); the bracket plate and arm are drawn on the canvas by `SensorMount` in `js/scene.js`. The old clamp-camera sensor and its interim versions were removed; `tools/optimize-assets.ps1` no longer generates sensor art.

Stylesheet roles: `layout.css` = the shell chrome above, `components.css` = cards, chips, slots, buttons, `screens.css` = base per-screen layout, `refinements.css` = per-screen position overrides that keep every tray clear of the bottom-centre CTA and the right-hand progress bar. Change positions in `refinements.css`; do not restyle the shell there.

## Audio

* **SFX and BGM are synthesised** with Web Audio at runtime, so nothing needs downloading. BGM starts on the first tap, ducks under narration.
* **Narration** uses recorded files when present, otherwise the browser's offline speech synthesis, with Riya's speech bubble as the visible fallback.
  Put files in `assets/audio/voice/` and list them in `data/voice_manifest.js`; wording lives in `data/narration.js`.
* The Info gear opens a panel with the current section and the last narration line, plus "Hear it again".

## Fonts

The type pairing comes from the Figma frame *font-pairing-fredoka-poppins* (node 25-4): **Fredoka One** for display text (title, section labels, panel titles, buttons, timer, progress) and **Poppins** 400 / 600 / 700 for UI and speech. Latin WOFF2 subsets are bundled in `assets/fonts/` under the SIL Open Font License and loaded by `css/fonts.css`, so no network request is made. Tokens: `--font-display` and `--font-ui` in `css/tokens.css`.

## Debug and QA

* `index.html?screen=N` jumps to screen N (1–4) with earlier steps pre-filled. Add `&fast=1` for instant narration, `&info=1` to open the info panel.
* `node tools/e2e-four.js <outDir>` verifies all four screens, the prediction choice, animated shot, sensor placement, and final replay state in headless Chrome.

## Offline check

1. Disable Wi-Fi. 2. Run `Play.bat`. 3. Play through the sensor test and press Replay Mission.
No CDN, analytics or fetch calls exist in the code; all fonts and art are local.
