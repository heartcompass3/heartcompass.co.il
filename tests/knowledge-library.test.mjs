import {test} from 'node:test';
import assert from 'node:assert/strict';
import {personalLibrary, libraryIntroSections} from '../src/lib/knowledgeLibrary.mjs';
import {searchArticles} from '../src/lib/insights-search.mjs';
const category = 'דפוסים חוזרים, דחיינות ושינוי אישי';
const make = (slug, language, domain='personal', extra={}) => ({slug:{current:slug},language,title:'Why do I repeat patterns?',insightPlacement:{domain,category:domain==='personal'?category:'כשההורים נפרדים',secondary:[]},...extra});
test('English library excludes Hebrew, noindex and other audiences; includes reviewed secondary placement', () => {
  const input=[make('english','en'),make('hebrew','he'),make('hidden','en','personal',{seo:{noindex:true}}),make('youth','en','youth'),make('cross','en','youth',{insightPlacement:{domain:'youth',category:'כשההורים נפרדים',secondary:[{domain:'personal',category}]}})];
  const result=personalLibrary(input,{}, {},'en');
  assert.deepEqual(result.articles.map(a=>a.slug.current),['english','cross']);
  assert.equal(result.groups.length,1);
  assert.deepEqual(searchArticles(result.articles,result.taxonomy,'Why do I repeat patterns?','personal').map(r=>r.article.slug.current),['english','cross']);
});
test('Hebrew migration retains legacy taxonomy and category anchor', () => {
  const result=personalLibrary([{slug:'original',title:'Original'}],{original:{domain:'personal',category,secondary:[]}},{[category]:{anchor:'pattern-release'}},'he');
  assert.equal(result.groups[0].id,'pattern-release');
  assert.equal(result.articles[0].slug,'original');
});
test('intro grouping preserves text before headings and all following blocks', () => {
  const p={style:'normal',children:[{text:'Intro'}]},h={style:'h2',children:[{text:'How?'}]};
  assert.deepEqual(libraryIntroSections([p,h,p]),[{title:'',body:[p]},{title:'How?',body:[p]}]);
});
