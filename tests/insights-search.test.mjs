import test from 'node:test';
import assert from 'node:assert/strict';
import {searchArticles,normalizeSearch} from '../src/lib/insights-search.mjs';
import {effectiveTaxonomy} from '../src/lib/insights.mjs';
const articles = [
  {slug:'adult',title:'חשיבת יתר: שחרור דפוסים',excerpt:'מחשבות שחוזרות שוב ושוב'},
  {slug:'parent',title:'חרדה אצל מתבגרים',excerpt:'הסבר להורים',pains:[{title:'חרדה'}]},
  {slug:'teen',title:'אין לי חברים בכיתה',excerpt:'בדידות ושייכות',searchPhrases:['קשה לי בכיתה']},
];
const taxonomy = {adult:{domain:'personal',category:'שחרור דפוסים',secondary:[{domain:'relationships',category:'דפוסים בקשר'}]},parent:{domain:'parents',category:'חרדות',secondary:[]},teen:{domain:'youth',category:'שייכות',secondary:[]}};
test('search understands explicit difficulty phrases and Hebrew vowel marks',()=>{
  assert.equal(normalizeSearch(' חֲרָדָה! '),'חרדה');
  assert.equal(searchArticles(articles,taxonomy,'הראש לא מפסיק לעבוד')[0]?.article.slug,'adult');
  assert.equal(searchArticles(articles,taxonomy,'קשה לי בכיתה')[0]?.article.slug,'teen');
  assert.equal(searchArticles(articles,taxonomy,'פחד')[0]?.article.slug,'parent');
});
test('audience filtering respects reviewed secondary placement, deduplicates URLs and never leaks another audience',()=>{
  assert.equal(searchArticles([...articles,articles[0]],taxonomy,'דפוסים','relationships').length,1);
  assert.equal(searchArticles(articles,taxonomy,'חרדה','youth').length,0);
  assert.equal(searchArticles(articles,taxonomy,'לא מוכר בכלל').length,0);
  assert.equal(searchArticles(articles,taxonomy,'').length,0);
});
test('valid CMS placement supersedes snapshot; invalid assignments fail closed; reviewed snapshot stays available',()=>{
  const fallback={one:{domain:'parents',category:'ישן',secondary:[]}};
  const p={domain:'youth',category:'זהות ושייכות',secondary:[]};
  // Use a real configured category rather than allowing arbitrary strings.
  return import('../src/content/insights-topics.json',{with:{type:'json'}}).then(({default:topics})=>{
    p.category=Object.keys(topics.youth)[0];
    assert.equal(effectiveTaxonomy([{slug:'one',insightPlacement:p}],fallback).one.domain,'youth');
    assert.equal(effectiveTaxonomy([{slug:'one',insightPlacement:{...p,category:'invalid'}}],fallback).one,undefined);
    assert.equal(effectiveTaxonomy([{slug:'one'}],fallback).one.domain,'parents');
    assert.equal(effectiveTaxonomy([{slug:'new'}],fallback).new,undefined);
    assert.equal(effectiveTaxonomy([{slug:'one',insightPlacement:{...p,secondary:[p]}}],fallback).one,undefined);
  });
});
