# CLC Legal quality review — 31 October 2026

## Completed in this phase
- Automated GitHub Actions checks for JavaScript syntax, PWA JSON, basic HTML accessibility, and internal link integrity.
- Persistent JSON audit artifact on pull requests and main branch builds.

## Existing site features confirmed
- English and Hindi website with separate canonicals and government-information resources.
- Service worker and installable iOS/Android-oriented web app assets.
- Font files served locally in WOFF2 format, using font-display: swap.
- Reduced-motion CSS support and focus-visible outlines.
- GA4 loaded only after a separate consent choice (verify actual runtime behavior independently).

## Performance assessment
- Site repository files are approximately 2.5 MB in aggregate, not a per-page transfer size.
- Main JavaScript source is approximately 193 KB uncompressed; audit bundle splitting and unused JS with browser coverage before changing routing.
- Fonts total about 429 KB in the repository; not all fonts are downloaded on each page.
- A live Lighthouse run and real Chrome UX Report (LCP, INP, CLS) remain required; scores were not available in this environment.
- Keep design and navigation unchanged. Any performance rewrite requires real-device regression tests.

## Legal/BCI Rule 36 review required by the responsible advocate
- Homepage and service pages include 'Book a Consultation', WhatsApp prompts, and other client-facing contact invitations.
- Review promotional adjectives, calls to action, and claims of expertise throughout all 46 public HTML URLs before certifying compliance.
- Ensure consent notice does not imply that it overrides professional advertising rules.
- Citizen guides should remain educational, neutral and link to official services; avoid success or recovery promises.
- This review is an issue inventory, **not a compliance certification**.

## Manual verification still required
- Lighthouse mobile and desktop against the publicly deployed URL.
- WCAG 2.2 AA tests for contrast, focus order, mobile menu, modal focus, zoom/reflow and screen readers.
- Security headers are controlled at hosting/CDN level; inspect deployed response headers and configure a realistic CSP, HSTS and X-Content-Type-Options if supported.
- Verify social previews, sitemap submission in Search Console and Core Web Vitals trends.
- Confirm production iOS Safari installation, offline fallback and cache refresh.

Note: A continuous integration test protects code quality; it cannot establish a performance score, a WCAG conformance certificate or Bar Council compliance by itself.
