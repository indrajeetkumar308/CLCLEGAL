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

## SEO change rules (agreed with Pk, 2 Nov 2026)

1. **Never change a page URL.** The site is on GitHub Pages and cannot do server redirects; a changed URL loses its Google history.
2. **After changing a page's title or H1, leave them alone for at least 4–6 weeks.** Check Search Console data before changing again.
3. **Add, do not delete.** Do not remove sections, FAQs or articles that people read; correct or extend them instead.
4. **No site-wide redesign at once.** Change layout or templates in small steps.
5. **No keyword stuffing**, and no "best / top / expert" wording (BCI Rule 36).
6. New articles, new FAQs, corrections and internal links are always fine.

**Frozen until 15 Dec 2026:** title and H1 of `/property-lawyer-patna/` and `/hi/property-lawyer-patna/` (changed in #39). Only factual corrections until then.

---

## In progress (only one AI per file at a time)

| Started | AI | Task | Files / pages | PR |
|---|---|---|---|---|
| — | — | — | — | — |

---

## Next up (queue)

| Priority | Task | Suggested owner |
|---|---|---|
| 0 | Flaky CI: `mobile-smoke` fails at random (also on main) — after `page.focus('#dd-btn')` + Escape, focus is sometimes on `body` instead of `#dd-btn` (homepage and inner pages). Fix the Escape focus handling in `assets/app.js` / `home-runtime.js` or the test | ChatGPT |
| 2 | Around 15 Nov: compare Search Console clicks for "mutation appeal" after the #25 title change | Claude |
| 3 | BCI Rule 36 wording review across all pages (see `docs/quality-and-bci-review.md`) | Pk, with either AI |

---

## Done

| Date | AI | Task | PR / commit |
|---|---|---|---|
| 2026-11-02 | ChatGPT | GA4 internal-device opt-out via URL, EN/HI footer note, no GA on flagged devices, clean URL, SW query-cache verified; added mobile/desktop browser tests (CI review required before merge) | #44 (PR, unmerged) |
| 2026-11-01 | ChatGPT | Auto-dismiss installation prompts on first downward scroll or after 30 seconds across iOS guidance and native install option; EN/HI mobile scroll tests and cache refresh | #38 (PR, unmerged) |
| 2026-11-01 | ChatGPT | Reader iPhone overlay fix, shorter native speech chunks, improved Escape-focus fallback, updated asset caches, technical EN/HI hreflang audit; legal/BCI editorial review deferred to Pk/Claude | #37 (PR, unmerged) |
| 2026-11-01 | ChatGPT | Change visible article to published EN/HI alternate when narration language changes; retain Reading Mode and no autoplay | #36 (PR, unmerged) |
| 2026-11-01 | ChatGPT | Fix iPhone narration Play/Pause/Resume button shifting with stable toolbar tracks and geometry tests | #34 (PR, unmerged) |
| 2026-11-01 | ChatGPT | Compact article audio controls beside Reading Mode; require Indian English/Hindi voice; responsive test coverage | #33 (PR, unmerged) |
| 2026-11-01 | ChatGPT | Native bilingual article narration (Web Speech API), voice selection, EN/HI article fetch, accessible Play/Pause/Stop, responsive styles; four viewport tests and screenshots | #32 (PR, unmerged) |
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
| 2026-11-01 | Claude | Citizen Guides link was only in the homepage menu: added "Citizen Guides" / "नागरिक गाइड" to the top menu on all inner pages (32) and to the footer on all pages (48). Header/nav is ChatGPT's area; link only, no CSS/JS change | #30 |
| 2026-11-01 | Claude | DCLR article (EN + HI): Suraj Bhan (2007) 6 SCC 186 verified against the judgment (SC, C.A. 1971/2007, 16.04.2007); wording narrowed to what it holds (revenue entries are fiscal, do not confer ownership); linked judgment and Jitendra Singh v. State of M.P. (SC order 06.09.2021) | #35 |
| 2026-11-02 | Claude | Property page (EN + HI): H1 "Property Lawyer in Patna: Title, Land Records and Disputes"; new "Courts and Forums" section (civil courts, revenue authorities, Bihar Land Tribunal, RERA Bihar, Patna HC) with official links; documents checklist; 4 FAQs + FAQPage JSON-LD. Facts checked against Bihar Land Mutation Rules 2012, Land Tribunal and RERA Bihar official pages, Suraj Bhan judgment | #39 |
| 2026-11-02 | Claude | WhatsApp Channel "CLC Legal - Bihar Law Guides" (https://whatsapp.com/channel/0029Vb9imazJpe8e5YZzzE18): footer link on all pages, "follow" line at the end of every article (EN + HI), added to LawFirm sameAs in JSON-LD | #40 |
| 2026-11-02 | Claude | quality-audit.mjs: Hindi article check read 'hi/insights/...' (no leading slash) as English, so all 4 Hindi articles were falsely flagged 'article-hreflang-or-canonical-mismatch'. One-line fix (prefix '/'). The pages' canonical/hreflang were already correct. CI script is ChatGPT's area; logic otherwise unchanged | this PR |
| 2026-11-02 | Claude | Ahrefs Site Audit fixes: JSON-LD `@type` "LawFirm" (not a schema.org type) changed to "LegalService" on 32 pages (@id unchanged); 3 meta descriptions trimmed under 160 characters (divorce EN, home HI, immigration EN). Titles left as is (change rules) | #45 |
| 2026-11-02 | Claude | Ahrefs audit, round 2: Patna High Court guide titles (EN + HI) shortened under 60 characters (dropped "Citizen Guides" suffix); Hindi privacy meta description extended (was 57 characters); 4 articles BlogPosting to Article schema. Redirect warnings (http/www to https://clclegal.in) are correct and left as is | #46 |
| 2026-11-02 | Claude | Ahrefs audit, round 3: removed `inLanguage` from the Service JSON-LD nodes on 22 practice pages (not a valid Service property; caused the remaining schema.org errors); Hindi district-courts guide meta description extended (was 86 characters). "Article schema missing" on 4 Hindi practice pages and "Organization schema" on home are Ahrefs page-type guesses, left as is | #47 |
| 2026-11-03 | Claude | New article (EN + HI): How to check land before buying in Bihar (/insights/check-land-before-buying-bihar/). Title from Google search phrasing; every portal link opened 3 Nov 2026; law points tied to TPA s.54, Registration Act s.17, Suraj Bhan, Mutation Rules r.11. Cards on property page + Insights index, related links from DCLR and Jamabandi articles, sitemap +2 | this PR |
| up to 2026-10-31 | ChatGPT | Homepage performance, PWA caching, accessibility, citizen guides, privacy page, CI tests, consent | #21, #22, #23 and earlier |
