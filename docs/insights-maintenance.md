# Content library maintenance

163 published articles were classified from their bodies on 2026-10-07. Source of truth: Yossi's live HeartCompass Drive charter. The taxonomy stores only public slugs and reviewed placements; article bodies, titles, existing FAQs and CTAs remain in Sanity unchanged.

Read the full main body before adding a slug to src/content/insights-taxonomy.json. Give it one primary domain/category and at most two substantive secondary placements. A relationship example can teach patterns too. Do not infer audience from title, related links or footer text. Parent-facing guidance does not become youth content just because it mentions teens.

Unknown new articles remain available in /articles; they require classification before inclusion in audience libraries. Five legacy business articles remain in the complete archive, outside the four new libraries. Run `node --test tests/insights.test.mjs` after taxonomy changes, and compare taxonomy keys with published CMS slugs.

Collections are crawlable sections with anchor navigation, not separate thin indexed URLs. /pain redirects once to /insights; existing /pain/:slug topic URLs retain their canonical, body, FAQ and CTA. Article URLs are unchanged. FAQ copy on new library pages is introductory editorial guidance, not a claim about measured search demand or eligibility for rich results. No new FAQPage markup is added.

Research uses a fixed protocol, seven distinct observation days per question, and records missing observations as missing. The initial two-query sample is one day only; no stable-answer or ranking claim follows from it. Research dates and evidence live in the workspace research register, not private data in this repository.

Before production: review all four libraries and topic grouping, confirm current CMS coverage, inspect rendered canonicals/sitemap/301 and mobile navigation, and deploy through the normal PR review flow. Monitor Search Console after release; do not change article URLs or blanket-redirect detailed topic pages.


Method-copy correction (2026-10-07): name mapping, root/protective work, release and embedding before describing choice or practice as outcomes. Goals can develop alongside release. Do not replace release with understanding or behavior rehearsal; distinguish parent guidance from deeper personal release, according to the live charter. Topic introductions describe actual collection coverage, not measured search-volume claims. Readable fragment links are in insights-topics.json; fragments are in-page navigation, not separately indexed category pages. Keep hidden legacy IDs for already-shared fragment links.


## שיוך במערכת העריכה וחיפוש רוחבי

לאחר קריאת גוף מלא, מלאו `insightPlacement`: ספרייה ראשית וקטגוריה ראשית אחת; עד שני שיוכים משניים רק כשהנושא מוסבר באופן מהותי. הקטגוריות חייבות להתאים לספרייה. בני נוער הם קהל, ולא כל מאמר שמזכיר מתבגר פונה אליו. משאירים URL אחד למאמר. חמישה מאמרי עסקים היסטוריים נשארים בארכיון.

השדות החדשים במערכת העריכה הם המקור התפעולי לשיוך. `insights-taxonomy.json` הוא תמונת המיון שנבדק למאמרים הקיימים ומשמש fallback בלבד למאמר ללא שדה חדש. מאמר חדש אינו מסווג אוטומטית לפי כותרתו. שיוך מפורש שאינו תקין אינו מוחל באתר; מתקנים אותו ב-Studio. הגדרות הקטגוריות המשותפות נמצאות ב-`insights-topics.json` ונקראות גם ב-Studio כדי למנוע פערים.

`pains` ממשיך לקשר למוקדי הכאב ולעמודי `/pain/[slug]` הקיימים. הוא אינו קובע קהל/ספרייה; אין למחוק או להחליף הפניות קיימות לצורך המיון. `tags` הוא תיוג כללי ואינו מחליף את השיוך החדש.

`searchPhrases` מיועד לביטויי קושי בשפת הקורא שהמאמר אכן עונה להם, עד 12 ניסוחים רלוונטיים. אין להוסיף מילות מפתח שאינן נתמכות בתוכן. החיפוש משתמש בכותרת, תקציר, משפט הזהב, קטגוריות, מוקדי כאב וביטויי החיפוש; גופי המאמרים אינם נשלחים לדפדפן כאינדקס חיפוש. הרחבת מילים מוגבלת למילון מפורש, ללא תשובות או אבחנות שנוצרות אוטומטית.

החיפוש זמין בראש מרכז המידע ובארבע הספריות. ברירת המחדל בספרייה היא הקהל הנבחר, עם אפשרות לעבור לכל הספריות. תוצאות מוצגות פעם אחת עם תווית ספרייה ראשית וקישור לכתובת המקורית. `/insights/search` מוחרג מקאש ISR כי הוא תלוי בשאילתה, מוגדר `noindex, follow` ואינו נוסף למפת האתר. הספריות, המאמרים וקישורי HTML ממשיכים לשרת גילוי אורגני.

לפני פרסום מאמר מאושר: בדקו שיוך ראשי/משני, הופעה בקטגוריה, חיפוש של ניסוח הקורא, תווית קהל וקישור תקין. שינוי שיוך או ביטוי חיפוש אינו מצדיק שינוי מלאכותי בתאריך עדכון התוכן. שינוי גוף/כותרת/FAQ/CTA קיים דורש היקף מפורש מיוסי.
