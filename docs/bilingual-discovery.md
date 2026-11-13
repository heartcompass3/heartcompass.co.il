# Bilingual search and AI discovery

Updated 5 November 2026.

- `public/robots.txt` uses one group for the wildcard and the previously named
  crawlers. All share the public-site allowance and the `/api/` and `/studio/`
  exclusions. Existing public-content and AI crawler access is preserved.
- `public/llms.txt` contains Hebrew and English summaries and links to published
  pages. It reflects the current Heart Compass charter and the two published
  Migdalor Campus certificates. Previous unsupported claims of international
  certification and more than ten years of professional coaching were replaced
  by the actual course names, dates, and hours.
- `BaseLayout` links to `/llms.txt` with `rel="describedby"`. Website schema lists
  both content languages. WebPage/ProfilePage/FAQPage schema uses the current
  page language, including pages without a custom WebPage entity.
- Business and person entity IDs stay stable across languages. Names, locations,
  topic labels, and credentials use the page language. Generic and About-page
  credential metadata share the same source.
- Service areas are translated without expanding their geographic coverage.
  Page languages are declared in the website and page metadata. The service
  metadata leaves session language to the introductory conversation.
- Existing reciprocal HTML hreflang links are retained. No duplicate sitemap
  hreflang implementation is added. Verify that each published English URL has
  a self-canonical and a reciprocal Hebrew alternate.

Validation: schema tests and production build; HTTP checks of the crawler rules,
all internal llms.txt links, sitemap membership, localized entity data, canonical
URLs, hreflang reciprocity, and thank-you-page exclusion from the sitemap.
