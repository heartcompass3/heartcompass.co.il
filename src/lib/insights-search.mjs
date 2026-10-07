import {articleSlug} from './insights.mjs';

export const normalizeSearch = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[\u0591-\u05C7]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
const stopWords = new Set(['איך','למה','מה','את','של','עם','על','אני','לי','הוא','היא','זה','אתה','אתם','שלי','יש','כל','לא','רוצה','מאמר','מאמרים','אבל','שלא','כשאני','כש','אם','גם','רק','עד','כבר','עדיין','לעזור','עזרה','ללכת','לעשות','אפשר','כדי','האם']);
// Explicit, modest vocabulary bridges. No diagnosis or generated advice.
const concepts = [
  ['קבוצת השווים','קבוצת שווים','חבורת השווים','חבורת חברים','חבורת','חבורה','החבורה'],
  ['שינוי','שינויים','לשנות','להשתנות','משתנה','משתנים'],
  ['ידע','ידיעה','לדעת','יודע','יודעת','יודעים','הבנה','להבין','מבין','מבינה','מבינים'],
  ['גבול','גבולות','להציב גבולות','הצבת גבולות'],
  ['שייכות','להשתייך','להשתלב','שייך','שייכת'],
  ['התמכרות','התמכרויות','מכור','מכורה','מכורים'],
  ['בושה','מתבייש','מתביישת','להתבייש','מבוכה','מביך'],
  ['שקר','שקרים','משקר','משקרת','לשקר'],
  ['כישלון','כישלונות','להיכשל','נכשל','נכשלת'],
  ['חשיבת יתר','מחשבות יתר','מחשבות טורדניות','לא מפסיק לחשוב','לא מפסיקה לחשוב','הראש לא מפסיק לעבוד','אוברתינקינג','overthinking','רומינציה'],
  ['ריצוי','קשה לי להגיד לא','קשה לי לומר לא','לרצות אחרים'],
  ['חרדה','חרדות','פחד','פחדים','חרדתי','מפחד','מפחדת','פוחד','פוחדת'],
  ['דפוסים','דפוס','שחרור דפוסים'],
  ['כעס','כעסים','התפרצות','התפרצויות','מתפרץ','מתפוצץ'],
  ['בדידות','בודד','בודדה','אין לי חברים','לבד'],
  ['מסכים','מסך','טלפון','פלאפון','סמארטפון'],
  ['דחיינות','דוחה הכל','דוחה דברים','לדחות'],
  ['פרידה','פרידות','נפרדנו','נפרד','פרידה זוגית'],
  ['ביקורת עצמית','מבקר את עצמי','ערך עצמי','לא מספיק טוב'],
  ['מתבגר','מתבגרים','למתבגר','למתבגרים','המתבגר','המתבגרים','בני נוער','נוער','נער','נערה','התבגרות'],
  ['בית ספר','בית הספר','לבית ספר','לבית הספר'],
].map(group=>group.map(normalizeSearch));

export function searchArticles(articles, taxonomy, query, domain = '', limit = 60) {
  const normalized = normalizeSearch(query).slice(0,180);
  if (!normalized) return [];
  let remainder = normalized;
  const matchedConcepts = concepts.filter(group=>group.some(term=>(' '+normalized+' ').includes(' '+term+' ')));
  for (const group of matchedConcepts) for (const term of [...group].sort((a,b)=>b.length-a.length)) remainder = (' '+remainder+' ').replaceAll(' '+term+' ', ' ').trim();
  const tokens = remainder.split(' ').filter(w=>w && !stopWords.has(w));
  if (!tokens.length && !matchedConcepts.length) return [];
  const seen = new Set();
  return articles.map((article,i)=>{
    const slug = articleSlug(article), placement = taxonomy[slug];
    if (!slug || seen.has(slug)) return null;
    seen.add(slug);
    const placements = placement ? [placement,...(placement.secondary || [])] : [];
    if (domain && !placements.some(p=>p.domain===domain)) return null;
    const title = normalizeSearch(article.title);
    const fields = normalizeSearch([article.title,article.goldLine,article.excerpt,...placements.map(p=>p.category),...(article.searchPhrases || []),...(article.painTags || []),...(article.pains || []).map(p=>p.title),...(article.tags || [])].join(' '));
    const contains = (haystack,term) => haystack.includes(term);
    if (!tokens.every(w=>contains(fields,w)) || !matchedConcepts.every(group=>group.some(term=>contains(fields,term)))) return null;
    const score = (contains(title,normalized) ? 100 : 0) + ((article.searchPhrases || []).some(phrase=>normalizeSearch(phrase)===normalized) ? 60 : 0) + tokens.filter(w=>contains(title,w)).length * 10 + matchedConcepts.filter(group=>group.some(term=>contains(title,term))).length * 10 + (contains(normalizeSearch(article.excerpt),normalized) ? 5 : 0);
    return {article,placement,score,i};
  }).filter(Boolean).sort((a,b)=>b.score-a.score || a.i-b.i).slice(0,limit);
}
