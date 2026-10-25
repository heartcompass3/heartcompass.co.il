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
test('peer-group variants retrieve grounded related articles without equating all alcohol content to peer influence',()=>{
  const samples=[
    {slug:'peer',title:'קבוצת השווים'},
    {slug:'pressure',title:'לחץ חברתי',searchPhrases:['איך קבוצת השווים משפיעה על לחץ חברתי']},
    {slug:'alcohol',title:'אלכוהול בגיל ההתבגרות',searchPhrases:['שתיית אלכוהול כדי להשתלב בחבורה']},
    {slug:'other',title:'השפעת אלכוהול על הגוף'},
  ];
  for(const query of ['קבוצת השווים','חבורת','חבורה']) {
    assert.deepEqual(searchArticles(samples,{},query).map(r=>r.article.slug).sort(),['peer','pressure','alcohol'].sort());
  }
});
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
test('natural wording variants work across contexts and exact curated questions rank first',()=>{
  const samples=[
    {slug:'knowledge',title:'הבנה לא משנה תגובה',searchPhrases:['למה ידע לא מספיק כדי לשנות דפוס?']},
    {slug:'parenting',title:'גבולות בהורות',searchPhrases:['איך להפסיק להתבייש בהצבת גבולות?']},
    {slug:'relationship',title:'גבולות בקשר',searchPhrases:['איך להציב גבול בזוגיות?']},
  ];
  assert.equal(searchArticles(samples,{},'למה אני יודע מה לעשות אבל לא משתנה')[0]?.article.slug,'knowledge');
  assert.equal(searchArticles(samples,{},'למה יש לי בושה כשאני רוצה להציב גבולות')[0]?.article.slug,'parenting');
  assert.equal(searchArticles(samples,{},'איך להציב גבול בזוגיות?')[0]?.article.slug,'relationship');
  assert.deepEqual(searchArticles(samples,{},'גבול').map(r=>r.article.slug).sort(),['parenting','relationship']);
});
test('natural questions keep their meaningful topic without requiring every connecting word',()=>{
  const samples=[{slug:'school',title:'מתבגר לא רוצה ללכת לבית הספר',excerpt:'מה עושים כשהמתבגר מסרב?'},{slug:'love',title:'פחד מזוגיות',excerpt:'זוגיות וקשרים'}];
  const placements={school:{domain:'parents',category:'לימודים',secondary:[]},love:{domain:'relationships',category:'זוגיות',secondary:[]}};
  assert.equal(searchArticles(samples,placements,'איך לעזור למתבגר שלא רוצה ללכת לבית ספר','parents')[0]?.article.slug,'school');
  assert.equal(searchArticles(samples,placements,'אני רוצה זוגיות אבל מפחד','relationships')[0]?.article.slug,'love');
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
