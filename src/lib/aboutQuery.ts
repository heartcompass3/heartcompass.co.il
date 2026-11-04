export const ABOUT_QUERY = /* groq */ `
  *[_type == "page" && slug.current == "about"][0]{
    title,
    excerpt,
    heroImage,
    body,
    aiCitation,
    painTags,
    aiContext,
    specialty{
      closing,
      practicalGuidance{
        label,
        title,
        intro,
        steps[]{_key, title, text}
      },
      faqTitle,
      faq[]{_key, question, answer}
    },
    seo{
      title,
      description,
      noindex,
      canonical,
      ogImage
    }
  }
`

