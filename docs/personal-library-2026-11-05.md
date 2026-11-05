# Personal knowledge library, 5 November 2026

## Scope and intent checked before content edits

- `/insights` is the audience-library entry, not a new pain hub.
- `/insights/personal` remains the adult reading collection, with its existing six topic anchors and article URLs.
- `/pain/*` routes remain live and indexable, outside main navigation. They have their own topic explanations and inbound links from articles. No redirect, deletion or canonical change is part of this work.
- `/specialties/personal` owns the coaching-service explanation; `/method` owns the full M.S.A. explanation. The library gives short orientation and links to these destinations.
- Reviewed primary and secondary article placements are retained. One article may appear in several relevant collections with one canonical article URL.

## Search Console preflight

Property: `sc-domain:heartcompass.co.il`. Period: 5 August–2 November 2026.
Compared query/page rows for the personal library, personal service, automatic-patterns article and the automatic-patterns, anxiety, self-worth, people-pleasing and emptiness topic hubs. Connector returned 14 rows, with no repeated query across different compared URLs. No rows were returned for the personal library itself. The evidence is sparse: it does not establish an absence of cannibalization. Content-role separation above, rather than expanding the library into a competing topic article, is the precaution taken.

## Implementation

Editorial introduction and closing in two Sanity page documents: `knowledge-library-personal-he`, `knowledge-library-personal-en`. Published articles are selected by language, noindex and the existing reviewed taxonomy. The English collection initially contains one personal-growth article; the youth translation is excluded. No empty English category pages are introduced. English search results are noindex and private/no-store.

User decision: do not add the library to the English menu or footer yet. Discoverability uses reciprocal language links, contextual links from the translated article and sitemap. Both library language versions are self-canonical with reciprocal hreflang.

Follow-up: clean redundant `(Hebrew)` markers in English content links, preserving article text. Use existing English service/method destinations where available. No full article rewrites.

## Validation

37 Node tests and production build pass before publication. Live checks cover routes, reciprocal language links, structured data, sitemap, retained anchors, contextual links and English search. Browser verification is at the available desktop viewport; a physical mobile-browser check is not claimed.
