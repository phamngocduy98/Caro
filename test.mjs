import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.log(`  FAIL: ${message}`);
      failed++;
    }
  }

  console.log('=== Test 1: Login Screen ===');
  await page.goto(BASE);
  await page.waitForSelector('.login-screen', { timeout: 5000 });
  const title = await page.textContent('.login-screen h1');
  assert(title === 'XvsO', 'Logo shows XvsO');
  await page.fill('input[placeholder="Enter your name"]', 'Alice');
  await page.click('button[type="submit"]');

  console.log('\n=== Test 2: Lobby Screen ===');
  await page.waitForSelector('.lobby', { timeout: 5000 });
  const lobbyP = await page.textContent('.lobby p');
  assert(lobbyP === 'Select your game mode', 'Lobby shows game mode prompt');
  const modeCards = await page.$$('.mode-card');
  assert(modeCards.length === 3, '3 mode cards (Local/Bot/Online)');
  const typeCards = await page.$$('.type-card');
  assert(typeCards.length === 2, '2 game type cards (Classic/Caro)');

  console.log('\n=== Test 3: Classic Local Game ===');
  await page.click('.type-card:first-child'); // Classic
  await sleep(200);
  await page.click('.mode-card:first-child'); // Local
  await sleep(200);
  await page.click('.start-btn');
  await page.waitForSelector('.game-room', { timeout: 5000 });
  assert(!!(await page.$('.game-room')), 'Game room loaded');
  const cells = await page.$$('.cell');
  assert(cells.length === 9, '9 cells on 3x3 board');

  console.log('\n=== Test 4: Local Gameplay ===');
  await page.click('.cell:nth-child(5)'); // center
  await sleep(300);
  const cell5Text = await page.$eval('.cell:nth-child(5)', el => el.querySelector('.symbol')?.textContent);
  assert(cell5Text === 'X', 'X played center');

  // Play until game over
  for (let i = 0; i < 10; i++) {
    if (await page.$('.game-over')) break;
    const avail = await page.$$('.cell:not([disabled])');
    if (avail.length === 0) break;
    await avail[0].click();
    await sleep(300);
  }
  assert(!!(await page.$('.game-over')), 'Game ended with game-over screen');

  console.log('\n=== Test 5: Leave from Game Over ===');
  await page.click('.game-over button:has-text("Leave")');
  await page.waitForSelector('.lobby', { timeout: 5000 });
  console.log('  PASS: Back in lobby after Leave');

  console.log('\n=== Test 6: Caro Game Type ===');
  await page.click('button:has-text("Caro")');
  await sleep(200);
  const sizeCards = await page.$$('.size-card');
  assert(sizeCards.length === 5, '5 board size options (15/19/25/30/35)');
  await sizeCards[0].click(); // 15x15
  await sleep(200);

  console.log('\n=== Test 7: Caro 15x15 Board ===');
  await page.click('.mode-card:first-child'); // Local
  await sleep(200);
  await page.click('.start-btn');
  await page.waitForSelector('.game-room', { timeout: 5000 });
  const caroCells = await page.$$('.caro-cell');
  assert(caroCells.length === 225, '225 cells on 15x15 Caro board');

  // Click a cell and verify it works
  await caroCells[112].click(); // center-ish
  await sleep(300);
  const centerText = await caroCells[112].textContent();
  assert(centerText.trim() === 'X', 'X played on Caro board');

  console.log('\n=== Test 8: Online Mode ===');
  await page.click('.leave-btn');
  await page.waitForSelector('.lobby', { timeout: 5000 });
  await page.click('button:has-text("Online")');
  await sleep(200);
  const createBtn = await page.$('button:has-text("Create Room")');
  const autoMatchBtn = await page.$('button:has-text("Auto Match")');
  assert(!!createBtn, 'Create Room button exists');
  assert(!!autoMatchBtn, 'Auto Match button exists');

  console.log('\n=== Test 9: Bot Mode (Classic) ===');
  await page.click('button:has-text("vs AI")');
  await sleep(200);
  await page.click('button:has-text("Classic")');
  await sleep(200);
  await page.click('.start-btn');
  await page.waitForSelector('.game-room', { timeout: 5000 });
  await sleep(500);
  const firstCell = await page.$('.cell:not([disabled])');
  assert(!!firstCell, 'Cells are clickable in bot mode');
  await firstCell.click();
  await sleep(1500);
  const symbols = await page.$$('.cell .symbol');
  assert(symbols.length >= 2, 'Bot responded (X and O on board)');

  console.log('\n=== Test 10: Classic Game Type Selectable ===');
  await page.click('.leave-btn');
  await page.waitForSelector('.lobby', { timeout: 5000 });
  await page.click('button:has-text("Classic")');
  await sleep(100);
  const activeType = await page.$('.type-card.active');
  const activeTypeText = activeType ? await activeType.textContent() : '';
  assert(activeTypeText.includes('Classic'), 'Classic is selectable');

  console.log('\n=== Console Errors ===');
  if (errors.length === 0) {
    console.log('  No console errors!');
  } else {
    errors.forEach(e => console.log(`  ERROR: ${e}`));
  }

  await browser.close();

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
  console.log('\n=== ALL TESTS PASSED ===');
}

run().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});