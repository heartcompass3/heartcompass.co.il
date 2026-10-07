import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {collectionGroups, audienceGroups, relatedArticles} from '../src/lib/insights.mjs';
const topics = JSON.parse(readFileSync(new URL('../src/content/insights-topics.json',import.meta.url)));
const taxonomy = JSON.parse(readFileSync(new URL('../src/content/insights-taxonomy.json',import.meta.url)));
const domains = JSON.parse(readFileSync(new URL('../src/content/insights-domains.json',import.meta.url)));
const articles = Object.keys(taxonomy).map(slug=>({slug:{current:slug},title:slug}));
test('all 163 reviewed articles have bounded, valid placements',()=>{
  assert.equal(articles.length,163);
  for(const [slug,entry] of Object.entries(taxonomy)) {
    assert.ok(slug && !/\s/.test(slug));
    assert.ok([...domains.map(d=>d.id),'legacy'].includes(entry.domain));
    assert.ok(entry.category);
    assert.ok(entry.secondary.length<=2);
    for(const p of entry.secondary) assert.ok(domains.some(d=>d.id===p.domain) && p.category);
  }
});
test('primary audience groups partition without losing legacy articles',()=>{
  const groups=audienceGroups(articles,taxonomy,domains);
  assert.equal(groups.flatMap(g=>g.articles).length,163);
  assert.equal(new Set(groups.flatMap(g=>g.articles.map(a=>a.slug.current))).size,163);
  assert.equal(groups.find(g=>g.id==='legacy').articles.length,5);
});
test('every primary article is included and collections never repeat a URL internally',()=>{
  for(const d of domains){
    const groups=collectionGroups([...articles,articles[0]],taxonomy,d.id);
    for(const g of groups) assert.equal(new Set(g.articles.map(a=>a.slug.current)).size,g.articles.length);
    const included=new Set(groups.flatMap(g=>g.articles.map(a=>a.slug.current)));
    for(const [slug,e] of Object.entries(taxonomy)) if(e.domain===d.id) assert.ok(included.has(slug));
  }
});
test('related articles share reviewed audience and topic; no arbitrary fallback',()=>{
  for(const slug of Object.keys(taxonomy)) {
    const related=relatedArticles(articles,taxonomy,slug);
    assert.ok(related.length<=4);
    for(const a of related) {assert.notEqual(a.slug.current,slug);assert.equal(taxonomy[a.slug.current].domain,taxonomy[slug].domain);}
  }
  assert.deepEqual(relatedArticles(articles,taxonomy,'unreviewed-new-article'),[]);
});
test('parent alcohol guidance stays out of youth library and related recommendations',()=>{
  const parent='teen-does-not-want-to-stop-drinking-parent-guide';
  assert.equal(taxonomy[parent].domain,'parents');
  assert.ok(!collectionGroups(articles,taxonomy,'youth').flatMap(g=>g.articles).some(a=>a.slug.current===parent));
  assert.ok(!relatedArticles(articles,taxonomy,'drank-too-much-afraid-to-tell-parents').some(a=>a.slug.current===parent));
});
test('cross-placement retains one original URL and unknown articles await review',()=>{
  const cross=Object.entries(taxonomy).find(([,e])=>e.secondary.some(p=>p.domain!==e.domain));
  assert.ok(cross);
  const [slug,entry]=cross;const secondary=entry.secondary.find(p=>p.domain!==entry.domain);
  assert.ok(collectionGroups(articles,taxonomy,secondary.domain).flatMap(g=>g.articles).some(a=>a.slug.current===slug));
  assert.deepEqual(collectionGroups([{slug:'new-unreviewed'}],taxonomy,'youth'),[]);
});
test('topic anchors survive changes in article ordering',()=>{
  const before=collectionGroups(articles,taxonomy,'youth');
  const after=collectionGroups([...articles].reverse(),taxonomy,'youth');
  for(const g of before) assert.equal(after.find(a=>a.name===g.name).id,g.id);
});
test('all reviewed topics have unique readable anchors and substantive introductions',()=>{
  for(const d of domains) {
    const groups=collectionGroups(articles,taxonomy,d.id,topics[d.id]);
    assert.equal(new Set(groups.map(g=>g.id)).size,groups.length);
    for(const g of groups) {
      assert.match(g.id,/^[a-z]+(?:-[a-z]+)*$/);
      assert.ok(g.description.length>=100);
      assert.ok(g.legacyId.startsWith('topic-5'));
      assert.notEqual(g.id,g.legacyId);
    }
  }
  assert.equal(topics.parents['הדפוסים והתגובות שלי כהורה'].anchor,'parent-patterns');
});
