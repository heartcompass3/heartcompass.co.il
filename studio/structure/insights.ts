import type {StructureBuilder} from 'sanity/desk'
import {insightDomains, insightCategoriesByDomain} from '../schemaTypes/objects/insightsTaxonomy'

// Both primary and reviewed secondary placements belong in a library/category.
export const libraryFilter = '_type == "article" && (insightPlacement.domain == $domain || count(insightPlacement.secondary[domain == $domain]) > 0)'
export const categoryFilter = '_type == "article" && ((insightPlacement.domain == $domain && insightPlacement.category == $category) || count(insightPlacement.secondary[domain == $domain && category == $category]) > 0)'

export function insightsStructure(S: StructureBuilder) {
  return S.listItem().id('insightsLibraries').title('ספריות וקטגוריות מאמרים').child(
    S.list().id('insightsLibraries').title('ספריות וקטגוריות מאמרים').items([
      ...insightDomains.map(({id: domain, name}) => S.listItem().id(domain).title(name).child(
        S.list().id(domain).title(name).items([
          S.listItem().id(`${domain}-all`).title('כל המאמרים בספרייה').child(
            S.documentList().id(`${domain}-all`).title(name).schemaType('article')
              .filter(libraryFilter).params({domain}),
          ),
          S.divider(),
          ...insightCategoriesByDomain[domain].map((category, index) => S.listItem()
            .id(`${domain}-${index}`).title(category).child(
              S.documentList().id(`${domain}-${index}`).title(category).schemaType('article')
                .filter(categoryFilter).params({domain, category}),
            )),
        ]),
      )),
      S.divider(),
      S.listItem().id('missingPlacement').title('מאמרים שדורשים שיוך').child(
        S.documentList().id('missingPlacement').title('מאמרים שדורשים שיוך').schemaType('article')
          .filter('_type == "article" && !defined(insightPlacement.domain)'),
      ),
      S.listItem().id('missingSearchPhrases').title('מאמרים ללא שאילתות חיפוש').child(
        S.documentList().id('missingSearchPhrases').title('מאמרים ללא שאילתות חיפוש').schemaType('article')
          .filter('_type == "article" && (!defined(searchPhrases) || count(searchPhrases[defined(@) && @ != ""]) == 0)'),
      ),
    ]),
  )
}
