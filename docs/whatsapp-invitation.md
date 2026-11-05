# Automatic WhatsApp invitation

The floating WhatsApp button always remains available on click. Automatic
invitations are a separate component, localized with the page's language.

Eligibility requires both 90 seconds while the tab is visible and at least 40%
scroll depth on the current page. Background/sleep time is not counted. Desktop
also requires the pointer to leave through the top of the viewport. Touch
devices can show the invitation once both reading conditions are met.

The invitation waits while cookie consent is undecided, an editable form field
has focus, or the accessibility/WhatsApp panel is open. Manual WhatsApp activity
suppresses automatic invitations. The existing 14-day localStorage cap is
preserved, with an additional per-session cap shared by both languages.

Automatic invitations are omitted from Hebrew/English contact, thank-you and
unsubscribe pages and guide-confirmation routes. Their existing contact buttons
are sufficient. The automatic invitation uses a neutral question in both
languages rather than assuming that the visitor is leaving.

`tests/whatsapp-invitation.test.mjs` runs the actual inline script with a virtual
clock and DOM controls to cover early exit, reading/scroll order, hidden tabs,
interaction priority, dismissal, expiry, and frequency suppression.
