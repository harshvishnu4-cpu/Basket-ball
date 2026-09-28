/* Figma node exports carry the parent frames' baggage: a component-size grey rect, the 1959x1102 frame rect,
   the section's huge outline path, and a clipPath that becomes empty once the frame rect is gone (an empty
   clipPath hides everything). This strips all of it so the component SVGs are clean and transparent.
   Usage: node tools/strip-svg-bg.js */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'images', 'ui', 'skai');
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.svg'))) {
  const p = path.join(dir, f); let s = fs.readFileSync(p, 'utf8'); const before = s.length;
  // component-size / frame-size background rects (solid greys, no id)
  s = s.replace(/<rect(?![^>]*\bid=)[^>]*fill="#(?:434343|5D5D5D|5d5d5d|7B7B7B|7b7b7b)"[^>]*\/>\s*/g, '');
  s = s.replace(/<rect[^>]*width="1959\.11"[^>]*\/>\s*/g, '');
  // section background / outline paths: start coordinate far outside any component's viewBox
  s = s.replace(/<path d="M(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)[^"]*"[^>]*\/>\s*/g, (m, x, y) =>
    (Math.abs(parseFloat(x)) > 600 || Math.abs(parseFloat(y)) > 600) ? '' : m);
  // empty clipPaths clip everything away: remove the definition and any reference to it
  s = s.replace(/<clipPath id="([^"]+)">\s*<\/clipPath>\s*/g, (m, id) => { s = s.split(` clip-path="url(#${id})"`).join(''); return ''; });
  s = s.replace(/<defs>\s*<\/defs>\s*/g, '');
  fs.writeFileSync(p, s);
  console.log(f.padEnd(22), before, '->', s.length, before !== s.length ? 'stripped' : '');
}
