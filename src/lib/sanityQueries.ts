// src/lib/sanityQueries.ts
// ─── עדכון: ARTICLE_BY_SLUG_QUERY כולל עכשיו faqItems ───────────

export const HOME_PAGE_QUERY = /* groq */ `
*[_type == "homePage"][0]{
  seo,
  hero,
  h1,

  introParagraph,
  introParagraphRich,

  cards,
  methodHeading,
  methodTitle,
  methodIntro,
  msa,
  faq,
  aiCitation,
  painTags,
  aiContext,
  bottomCtaText,
  bottomCtaHref
}
`

export const CONTACT_PAGE_QUERY = /* groq */ `
*[_type == "contactPage"][0]{
  seo,
  left{
    title,
    text,
    ctaLabel,
    helper
  },
  right{
    titleLine1,
    titleLine2,
    ctaLabel,
    helper
  }
}
`

export const SITE_SETTINGS_QUERY = /* groq */ `
*[_type == "siteSettings"][0]{
  title,
  tagline,

  contact{
    email
  },

  nav[]{
    label,
    href,
    children[]{
      label,
      href
    }
  },

  footerLinks[]{
    label,
    href
  },

  socials[]{
    label,
    href,
    icon
  },

  whatsapp{
    label,
    href
  },

  whatsappWarmups[]{
    label,
    message
  },

  tracking{
    enabled,
    gaMeasurementId,
    metaPixelId,
    tiktokPixelId
  }
}
`

export const METHOD_PAGE_QUERY = /* groq */ `
*[_type == "methodPage"][0]{
  seo,

  hero{
    h1,
    goldLine,
    opening,
    ctaLabel,
    ctaHref
  },

  msaCore{
    shortLine
  },

  body,

  cards[]{
    title,
    text,
    href
  }
}
`

// =======================
// Articles (Sanity)
// =======================

export const ARTICLES_QUERY = /* groq */ `
*[_type == "article"]
| order(coalesce(publishedAt, _createdAt) desc)
{
  _id,
  title,
  goldLine,
  slug,
  excerpt,
  publishedAt,
  authorLine,
  mainImage{
    alt,
    asset->{
      url
    }
  },
  author->{
    name
  },
  tags
}
`

export const ARTICLE_BY_SLUG_QUERY = /* groq */ `
*[_type == "article" && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  goldLine,
  slug,
  excerpt,
  publishedAt,
  authorLine,
  mainImage{
    alt,
    asset->{
      url
    }
  },
  author->{
    name
  },
  tags,
  painTags,
  pains[]->{ title, "slug": slug.current },
  aiCitation,
  keyTakeaways{
    heading,
    items
  },
  body,
  cta{
    heading,
    text,
    buttonLabel,
    buttonHref
  },
  faqItems[]{
    question,
    answer
  }
}
`

// מאמרים נוספים — אוטומטי לפי תגיות משותפות, ללא המאמר הנוכחי
export const RELATED_ARTICLES_QUERY = /* groq */ `
*[_type == "article" && slug.current != $slug && count(tags[@ in $tags]) > 0]
| order(coalesce(publishedAt, _createdAt) desc)[0...3]{
  _id,
  title,
  goldLine,
  slug,
  excerpt,
  publishedAt,
  mainImage{
    alt,
    asset->{
      url
    }
  }
}
`

// =======================
// Pain Hubs (מוקדי כאב)
// =======================

// עמוד כאב בודד — שולף אוטומטית את כל המאמרים שמצביעים אליו (article.pains)
export const PAIN_BY_SLUG_QUERY = /* groq */ `
*[_type == "pain" && slug.current == $slug && coalesce(publishedSite, "new") in ["new", "both"]][0]{
  _id,
  _updatedAt,
  title,
  goldLine,
  "slug": slug.current,
  heroIntro,
  painPoints,
  body,
  aiCitation,
  aiContext,
  painKeywords,
  excerpt,
  seo,
  faqItems[]{ question, answer },
  cta{ heading, text, buttonLabel, buttonHref },
  "articles": *[_type == "article" && references(^._id)]
    | order(coalesce(publishedAt, _createdAt) desc){
      _id,
      title,
      goldLine,
      "slug": slug.current,
      excerpt,
      publishedAt,
      mainImage{ alt, asset->{ url } }
    }
}
`

// רשימת כל הכאבים (לאינדקס "מרכז המידע" ול-sitemap) + ספירת מאמרים לכל אחד
export const PAINS_LIST_QUERY = /* groq */ `
*[_type == "pain" && coalesce(publishedSite, "new") in ["new", "both"]]
| order(coalesce(order, 99) asc){
  _id,
  title,
  goldLine,
  "slug": slug.current,
  excerpt,
  "count": count(*[_type == "article" && references(^._id)])
}
`

export const CATEGORY_QUERY = /* groq */ `
*[_type == "category" && slug.current == $slug][0]{
  _id,

  title,
  slug,
  description,
  heroText,

  faqTitle,

  faq[]{
    question,
    answer
  }
}
`

export const TOOLS_QUERY = /* groq */ `
*[_type == "landingPage" && defined(toolCategory)]
| order(coalesce(toolOrder, 99) asc)
{
  _id,
  title,
  slug,
  toolCategory,
  toolTagline,
  externalUrl,
  "imageUrl": mainImage.asset->url,
}
`
