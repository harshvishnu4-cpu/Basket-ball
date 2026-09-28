/* Four-screen smoke test and screenshot pass for the compact RimCheck story. */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'tools', 'four-screen-review'));
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const PORT = 9444;
const URL = 'file:///' + ROOT.replace(/\\/g, '/') + '/index.html?fast=1';
fs.mkdirSync(OUT, { recursive: true });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket, messageId = 0;
const pending = new Map();
const errors = [];

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject, method });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error('Evaluation failed: ' + expression);
  return result.result.value;
}

async function waitFor(expression, label, timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await sleep(120);
  }
  throw new Error('Timed out waiting for ' + label);
}

async function center(selector) {
  const rect = await evaluate(`(function(){const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()`);
  if (!rect) throw new Error('Missing element ' + selector);
  return rect;
}

async function click(selector) {
  const [x, y] = await center(selector);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function drag(fromSelector, toSelector) {
  const [x0, y0] = await center(fromSelector);
  const [x1, y1] = await center(toSelector);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: 'left', clickCount: 1 });
  for (let i = 1; i <= 14; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + (x1 - x0) * i / 14, y: y0 + (y1 - y0) * i / 14, button: 'left', buttons: 1 });
    await sleep(18);
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x1, y: y1, button: 'left', clickCount: 1 });
}

async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
  fs.writeFileSync(path.join(OUT, name + '.jpg'), Buffer.from(result.data, 'base64'));
}

async function screen(number) {
  await waitFor(`window.RC&&RC.router&&RC.router.current()===${number}&&!document.getElementById('transition-veil').classList.contains('on')`, 'screen ' + number);
  await sleep(350);
}

async function run() {
  console.log('Starting four-screen browser review');
  const keepAlive = setInterval(function () { }, 1000);
  if (!CHROME) throw new Error('Chrome or Edge not found');
  const profile = path.join(OUT, 'profile');
  fs.rmSync(profile, { recursive: true, force: true });
  const browser = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1920,1080', '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
  console.log('Browser process started');

  try {
    let targets;
    for (let i = 0; i < 60 && !targets; i++) {
      try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch (_) { await sleep(200); }
    }
    const page = targets.find(target => target.type === 'page');
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        return message.error ? request.reject(new Error(request.method + ': ' + JSON.stringify(message.error))) : request.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push('console error');
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: URL });
    await screen(1);
    await screenshot('01-title');

    await click('.title-reference-start');
    await screen(2);
    await screenshot('02-prediction');
    if ((await evaluate(`document.querySelectorAll('.reference-answer').length`)) !== 2) throw new Error('Prediction choices missing');
    await click('.reference-answer.yes');

    await screen(3);
    await sleep(1100);
    await screenshot('03-shot-mid');
    await screenshot('03-shot-result');
    await waitFor(`!document.querySelector('.third-question').hidden`, 'points question');
    await click('.third-answer[data-call="none"]');
    await waitFor(`RC.state.pointsCall==='none'`, 'points call');

    await screen(4);
    await screenshot('04-sensor');
    if ((await evaluate(`document.querySelectorAll('.fourth-callout').length`)) !== 3) throw new Error('Fourth-screen callouts missing');
    if (!(await evaluate(`document.querySelector('.fourth-coach')&&document.querySelector('.fourth-tray')`))) throw new Error('Fourth-screen layers missing');
    await click('.sensor-item');
    await click('.zone-target[data-key="hoopSide"]');
    await waitFor(`RC.state.sensorPlacement==='hoopSide'`, 'sensor placement');
    await click('#cta');
    await waitFor(`RC.state.sensorPlacementTests.hoopSide===true&&!document.getElementById('cta-wrap').hidden`, 'sensor test', 30000);
    if (!(await evaluate(`RC.state.learnedTwoClueRule===true`))) throw new Error('Two-clue lesson state missing');
    if (!(await evaluate(`document.querySelector('.fourth-logic')&&document.querySelectorAll('.fourth-logic-row').length===2`))) throw new Error('Two-clue comparison missing');
    if ((await evaluate(`document.querySelector('.fourth-rule-line').textContent`)) !== 'Both clues must be YES.') throw new Error('AND rule copy missing');
    if ((await evaluate(`document.querySelector('.fourth-logic-row .fourth-logic-call').textContent`)) !== 'NO POINT') throw new Error('Rattle-out call missing');
    await screenshot('04-sensor-complete');
    if ((await evaluate(`document.querySelector('#cta .cta-label').textContent`)) !== 'Replay Mission') throw new Error('Replay CTA missing');
    if (errors.length) throw new Error(errors.join('; '));
    console.log('Four-screen review complete: ' + OUT);
  } finally {
    clearInterval(keepAlive);
    try { socket && socket.close(); } catch (_) { }
    browser.kill();
  }
}

run().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
