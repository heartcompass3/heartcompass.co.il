import {articleSlug, effectiveTaxonomy, collectionGroups} from './insights.mjs';

// Use the existing reviewed taxonomy, including secondary placements. Language
// filtering happens before grouping so an untranslated article cannot leak in.
export function knowledgeLibrary(articles, fallback, topics, language = 'he', domain = 'personal') {
  const eligible = articles.filter(a => (a.language || 'he') === language && !a.seo?.noindex);
  const taxonomy = effectiveTaxonomy(eligible, fallback);
  const groups = collectionGroups(eligible, taxonomy, domain, topics).filter(g => language === 'he' || g.articles.length);
  const unique = [...new Map(groups.flatMap(g => g.articles).map(a => [articleSlug(a), a])).values()];
  return {groups, articles: unique, taxonomy};
}

// Match translated topic copy to the reviewed article groups by their shared anchor.
export function localizedLibraryTopics(groups, topicContent, language) {
  if (language === 'en') {
    const groupsById = new Map(groups.map(group => [group.id, group]));
    return topicContent.map(topic => ({
      ...topic,
      articles: groupsById.get(topic.id)?.articles ?? [],
    }));
  }

  const contentById = new Map(topicContent.map(topic => [topic.id, topic]));
  return groups.map(group => ({
    ...group,
    title: group.name,
    ...contentById.get(group.id),
  }));
}

// Backwards-compatible API for the first migrated collection.
export const personalLibrary = (articles, fallback, topics, language = 'he') => knowledgeLibrary(articles, fallback, topics, language, 'personal');

// Topic headings use the library's existing stable anchors. Their copy remains
// ordinary editable Portable Text, separate from the introductory cards.
export function splitLibraryContent(body = []) {
  const intro = [], topics = [];
  let current, cta;
  for (const block of body) {
    if (block._key === 'library-cta') {
      const link = block.markDefs?.find(mark => mark._type === 'link' && /^(\/(?!\/)|https?:\/\/)/.test(mark.href || ''));
      const label = link && (block.children || []).filter(span => span.marks?.includes(link._key)).map(span => span.text || '').join('').trim();
      if (label) cta = {href: link.href, label};
    } else if (block.style === 'h2' && block._key?.startsWith('topic-')) {
      current = {id: block._key.slice(6), title: (block.children || []).map(c => c.text || '').join(''), body: []};
      topics.push(current);
    } else if (current) current.body.push(block);
    else intro.push(block);
  }
  return {intro, topics, ...(cta ? {cta} : {})};
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

export const LIBRARY_PAGE_QUERY = `*[_type == "page" && slug.current == $slug && coalesce(seo.noindex, false) == false][0]{title,excerpt,body,contentUpdatedAt,aiCitation,aiContext,painTags,seo,specialty{intro,faqTitle,faq,closing,practicalGuidance{gettingStarted}}}`;
export const LIBRARY_ARTICLES_QUERY = `*[_type == "article" && coalesce(language, "he") == $language && coalesce(seo.noindex, false) == false] | order(coalesce(publishedAt, _createdAt) desc){_id,title,goldLine,slug,excerpt,language,seo{noindex},insightPlacement,searchPhrases,painTags,tags,mainImage{alt,asset->{url}}}`;
