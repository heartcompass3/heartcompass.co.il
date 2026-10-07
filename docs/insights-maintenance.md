# Content library maintenance

163 published articles were classified from their bodies on 2026-10-07. Source of truth: Yossi's live HeartCompass Drive charter. The taxonomy stores only public slugs and reviewed placements; article bodies, titles, existing FAQs and CTAs remain in Sanity unchanged.

Read the full main body before adding a slug to src/content/insights-taxonomy.json. Give it one primary domain/category and at most two substantive secondary placements. A relationship example can teach patterns too. Do not infer audience from title, related links or footer text. Parent-facing guidance does not become youth content just because it mentions teens.

Unknown new articles remain available in /articles; they require classification before inclusion in audience libraries. Five legacy business articles remain in the complete archive, outside the four new libraries. Run `node --test tests/insights.test.mjs` after taxonomy changes, and compare taxonomy keys with published CMS slugs.

Collections are crawlable sections with anchor navigation, not separate thin indexed URLs. /pain redirects once to /insights; existing /pain/:slug topic URLs retain their canonical, body, FAQ and CTA. Article URLs are unchanged. FAQ copy on new library pages is introductory editorial guidance, not a claim about measured search demand or eligibility for rich results. No new FAQPage markup is added.

Research uses a fixed protocol, seven distinct observation days per question, and records missing observations as missing. The initial two-query sample is one day only; no stable-answer or ranking claim follows from it. Research dates and evidence live in the workspace research register, not private data in this repository.

Before production: review all four libraries and topic grouping, confirm current CMS coverage, inspect rendered canonicals/sitemap/301 and mobile navigation, and deploy through the normal PR review flow. Monitor Search Console after release; do not change article URLs or blanket-redirect detailed topic pages.
