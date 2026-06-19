# מצפן הלב – Astro + Keystatic (סטטי, SEO חזק, עריכה מלאה)

מה יש כאן:
- אתר **סטטי** (Astro) עם HTML אמיתי לכל עמוד (SEO חזק כברירת מחדל).
- **Keystatic** כבק אופיס פשוט: עריכת טקסטים, הוספת מאמרים, העלאת תמונות, יצירת דפים.
- עיצוב **זהה בקו** למה שהבאת: רקע ‎#FDFCF8, ירוק כהה ‎#0F2C36, זהב ‎#D4AF37, פונטים Assistant (כותרות) ו-Heebo (טקסט).
- דף בית כולל: Hero, 3 תחומים לחיצים, מודל מ.ס.ע (מ־ס־ע, וה־ס = סילוק), FAQ.
- בלוג מוכן (Markdown) + עמוד מאמר דינמי.
- כפתור וואטסאפ מרחף עם שאלות מובנות.

## התקנה מקומית
```bash
npm install
npm run dev
```

## Keystatic (עריכה)
```bash
npm run dev
```
ואז להיכנס:
- אתר: `http://localhost:4321`
- Keystatic: `http://localhost:4321/keystatic`

### מצב GitHub (כדי שהעריכות יישמרו בריפו)
ב-Vercel מוסיפים Environment Variables:
- `KEYSTATIC_STORAGE=github`
- `KEYSTATIC_GITHUB_REPO=<owner>/<repo>`
- `KEYSTATIC_GITHUB_TOKEN=<github token>`
- `KEYSTATIC_GITHUB_BRANCH=main`

## מדיה (תמונות, PDF, אודיו)
- קבצים קטנים אפשר לשים ב-`public/`.
- קבצים כבדים (אודיו ארוך / PDF כבד) מומלץ לאחסן ב-Cloudflare R2 / S3 / Bunny / Vimeo / YouTube, ולהטמיע באתר.

## עמודים קיימים
- `/` דף בית
- `/about` מי אני
- `/method` השיטה
- `/method/couples` אימון זוגי בשיטה
- `/method/career` קריירה ועסקים בשיטה
- `/method/personal` התפתחות אישית בשיטה
- `/blog` מאמרים
- `/blog/<slug>` מאמר
- `/contact` צור קשר

## שינוי טקסטים בלי לגעת בקוד
כרגע הטקסטים המרכזיים יושבים ב:
- `src/content/pages/site.json`
ובהמשך נעביר הכל ל-Keystatic (חלק כבר מחובר).
