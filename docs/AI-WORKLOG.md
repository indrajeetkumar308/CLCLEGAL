# AI work log — clclegal.in

Two AI assistants work on this site: **Claude** and **ChatGPT**. Pk (Pankaj Kumar Choudhary) is the owner and the only person who merges.

**Every AI must, before starting any task:**
1. Read this file in full.
2. Start from the latest `main` branch (never from an old local copy).
3. Check the "In progress" table. Do not touch files another AI has listed there.

**And after finishing:**
1. Open a pull request. Never push directly to `main`, never merge.
2. Update this file in the same PR: move the task to "Done", add the PR number.

---

## Who owns what

| Area | Owner | Notes |
|---|---|---|
| SEO strategy and Search Console analysis | Claude | |
| Page titles, meta descriptions, keywords | Claude | |
| Articles (`/insights/`): writing, legal accuracy, Hindi versions | Claude | Pk approves legal content before publishing |
| Structured data (JSON-LD) | Claude | Coordinate if templates change |
| Google Business Profile, LinkedIn, listings | Claude | Done outside the repo |
| Code, JavaScript, CSS, layout | ChatGPT | |
| Performance, PWA, service worker, caching | ChatGPT | |
| Accessibility, tests, GitHub Actions, CI | ChatGPT | |
| Citizen guides (`/citizen-guides/`) | ChatGPT | Claude may suggest SEO edits via PR |
| Privacy page, analytics consent | ChatGPT | |
| Bar Council (BCI Rule 36) wording | Pk decides | Either AI may flag issues |

If a task touches the other AI's area, list it under "In progress" first and keep the change small.

---

## In progress (only one AI per file at a time)

| Started | AI | Task | Files / pages | PR |
|---|---|---|---|---|
| 2026-11-01 | ChatGPT | Add native browser Listen-to-article player with EN/HI choice, tests and screenshots | `assets/article-tts.js`, `assets/article-tts.css`, `insights/*/index.html`, `hi/insights/*/index.html`, tests | pending |

---

## Next up (queue)

| Priority | Task | Suggested owner |
|---|---|---|
| 0 | Flaky CI: `mobile-smoke` fails at random (also on main) — after `page.focus('#dd-btn')` + Escape, focus is sometimes on `body` instead of `#dd-btn` (homepage and inner pages). Fix the Escape focus handling in `assets/app.js` / `home-runtime.js` or the test | ChatGPT |
| 1 | New article: Checking land title in Bihar before buying | Claude |
| 2 | Around 15 Nov: compare Search Console clicks for "mutation appeal" after the #25 title change | Claude |
| 3 | BCI Rule 36 wording review across all pages (see `docs/quality-and-bci-review.md`) | Pk, with either AI |

---

## Done

| Date | AI | Task | PR / commit |
|---|---|---|---|
| 2026-10-27 | Claude | SEO rebuild: one URL per practice area (EN + HI), titles, canonical, hreflang, JSON-LD, sitemap, robots, 404 | 2bf7ed9 |
| 2026-10-28 | Claude | Home title and description, LawFirm schema, click-to-call and mailto links, Contact page | bbb0999, 634705e |
| 2026-10-28 | Claude | Self-hosted fonts, layout-shift fix | d23c9af |
| 2026-10-29 | Claude | Immigration title, DCLR FAQ, brand spelling variants | 2e926ba |
| 2026-10-29 | Claude | First article: DCLR mutation appeal (EN + HI) | de7d5ac |
| 2026-11-01 | Claude | DCLR article: title/description/H1 now lead with "Mutation Appeal" (EN) and "म्यूटेशन अपील" (HI); Search Console showed position 4–5 with low clicks | #25 |
| 2026-11-01 | Claude | Article: Jamabandi correction through Parimarjan Plus (EN + HI); only facts verified on official portals; all links tested; linked from DCLR article; sitemap | #26 |
| 2026-11-01 | Claude | Internal linking: new Insights index (/insights/, /hi/insights/) listing all articles; Jamabandi card on Mutation pages, Jamabandi + DCLR cards on Property pages; "Legal Insights" footer link on all pages; sitemap +2. Also added one Jamabandi link to the Land Records card in Citizen Guides (ChatGPT's area, small change only) | #27 |
| 2026-11-01 | Claude | Floating WhatsApp button: icon only, removed the "WhatsApp: +91…" text label (Pk's request; CSS is ChatGPT's area, one rule removed); styles.css cache version unified to v=20261101a on all pages | #28 |
| 2026-11-01 | Claude | DCLR article (EN + HI): "Sources" line at the end — Bihar Bhumi, Bihar Land Mutation Act 2011 (PRS India PDF), Rules 2012 (LBSNAA PDF); Act s.7–8 and Rules 11–12 checked against the text (30-day appeal; revision to Collector within 30 days) | #29 |
| 2026-11-01 | Claude | Citizen Guides link was only in the homepage menu: added "Citizen Guides" / "नागरिक गाइड" to the top menu on all inner pages (32) and to the footer on all pages (48). Header/nav is ChatGPT's area; link only, no CSS/JS change | this PR |
| up to 2026-10-31 | ChatGPT | Homepage performance, PWA caching, accessibility, citizen guides, privacy page, CI tests, consent | #21, #22, #23 and earlier |
