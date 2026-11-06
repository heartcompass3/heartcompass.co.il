import {test} from 'node:test';
import assert from 'node:assert/strict';
import {personalLibrary, knowledgeLibrary, libraryIntroSections, splitLibraryContent} from '../src/lib/knowledgeLibrary.mjs';
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

test('CMS topic copy keeps existing anchors and links separate from intro cards', () => {
  const intro = [{_key:'b0',style:'h2',children:[{text:'Where to start?'}]},{_key:'b1',style:'normal',children:[{text:'Start here.'}]}];
  const linked = {_key:'p1',style:'normal',children:[{text:'Boundaries',marks:['link']}],markDefs:[{_key:'link',_type:'link',href:'#people-pleasing-boundaries'}]};
  const result = splitLibraryContent([...intro,{_key:'topic-self-worth',style:'h2',children:[{text:'Self-worth'}]},linked,{_key:'topic-people-pleasing-boundaries',style:'h2',children:[{text:'Boundaries'}]},linked]);
  assert.deepEqual(result.intro,intro);
  assert.deepEqual(result.topics.map(t=>t.id),['self-worth','people-pleasing-boundaries']);
  assert.equal(result.topics[0].body[0],linked);
  assert.deepEqual(splitLibraryContent(intro),{intro,topics:[]});
});

test('CMS contact action stays outside the last topic and intro, preserving its label and destination', () => {
  const heading={_key:'topic-burnout-meaning',style:'h2',children:[{text:'Meaning'}]};
  const paragraph={_key:'p',style:'normal',children:[{text:'Topic copy'}]};
  const action={_key:'library-cta',style:'normal',children:[{text:'Discuss what you want to change',marks:['contact']}],markDefs:[{_key:'contact',_type:'link',href:'/en/contact'}]};
  const result=splitLibraryContent([heading,paragraph,action]);
  assert.deepEqual(result.intro,[]);
  assert.deepEqual(result.topics[0].body,[paragraph]);
  assert.deepEqual(result.cta,{href:'/en/contact',label:'Discuss what you want to change'});
  for (const href of ['javascript:alert(1)','//untrusted.test','']) {
    const invalid={...action,markDefs:[{_key:'contact',_type:'link',href}]};
    assert.equal(splitLibraryContent([heading,paragraph,invalid]).cta,undefined);
    assert.deepEqual(splitLibraryContent([heading,paragraph,invalid]).topics[0].body,[paragraph]);
  }
});

const firstTopics = {
  personal:'דפוסים חוזרים, דחיינות ושינוי אישי',
  parents:'הורות בזמן פרידה וגירושין',
  youth:'כשההורים נפרדים',
  relationships:'פרידה וגירושין',
};
for (const domain of Object.keys(firstTopics)) {
  test(`library ${domain} keeps its audience and language separate`, () => {
    const input=Object.entries(firstTopics).flatMap(([id,category])=>['he','en'].map(language=>({slug:`${id}-${language}`,title:id,language,insightPlacement:{domain:id,category,secondary:[]}})));
    const result=knowledgeLibrary(input,{}, {},'en',domain);
    assert.deepEqual(result.articles.map(a=>a.slug),[`${domain}-en`]);
  });
}
test('opened Hebrew topics retain anchors even before their first article', () => {
  const topics={'כשההורים נפרדים':{anchor:'when-parents-separate',showWhenEmpty:true}};
  assert.equal(knowledgeLibrary([],{},topics,'he','youth').groups[0].id,'when-parents-separate');
  assert.equal(knowledgeLibrary([],{},topics,'en','youth').groups.length,0);
});
