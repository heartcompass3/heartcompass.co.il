import rss from '@astrojs/rss';
import { sanity } from '../lib/sanity';
import { ARTICLES_QUERY } from '../lib/sanityQueries';
import site from '../content/pages/site.json';

// כתובת קנונית עם www — חייבת להתאים ל-canonical של האתר, אחרת ה-RSS מפזר
// קישורים ל-host הלא-קנוני (בלי www) וגוגל סורק אותם רק כדי להפנות ל-www.
const SITE_URL = site.siteUrl; // https://www.heartcompass.co.il

export async function GET() {
  try {
    const articles = await sanity.fetch(ARTICLES_QUERY);

    return rss({
      title: 'מצפן הלב - יוסי מדלסי',
      description: 'תובנות, מחקר וכלים לשחרור דפוסים ולתנועה פנימית קדימה.',
      site: SITE_URL,
      // הוספת ה-xmlns הדרוש ל-Atom link
      xmlns: {
        atom: 'http://www.w3.org/2005/Atom',
      },
      // הוספת ה-Self link שה-Validator ביקש
      customData: `<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
      items: articles.map((a: any) => {
        // ניקוי רווחים מהסלאג כדי למנוע את שגיאת ה-Invalid Character
        const cleanSlug = (a.slug?.current || '').trim();
        return {
          title: a.title,
          pubDate: a.publishedAt ? new Date(a.publishedAt) : new Date(),
          description: a.excerpt || '',
          link: `${SITE_URL}/articles/${cleanSlug}`,
        };
      }),
    });
  } catch (error) {
    return new Response('Error loading RSS', { status: 500 });
  }
}
