// login.js
//
// Opens a real (visible) Chromium window pointed at Instagram's login page.
// You log in by hand — including any 2FA / checkpoint challenge — then
// press Enter in this terminal. Your session cookies get saved to auth.json
// so get-saved-links.js can reuse them without logging in again.
//
// Run this again any time auth.json expires.

import { chromium } from 'playwright';

const AUTH_FILE = 'auth.json';

async function waitForEnter(promptText) {
  console.log(promptText);
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.instagram.com/accounts/login/');

  await waitForEnter(
    '\nLog in to Instagram in the browser window that just opened.\n' +
    'Once you land on your home feed (fully logged in, no 2FA prompt left), ' +
    'come back here and press Enter...\n'
  );

  await context.storageState({ path: AUTH_FILE });
  console.log(`Saved session to ${AUTH_FILE}`);

  await browser.close();
})();
