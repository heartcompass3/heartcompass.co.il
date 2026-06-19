import rss from '@astrojs/rss';
import { sanity } from '../lib/sanity';
import { ARTICLES_QUERY } from '../lib/sanityQueries';

export async function GET() {
  try {
    const articles = await sanity.fetch(ARTICLES_QUERY);

    return rss({
      title: 'מצפן הלב - יוסי מדלסי',
      description: 'תובנות, מחקר וכלים לשחרור דפוסים ולתנועה פנימית קדימה.',
      site: 'https://heartcompass.co.il',
      // הוספת ה-xmlns הדרוש ל-Atom link
      xmlns: {
        atom: 'http://www.w3.org/2005/Atom',
      },
      // הוספת ה-Self link שה-Validator ביקש
      customData: `<atom:link href="https://heartcompass.co.il/rss.xml" rel="self" type="application/rss+xml" />`,
      items: articles.map((a: any) => {
        // ניקוי רווחים מהסלאג כדי למנוע את שגיאת ה-Invalid Character
        const cleanSlug = (a.slug?.current || '').trim();
        return {
          title: a.title,
          pubDate: a.publishedAt ? new Date(a.publishedAt) : new Date(),
          description: a.excerpt || '',
          link: `https://heartcompass.co.il/articles/${cleanSlug}`,
        };
      }),
    });
  } catch (error) {
    return new Response('Error loading RSS', { status: 500 });
  }
}
