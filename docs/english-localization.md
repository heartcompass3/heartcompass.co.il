# English website UI

The existing `BaseLayout` language prop is the source of truth. Pages under `/en`
pass `language="en"`; shared controls receive it explicitly. Country and browser
language do not override the page language. Existing localStorage keys for cookie
consent, accessibility preferences, and contact-card frequency remain shared.

The English footer includes `NewsletterForm` with translated labels, browser
validation, server errors, and `/en/thank-you`. Its consent text explicitly says
that newsletters are currently sent in Hebrew. Registration saves `he` or `en`
as the contact's `preferred_language` custom property in Resend and includes it
in the owner notification. This is the website-language preference, not a promise
that the newsletter content is already available in English.

The `preferred_language` string contact property was provisioned on 5 November
2026. Contact registration uses the global `/contacts` endpoint, which supports
custom properties, and preserves membership in the configured
`RESEND_AUDIENCE_ID` segment. Existing guide forms default to Hebrew.

English privacy, terms, and accessibility pages follow their existing Hebrew
counterparts. They link to each other with visible language switches and
reciprocal hreflang links. Update both versions when changing the policies.

Validation: `node --test tests/*.test.mjs` and `npm run build`; browser checks
cover English/Hebrew controls, shared consent/preferences, English WhatsApp
message URLs, footer form rendering, and policy routes.
