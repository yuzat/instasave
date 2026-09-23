# Instasave - Instagram Extraction Tool

Log in once, then dump the links from your Instagram "Saved > All posts"
page to a text file.

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

```bash
npm run login
```

A real browser window opens on Instagram's login page. Log in by hand,
including any 2FA/checkpoint step. Once you're on your home feed, switch
back to the terminal and press Enter. This saves your session to
`auth.json`

Then begin scraping saved links.

```bash
node get-saved-links.js your_username > saved_links.txt
```

- Progress messages go to stderr.
- The actual links go to stdout, one per line, into `saved_links.txt`.
- It stops scrolling once 5 (default) scroll attempts in a row produce no 
  new content. 
  
## Notes

- **Selectors can break.** This relies on Instagram's markup containing
  `<a href="...">` tags pointing at `/p/...` or `/reel/...`. Instagram
  changes its frontend periodically; if it stops finding links, re-check
  the page structure (e.g. run with `headless: false` in
  `get-saved-links.js` temporarily to watch it).
- **Rate limiting / automation detection.** This is your own account and
  your own data, but Instagram's Terms of Service restrict automated
  access, and scripted browsing can trigger checkpoints or temporary
  blocks. Treat this as an occasional manual export.
  
