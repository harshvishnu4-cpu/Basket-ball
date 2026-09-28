/* End-to-end playthrough of RimCheck in headless Chrome via the DevTools Protocol.
   Usage: node tools/e2e.js [outDir]
   Drives real mouse events (drag + tap), takes screenshots at key moments, and fails on any console error. */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'tools', 'e2e-out'));
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
const PORT = 9333;
const URL = 'file:///' + ROOT.replace(/\\/g, '/') + '/index.html?fast=1';
fs.mkdirSync(OUT, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let ws, msgId = 0; const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId; pending.set(id, { resolve, reject, method });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 400) + '\n' + expression);
  return r.result.value;
}
async function waitFor(expr, timeout = 20000, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if (await evaluate(expr)) return true; await sleep(120); }
  throw new Error('timeout waiting for ' + (label || expr));
}
async function center(sel) {
  const c = await evaluate(`(function(){var e=document.querySelector(${JSON.stringify(sel)}); if(!e) return null; var r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2, r.width, r.height];})()`);
  if (!c) throw new Error('no element ' + sel);
  return c;
}
async function mouse(type, x, y, extra = {}) { await send('Input.dispatchMouseEvent', Object.assign({ type, x, y, button: 'left', clickCount: 1 }, extra)); }
async function click(sel) {
  const [x, y] = await center(sel);
  await mouse('mouseMoved', x, y, { button: 'none' });
  await mouse('mousePressed', x, y); await sleep(40); await mouse('mouseReleased', x, y); await sleep(120);
}
async function drag(fromSel, toSel) {
  const [x0, y0] = await center(fromSel), [x1, y1] = await center(toSel);
  await mouse('mouseMoved', x0, y0, { button: 'none' });
  await mouse('mousePressed', x0, y0);
  const steps = 14;
  for (let i = 1; i <= steps; i++) { await mouse('mouseMoved', x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps, { buttons: 1 }); await sleep(18); }
  await sleep(60);
  await mouse('mouseReleased', x1, y1);
  await sleep(350);
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  fs.writeFileSync(path.join(OUT, name + '.jpg'), Buffer.from(r.data, 'base64'));
  console.log('  [shot] ' + name);
}
const ctaVisible = `!document.getElementById('cta-wrap').hidden && !document.getElementById('cta').disabled`;
const ctaLabel = `document.querySelector('#cta .cta-label').textContent.trim()`;
async function waitCta(label) { await waitFor(ctaVisible + (label ? ` && ${ctaLabel}===${JSON.stringify(label)}` : ''), 30000, 'CTA ' + (label || '')); }
async function clickCta(expectLabel) { await waitCta(expectLabel); await click('#cta'); }
async function screenIs(n) { await waitFor(`RC.router.current()===${n} && !document.getElementById('transition-veil').classList.contains('on')`, 15000, 'screen ' + n); await sleep(300); console.log('-- screen ' + n + ' -- ' + await evaluate(`document.getElementById('section-label').textContent`)); }
function assert(cond, msg) { if (!cond) throw new Error('ASSERT: ' + msg); console.log('  ok: ' + msg); }

async function main() {
  const udd = path.join(OUT, 'profile'); fs.rmSync(udd, { recursive: true, force: true });
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${udd}`, '--window-size=1920,1080', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
  try {
    let targets = null;
    for (let i = 0; i < 50 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch (e) { await sleep(200); } }
    const page = targets.find(t => t.type === 'page');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(p.method + ': ' + JSON.stringify(m.error))) : p.resolve(m.result); return; }
      if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push('EXCEPTION ' + (d.exception && d.exception.description || d.text)); console.log('  !! ' + errors[errors.length - 1]); }
      if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) { errors.push('CONSOLE.' + m.params.type + ' ' + m.params.args.map(a => a.value || a.description).join(' ')); console.log('  !! ' + errors[errors.length - 1]); }
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') { errors.push('LOG ' + m.params.entry.text + ' ' + (m.params.entry.url || '')); console.log('  !! ' + errors[errors.length - 1]); }
      if (m.method === 'Network.loadingFailed') { errors.push('NETWORK FAIL ' + m.params.errorText); console.log('  !! ' + errors[errors.length - 1]); }
    };
    await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: URL });
    await waitFor(`window.RC && RC.router && RC.router.current()===1`, 20000, 'title');
    await sleep(600); await shot('01_title');

    // Quick visual review after spacing-only changes.
    if (process.argv.includes('--review')) {
      await evaluate(`RC.state.sensorPlacement='hoopSide'; RC.router.go(8)`);
      await screenIs(8); await sleep(1200); await shot('08_builder');
      await evaluate(`RC.router.go(10)`);
      await screenIs(10); await sleep(1200); await shot('10_transfer');
      await drag('.transfer-tray .sensor-item', '.zone-target.mini[style*="left: 118px"]');
      await drag('.transfer-tray .sensor-item', '.zone-target.mini[style*="left: 1830px"]');
      await shot('10_mounted');
      assert(errors.length === 0, 'visual review has no runtime or resource errors');
      return;
    }

    // ---- 1 Title
    await click('.title-start'); await screenIs(2);
    assert(await evaluate(`document.getElementById('topbar').hidden===false && document.getElementById('progress').hidden===false`), 'top bar and progress visible from screen 2');
    assert(!(await evaluate(`document.body.innerText`)).includes('SKAI Space'), 'no "SKAI Space" text rendered');
    await waitCta("Let's Go"); await shot('02_intro'); await clickCta();

    // ---- 3 Dispute
    await screenIs(3); await sleep(1500); await shot('03_dispute_shot');
    await waitFor(`document.querySelector('.choice-row') && !document.querySelector('.choice-row').hidden`, 20000, 'choices'); await shot('03_dispute_choices');
    await click('.choice-row .btn:nth-child(2)'); await clickCta('Test a Sensor');

    // ---- 4 Sensor placement
    await screenIs(4); await shot('04_sensor_start');
    await drag('.sensor-item', '.zone-target[data-key="backboard"]');
    assert(await evaluate(`RC.state.sensorPlacement==='backboard'`), 'sensor placed on backboard by drag');
    await clickCta('Try It'); await sleep(1600); await shot('04_sensor_backboard_test');
    await waitFor(`RC.state.sensorPlacementTests.backboard===true && ${ctaVisible}`, 30000, 'backboard test done'); await shot('04_sensor_backboard_result');
    await drag('.sensor-item', '.zone-target[data-key="farPole"]'); await clickCta('Try It'); await sleep(1500); await shot('04_sensor_far_test');
    await waitFor(`RC.state.sensorPlacementTests.farPole===true && ${ctaVisible}`, 30000, 'far test done');
    // tap-to-place fallback for the good spot
    await click('.sensor-item'); await click('.zone-target[data-key="hoopSide"]'); await sleep(400);
    assert(await evaluate(`RC.state.sensorPlacement==='hoopSide'`), 'sensor placed beside hoop by tap-to-place');
    await clickCta('Try It'); await sleep(1700); await shot('04_sensor_good_test');
    await waitCta('Build a Rule'); await shot('04_sensor_done');
    // Back button preserves state
    await click('#btn-back'); await screenIs(3); await clickCta('Test a Sensor'); await screenIs(4);
    assert(await evaluate(`RC.state.sensorPlacementTests.hoopSide===true && ${ctaLabel}==='Build a Rule'`), 'Back/forward keeps sensor test state');
    await clickCta('Build a Rule');

    // ---- 5 First rule
    await screenIs(5); await shot('05_first_rule');
    await drag('.chip.action', '.rule-panel .slot');
    assert(await evaluate(`RC.state.firstRuleBuilt===true`), 'first rule built');
    await shot('05_first_rule_done'); await clickCta('Test Rule');

    // ---- 6 First test
    await screenIs(6); await clickCta('Shoot'); await sleep(1800); await shot('06_shot1_mid');
    await clickCta('Next Shot'); await clickCta('Next Shot'); await sleep(2200); await shot('06_shot3_rattle');
    await waitFor(`document.querySelector('.why-wrap .btn')`, 30000, 'Why button'); await shot('06_why');
    await click('.why-wrap .btn');
    await waitFor(`document.querySelectorAll('.evidence .btn').length===2`, 5000, 'evidence choices');
    // pick the wrong one first
    await evaluate(`(function(){var b=[...document.querySelectorAll('.evidence .btn')].find(x=>x.textContent.indexOf('color')>=0); b.click();})()`); await sleep(600);
    assert(await evaluate(`RC.state.failureReasonSelected===null`), 'wrong evidence does not advance');
    await evaluate(`(function(){var b=[...document.querySelectorAll('.evidence .btn')].find(x=>x.textContent.indexOf('moment')>=0); b.click();})()`);
    await clickCta('Fix the Rule');

    // ---- 7 Sequence
    await screenIs(7); await shot('07_sequence');
    const slot = i => `.sequence-slots .slot[data-index="${i - 1}"]`;
    // wrong order first
    await drag('.event-card.hoop', slot(1)); await drag('.event-card.above', slot(2)); await drag('.event-card.below', slot(3));
    await sleep(700); await shot('07_sequence_wrong');
    await waitFor(`document.querySelectorAll('.sequence-slots .placed').length===0`, 15000, 'cards bounce back');
    assert(await evaluate(`RC.state.sequenceDone===false`), 'wrong order rejected');
    await drag('.event-card.above', slot(1)); await drag('.event-card.hoop', slot(2)); await drag('.event-card.below', slot(3));
    await sleep(1200); await shot('07_sequence_correct');
    await clickCta('Build Better Rule');

    // ---- 8 Better rule (build a fooled rule on purpose)
    await screenIs(8); await shot('08_builder');
    const bslot = i => `.builder-panel .slot[data-index="${i - 1}"]`;
    await drag('.chip-tray .chip.cond-above', bslot(1)); await drag('.chip-tray .chip.cond-hoop', bslot(2)); await drag('.chip-tray .chip.cond-beside', bslot(3));
    await drag('.chip-tray .chip.action', '.builder-panel .slot:not([data-index])');
    await shot('08_builder_filled'); await clickCta('Lock Rule');

    // ---- 9 Challenge: swish ok, rattle-out fools it
    await screenIs(9); await shot('09_challenge');
    await clickCta('Shoot'); await waitFor(`document.querySelector('.predict-wrap') && !document.querySelector('.predict-wrap').hidden`, 20000, 'predict 1');
    await click('.btn-call.nopoint'); await sleep(500);
    assert(await evaluate(`RC.state.challengeResults.length===0`), 'wrong real-call pick is nudged, not accepted');
    await click('.btn-call.point'); await sleep(1000); await shot('09_shot1_fooled');
    // the weak rule (above -> hoop -> beside) calls NO POINT on a clean swish: fooled on shot 1
    assert(await evaluate(`RC.state.fooledShot==='cleanSwish'`), 'clean swish fooled the weak rule');
    await clickCta('Fix Rule');

    // ---- 8 again: rule preserved, fix slot 3
    await screenIs(8); await sleep(1200); await shot('08_return_fooled');
    assert(await evaluate(`RC.state.betterRule.join()==='above,hoop,beside'`), 'rule preserved on return');
    await click(bslot(3) + ' .placed'); await sleep(300);
    await drag('.chip-tray .chip.cond-below', bslot(3));
    assert(await evaluate(`RC.state.betterRule.join()==='above,hoop,below'`), 'rule repaired');
    await clickCta('Lock Rule');

    // ---- 9 again: all four hold
    await screenIs(9);
    const truths = { cleanSwish: 'point', rattleOut: 'nopoint', bankScore: 'point', rimMiss: 'nopoint' };
    for (let i = 0; i < 4; i++) {
      await clickCta(i === 0 ? 'Shoot' : 'Next Shot');
      await waitFor(`document.querySelector('.predict-wrap') && !document.querySelector('.predict-wrap').hidden`, 20000, 'predict ' + i);
      const id = RCshots()[i]; await click('.btn-call.' + truths[id]); await sleep(900);
      if (i === 2) await shot('09_bank_score_held');
    }
    await waitCta('Use It on a New Court'); await shot('09_all_held');
    assert(await evaluate(`RC.state.challengePassed===true`), 'challenge passed');
    await clickCta();

    // ---- 10 Transfer: hoop1 wrong sensor, hoop2 right
    await screenIs(10); await shot('10_transfer');
    const spotSel = (x) => `.zone-target.mini[style*="left: ${x}px"]`;
    await drag('.transfer-tray .sensor-item', spotSel(190)); // hoop 1: backboard, wrong on purpose
    assert(await evaluate(`RC.state.transfer.hoop1.sensor==='backboard'`), 'hoop1 sensor on backboard');
    await drag('.transfer-tray .sensor-item:not([style*="hidden"])', spotSel(1640));
    assert(await evaluate(`RC.state.transfer.hoop2.sensor==='hoopSide'`), 'hoop2 sensor beside hoop');
    const tslot = (side, i) => `.hoop-setup.${side} .rule-row .slot:nth-child(${i})`;
    for (const side of ['left', 'right']) { await drag('.transfer-tray .chip.cond-above', tslot(side, 1)); await drag('.transfer-tray .chip.cond-hoop', tslot(side, 2)); await drag('.transfer-tray .chip.cond-below', tslot(side, 3)); }
    await shot('10_transfer_ready');
    await clickCta('Run Game'); await sleep(1400); await shot('10_run_mid');
    await waitFor(`RC.state.transfer.hoop2.done===true`, 30000, 'hoop2 evaluated'); await sleep(1500); await shot('10_run_result');
    assert(await evaluate(`RC.state.transfer.hoop1.frozen===true && RC.state.transfer.hoop2.done===true`), 'only the wrong hoop is frozen');
    // repair hoop 1: move sensor beside the hoop
    await drag('.sensor-item[style*="position: absolute"]', spotSel(365));
    assert(await evaluate(`RC.state.transfer.hoop1.sensor==='hoopSide' && RC.state.transfer.hoop1.frozen===false`), 'hoop1 repaired and unfrozen');
    await clickCta('Run Game');
    await waitCta('Finish'); await shot('10_success');
    await clickCta('Finish');

    // ---- 11 Complete
    await screenIs(11); await sleep(3000); await shot('11_complete');
    assert(!(await evaluate(`document.body.innerText`)).match(/RimCheck|Grade|Stage|Screen /), 'no title/grade/stage/screen words after start');
    await evaluate(`[...document.querySelectorAll('.complete-actions .btn')][0].click()`);
    await screenIs(1);
    assert(await evaluate(`RC.state.sensorPlacement===null && RC.state.betterRule.length===0`), 'replay resets state');
    await shot('12_replay_title');

    console.log('\nPLAYTHROUGH COMPLETE. errors=' + errors.length);
    errors.forEach(e => console.log('  ' + e));
    process.exitCode = errors.length ? 1 : 0;
  } catch (e) {
    console.error('\nFAILED: ' + e.message);
    try { await shot('zz_failure'); } catch (_) { }
    errors.forEach(x => console.log('  ' + x));
    process.exitCode = 2;
  } finally {
    try { ws && ws.close(); } catch (_) { }
    chrome.kill();
  }
}
function RCshots() { return ['cleanSwish', 'rattleOut', 'bankScore', 'rimMiss']; }
main();
