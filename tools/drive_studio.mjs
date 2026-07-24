/**
 * Drive a running Pokémon Studio over CDP.
 *
 * Studio is Electron, so its renderer is just a Chromium target. Start Studio
 * with the debug port open and this attaches to it — letting a change be made,
 * saved and verified without a human clicking through the UI.
 *
 *   1. STUDIO_REMOTE_DEBUG=9222 npm start        (in one terminal)
 *   2. node tools/drive_studio.mjs <command>
 *
 * Commands
 *   console [ms]      stream renderer console + page errors (default 15000ms)
 *   dump              print the visible UI text and clickable candidates
 *   eval "<js>"       evaluate JS in the renderer and print the result
 *   click "<text>"    click the first element whose trimmed text matches
 *   shot <path>       screenshot the window
 *
 * `dump` exists because selectors have to be discovered, not guessed: run it,
 * read the labels, then build a scenario from `click`/`eval` on what's actually
 * there. Guessing selectors blind produces scripts that fail for the wrong
 * reasons.
 */

import { chromium } from 'playwright-core';

const ENDPOINT = process.env.STUDIO_CDP ?? 'http://localhost:9222';

/** Attach to the Studio window, skipping devtools/extension targets. */
const attach = async () => {
  let browser;
  try {
    browser = await chromium.connectOverCDP(ENDPOINT);
  } catch (e) {
    console.error(
      `Could not reach Studio at ${ENDPOINT}.\n` +
        'Start it with the debug port open first:\n' +
        '  STUDIO_REMOTE_DEBUG=9222 npm start\n' +
        `(${e.message})`
    );
    process.exit(1);
  }
  const pages = browser.contexts().flatMap((c) => c.pages());
  const page = pages.find((p) => !p.url().startsWith('devtools://')) ?? pages[0];
  if (!page) {
    console.error('Connected, but Studio has no renderer page open.');
    process.exit(1);
  }
  return { browser, page };
};

const commands = {
  async console(page, [ms = '15000']) {
    console.log(`listening for ${ms}ms — interact with Studio now\n`);
    page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`[pageerror] ${err.message}`));
    await page.waitForTimeout(Number(ms));
  },

  async dump(page) {
    const info = await page.evaluate(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      };
      const label = (el) => (el.innerText || el.getAttribute('title') || el.getAttribute('aria-label') || '').trim().slice(0, 60);
      const clickable = [...document.querySelectorAll('button, [role="button"], a, input, select, label, [class*="Btn"], [class*="Tab"]')]
        .filter(visible)
        .map((el) => ({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 40), text: label(el) }))
        .filter((e) => e.text);
      return { url: location.href, title: document.title, clickable: clickable.slice(0, 120) };
    });
    console.log(`url: ${info.url}\ntitle: ${info.title}\n`);
    console.log('clickable elements:');
    info.clickable.forEach((e, i) => console.log(`  ${String(i).padStart(3)} <${e.tag}> "${e.text}"  .${e.cls}`));
  },

  async eval(page, args) {
    const source = args.join(' ');
    if (!source) return console.error('eval needs an expression');
    const result = await page.evaluate((src) => {
      // eslint-disable-next-line no-eval
      const value = eval(src);
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return String(value);
      }
    }, source);
    console.log(JSON.stringify(result, null, 2));
  },

  async click(page, args) {
    const text = args.join(' ');
    const target = page.getByText(text, { exact: false }).first();
    await target.click({ timeout: 5000 });
    console.log(`clicked "${text}"`);
  },

  /**
   * Erase one passage cell and save, capturing the renderer console throughout.
   *
   * Erase rather than draw: it needs no tile selected in the palette, so the
   * scenario has one less piece of hidden state to get wrong.
   *
   *   node tools/drive_studio.mjs passage-test [cellIndex]
   */
  async ['passage-test'](page, [cellArg = '69']) {
    const cell = Number(cellArg);
    page.on('console', (m) => console.log(`  [${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => console.log(`  [pageerror] ${e.message}`));

    const geom = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const row = [...document.querySelectorAll('div,span,li')].find((e) => (e.innerText || '').trim() === 'passages');
      const r = canvas.getBoundingClientRect();
      const lr = row.getBoundingClientRect();
      return { cx: r.x, cy: r.y, cw: r.width, ch: r.height, lx: lr.x + lr.width / 2, ly: lr.y + lr.height / 2 };
    });

    console.log('1. select passages layer');
    await page.mouse.click(geom.lx, geom.ly);
    await page.waitForTimeout(300);

    console.log('2. pick Erase tool');
    await page.getByText('Erase', { exact: false }).first().click();
    await page.waitForTimeout(300);

    // The map is 20x15 over the canvas, so tile size falls out of the geometry
    // rather than being hardcoded to a zoom level.
    const cols = 20;
    const tile = geom.cw / cols;
    const col = cell % cols;
    const rowIdx = Math.floor(cell / cols);
    const px = geom.cx + col * tile + tile / 2;
    const py = geom.cy + rowIdx * tile + tile / 2;
    console.log(`3. click cell ${cell} (col ${col}, row ${rowIdx}) at ${Math.round(px)},${Math.round(py)}`);
    await page.mouse.click(px, py);
    await page.waitForTimeout(500);

    console.log('4. save  (watch for [save-diag])');
    await page.getByText('Save', { exact: true }).first().click();
    await page.waitForTimeout(3000);
    console.log('done');
  },

  /**
   * The flow that actually misbehaves: edit, then save through the nav split
   * button's "Save maps" entry and its dialog — NOT the editor toolbar's Save.
   * Those are different code paths (onSaveAllMaps with a selection set vs a
   * plain onSave), so exercising the toolbar proves nothing about this one.
   *
   *   node tools/drive_studio.mjs save-maps-test [cellIndex]
   */
  async ['save-maps-test'](page, [cellArg = '89']) {
    const cell = Number(cellArg);
    page.on('console', (m) => console.log(`  [${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => console.log(`  [pageerror] ${e.message}`));

    const geom = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const row = [...document.querySelectorAll('div,span,li')].find((e) => (e.innerText || '').trim() === 'passages');
      const split = document.querySelector('.save-menu')?.parentElement?.parentElement;
      // Fail with a diagnosis rather than a null-deref: a scenario that silently
      // does nothing looks exactly like a passing run, which is worse than a
      // crash. Studio has to be sitting on the map editor for this to mean
      // anything.
      if (!canvas || !row || !split) {
        throw new Error(
          'Not on the map editor — open a map and select its layers first. ' +
            `canvas=${!!canvas} passagesLayer=${!!row} saveButton=${!!split}`
        );
      }
      const r = canvas.getBoundingClientRect();
      const lr = row.getBoundingClientRect();
      const sr = split.getBoundingClientRect();
      return {
        cx: r.x, cy: r.y, cw: r.width,
        lx: lr.x + lr.width / 2, ly: lr.y + lr.height / 2,
        sx: sr.x + sr.width / 2, sy: sr.y + sr.height / 2,
      };
    });

    await page.mouse.click(geom.lx, geom.ly);
    await page.waitForTimeout(250);
    await page.getByText('Erase', { exact: false }).first().click();
    await page.waitForTimeout(250);

    const cols = 20;
    const tile = geom.cw / cols;
    const px = geom.cx + (cell % cols) * tile + tile / 2;
    const py = geom.cy + Math.floor(cell / cols) * tile + tile / 2;
    console.log(`1. erase cell ${cell}`);
    await page.mouse.click(px, py);
    await page.waitForTimeout(500);

    console.log('2. hover the nav save button to open its menu');
    await page.mouse.move(geom.sx, geom.sy);
    // The menu reveals on a 300ms visibility transition.
    await page.waitForTimeout(700);

    console.log('3. click "Save maps"');
    await page.getByText('Save maps', { exact: true }).first().click();
    await page.waitForTimeout(700);

    console.log('4. confirm in the dialog');
    const confirm = page.getByRole('button', { name: /Save \d+ map/ }).first();
    await confirm.click({ timeout: 5000 });
    await page.waitForTimeout(3500);
    console.log('done');
  },

  async shot(page, [path = 'studio.png']) {
    await page.screenshot({ path, fullPage: false });
    console.log(`saved ${path}`);
  },
};

const [command, ...args] = process.argv.slice(2);
if (!command || !commands[command]) {
  console.log(`commands: ${Object.keys(commands).join(', ')}`);
  process.exit(command ? 1 : 0);
}

const { browser, page } = await attach();
try {
  await commands[command](page, args);
} finally {
  // Detach only — never close, that would kill the user's Studio window.
  await browser.close();
}
