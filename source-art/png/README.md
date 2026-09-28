# RimCheck PNG assets

Generated with the built-in image generation tool from ASSETS.md, using the user's school hallway illustration as the style and palette direction.

User overrides: separate PNG files; modern present-day school styling; warm cream, school blue, yellow, teal and maple palette; no futuristic theme. The source document's WEBP delivery direction is superseded.

The reference sheet is supporting art; each production asset is generated independently. Transparent backgrounds are requested for sprites and overlays. Audio, voice and fonts are outside this image-generation task.

`ui_skai_logo_mark.png` is an original placeholder concept, not an official SKAI logo.

Browse `gallery.html` for individual PNG links. `prompts.json` records the initial prompt set. The generator returns native dimensions rather than guaranteeing the requested dimensions; `manifest.json` records actual sizes and transparency checks. No resizing or image format conversion is applied.

Targeted generation corrections: the sensor-lock ring and ball shadow were regenerated without the world sheet to exclude unwanted reference objects. The three player groups were regenerated as square transparent cutouts after backdrop removal edits failed. Final group prompt direction: full-body elementary students in cream uniforms with blue side stripes and yellow piping, teal shoes, soft polished 2.5D school illustration, genuine alpha transparency, no floor or backdrop; cheering / puzzled / relaxed poses respectively.

These are standalone illustrations. Hoop/net pieces and trajectory overlays need positioning and scale alignment when integrated into a game; they are not a pre-registered animation rig.

Final verification: all 47 production PNGs decode successfully and contain visible content. All 43 non-background PNGs contain alpha transparency. Four background PNGs are opaque. The supporting world reference is an additional PNG, for 48 images total.

Final FX correction prompts: `fx_correct_spark` — only one golden four-point sparkle and two smaller teal glints, no other objects, transparent PNG; `fx_needs_fix` — only a soft amber pulse ring with faint peach glow, transparent PNG, no ball, objects or symbols.
