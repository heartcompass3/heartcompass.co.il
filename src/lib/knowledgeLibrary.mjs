import {articleSlug, effectiveTaxonomy, collectionGroups} from './insights.mjs';

// Use the existing reviewed taxonomy, including secondary placements. Language
// filtering happens before grouping so an untranslated article cannot leak in.
export function personalLibrary(articles, fallback, topics, language = 'he') {
  const eligible = articles.filter(a => (a.language || 'he') === language && !a.seo?.noindex);
  const taxonomy = effectiveTaxonomy(eligible, fallback);
  const groups = collectionGroups(eligible, taxonomy, 'personal', topics).filter(g => g.articles.length);
  const unique = [...new Map(groups.flatMap(g => g.articles).map(a => [articleSlug(a), a])).values()];
  return {groups, articles: unique, taxonomy};
}

// Introductory sections stay editable as ordinary Portable Text in Sanity.
export function libraryIntroSections(body = []) {
  const sections = [];
  for (const block of body) {
    if (block.style === 'h2') sections.push({title: (block.children || []).map(c => c.text || '').join(''), body: []});
    else if (sections.length) sections.at(-1).body.push(block);
    else sections.push({title: '', body: [block]});
  }
  return sections;
}

export const LIBRARY_PAGE_QUERY = `*[_type == "page" && slug.current == $slug && coalesce(seo.noindex, false) == false][0]{title,excerpt,body,contentUpdatedAt,aiCitation,seo,specialty{intro,faqTitle,faq,closing,practicalGuidance{gettingStarted}}}`;
export const LIBRARY_ARTICLES_QUERY = `*[_type == "article" && coalesce(language, "he") == $language && coalesce(seo.noindex, false) == false] | order(coalesce(publishedAt, _createdAt) desc){_id,title,goldLine,slug,excerpt,language,seo{noindex},insightPlacement,searchPhrases,painTags,tags,mainImage{alt,asset->{url}}}`;
