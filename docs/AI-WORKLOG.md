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
| — | — | — | — | — |

---

## Next up (queue)

| Priority | Task | Suggested owner |
|---|---|---|
| 3 | New article: Checking land title in Bihar before buying | Claude |
| 4 | BCI Rule 36 wording review across all pages (see `docs/quality-and-bci-review.md`) | Pk, with either AI |

---

## Done

| Date | AI | Task | PR / commit |
|---|---|---|---|
| 2026-10-27 | Claude | SEO rebuild: one URL per practice area (EN + HI), titles, canonical, hreflang, JSON-LD, sitemap, robots, 404 | 2bf7ed9 |
| 2026-10-28 | Claude | Home title and description, LawFirm schema, click-to-call and mailto links, Contact page | bbb0999, 634705e |
| 2026-10-28 | Claude | Self-hosted fonts, layout-shift fix | d23c9af |
| 2026-10-29 | Claude | Immigration title, DCLR FAQ, brand spelling variants | 2e926ba |
| 2026-10-29 | Claude | First article: DCLR mutation appeal (EN + HI) | de7d5ac |
| 2026-11-01 | Claude | DCLR article: title/description/H1 now lead with "Mutation Appeal" (EN) and "म्यूटेशन अपील" (HI); Search Console showed position 4–5 with low clicks | this PR |
| 2026-11-01 | Claude | Article: Jamabandi correction through Parimarjan Plus (EN + HI); only facts verified on official portals; all links tested; linked from DCLR article; sitemap | this PR |
| up to 2026-10-31 | ChatGPT | Homepage performance, PWA caching, accessibility, citizen guides, privacy page, CI tests, consent | #21, #22, #23 and earlier |
