import {defineArrayMember, defineField, defineType} from 'sanity'
import {InsightCategoryInput} from './insightCategoryInput'
import {
  insightCategoryOptions,
  insightDomainOptions,
  isInsightCategory,
  secondaryInsightDomainOptions,
} from './insightsTaxonomy'

type InsightPlacementValue = {
  domain?: string
  category?: string
}

type ArticleInsightPlacement = InsightPlacementValue & {
  secondary?: InsightPlacementValue[]
}

const validateInsightPlacement = (
  value: InsightPlacementValue | undefined,
  allowLegacy = true,
) => {
  if (!value) return true
  if (!value.domain) return 'יש לבחור תחום.'
  if (!value.category) return 'יש לבחור קטגוריה.'
  if (!allowLegacy && value.domain === 'legacy') {
    return 'שיוך משני זמין רק בארבעת התחומים הציבוריים.'
  }
  if (!isInsightCategory(value.domain, value.category)) {
    return 'הקטגוריה חייבת להשתייך לתחום שנבחר.'
  }
  return true
}

export const insightSecondaryPlacement = defineType({
  name: 'insightSecondaryPlacement',
  title: 'שיוך משני',
  type: 'object',
  fields: [
    defineField({
      name: 'domain',
      title: 'תחום',
      type: 'string',
      options: {list: secondaryInsightDomainOptions, layout: 'dropdown'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'קטגוריה',
      type: 'string',
      options: {list: insightCategoryOptions, layout: 'dropdown'},
      components: {input: InsightCategoryInput},
      validation: (Rule) => Rule.required(),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => validateInsightPlacement(value as InsightPlacementValue, false)),
})

export const insightPlacement = defineType({
  name: 'insightPlacement',
  title: 'שיוך לספריית המאמרים',
  type: 'object',
  fields: [
    defineField({
      name: 'domain',
      title: 'תחום ראשי',
      type: 'string',
      options: {list: insightDomainOptions, layout: 'dropdown'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'קטגוריה ראשית',
      type: 'string',
      options: {list: insightCategoryOptions, layout: 'dropdown'},
      components: {input: InsightCategoryInput},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'secondary',
      title: 'שיוכים משניים',
      type: 'array',
      description:
        'רק קטגוריות נוספות שהמאמר עוסק בהן באופן מהותי. עד שני שיוכים; כל צירוף תחום וקטגוריה חייב להיות ייחודי ושונה מהשיוך הראשי.',
      of: [defineArrayMember({type: 'insightSecondaryPlacement'})],
      validation: (Rule) =>
        Rule.max(2).custom((value, context) => {
          const placements = (value || []) as InsightPlacementValue[]
          const primary = (context.document as {insightPlacement?: ArticleInsightPlacement})
            ?.insightPlacement
          const primaryKey = primary?.domain && primary?.category
            ? `${primary.domain}::${primary.category}`
            : undefined
          const seen = new Set<string>()

          for (const placement of placements) {
            const valid = validateInsightPlacement(placement, false)
            if (valid !== true) return valid

            const key = `${placement.domain}::${placement.category}`
            if (key === primaryKey) return 'שיוך משני חייב להיות שונה מהשיוך הראשי.'
            if (seen.has(key)) return 'אי אפשר להוסיף את אותו שיוך משני יותר מפעם אחת.'
            seen.add(key)
          }

          return true
        }),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => validateInsightPlacement(value as InsightPlacementValue)),
})
