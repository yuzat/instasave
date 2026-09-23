// get-saved-links.js
//
// Usage:
//   node get-saved-links.js <your_username> > saved_links.txt
//
// Requires auth.json from login.js (run `node login.js` first).
//
// Loads your Saved > All posts page, scrolls to the bottom repeatedly
// (Instagram lazy-loads the grid), collects every post/reel link it finds,
// and prints them one per line to stdout — so you can redirect them
// straight into a text file.

import { chromium } from 'playwright';
import fs from 'fs';

const AUTH_FILE = 'auth.json';
const USERNAME = process.argv[2];

if (!USERNAME) {
  console.error('Usage: node get-saved-links.js <your_instagram_username>');
  process.exit(1);
}

if (!fs.existsSync(AUTH_FILE)) {
  console.error(`No ${AUTH_FILE} found. Run "node login.js" first to create it.`);
  process.exit(1);
}

// Small helper: log progress to stderr so it never contaminates the
// stdout link list (which you're piping into a file).
function progress(msg) {
  console.error(msg);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: AUTH_FILE });
  const page = await context.newPage();

  const savedUrl = `https://www.instagram.com/${USERNAME}/saved/all-posts/`;
  progress(`Opening ${savedUrl} ...`);
  await page.goto(savedUrl, { waitUntil: 'networkidle' });

  // Bail out early with a clear message if we got bounced to a login page
  if (page.url().includes('/accounts/login')) {
    progress('Not logged in — your session likely expired. Run "node login.js" again.');
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(3000);

  const links = new Set();
  let previousHeight = 0;
  let stableRounds = 0;
  const MAX_STABLE_ROUNDS = 5; // stop after 5 scrolls with no new content

  while (stableRounds < MAX_STABLE_ROUNDS) {
    const hrefs = await page.$$eval(
      'a[href*="/p/"], a[href*="/reel/"]',
      (anchors) => anchors.map((a) => a.href)
    );
    const before = links.size;
    hrefs.forEach((h) => links.add(h));
    progress(`Collected ${links.size} unique links so far (+${links.size - before})`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // Random-ish delay so this doesn't hammer Instagram at a fixed interval
    await page.waitForTimeout(1500 + Math.random() * 1000);

    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
      previousHeight = currentHeight;
    }
  }

  await browser.close();

  progress(`Done. ${links.size} total links.`);

  // one link per line, on stdout only.
  for (const link of links) {
    console.log(link);
  }
})();
