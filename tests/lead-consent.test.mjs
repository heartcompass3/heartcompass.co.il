import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

const source = await readFile(new URL('../src/pages/api/lead.ts', import.meta.url), 'utf8')
let moduleVersion = 0

async function submit(fields, handler, extraEnv = {}) {
  const calls = []
  const previousFetch = globalThis.fetch
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options })
    return handler(url, options)
  }
  try {
    const env = { RESEND_API_KEY: 'test-only', RESEND_AUDIENCE_ID: 'test-segment', ...extraEnv }
    const code = stripTypeScriptTypes(source.replaceAll('import.meta.env', JSON.stringify(env)))
    const route = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${moduleVersion++}`)
    const request = new Request('https://example.test/api/lead', {
      method: 'POST', body: new URLSearchParams({ name: 'שם בדיקה', email: 'lead@example.test', _next: '/guide/thanks/test', ...fields }),
    })
    return { response: await route.POST({ request }), calls }
  } finally {
    globalThis.fetch = previousFetch
  }
}

test('missing consent and privacy-only submissions are rejected before any external request', async () => {
  for (const fields of [{}, { privacy_ack: 'on' }, { consent: 'on' }, { consent: 'no' }]) {
    const { response, calls } = await submit(fields, () => { throw new Error('External call without consent') })
    assert.equal(response.status, 400)
    assert.equal(response.headers.get('location'), null)
    assert.equal(calls.length, 0)
  }
})

test('explicit consent registers the contact before redirecting to the guide', async () => {
  const { response, calls } = await submit({ consent: 'yes' }, () => Response.json({ id: 'test-id' }))
  assert.equal(response.status, 302)
  assert.equal(response.headers.get('location'), '/guide/thanks/test')
  assert.deepEqual(calls.map(c => new URL(c.url).pathname), ['/emails', '/contacts'])
  assert.equal(JSON.parse(calls[1].options.body).email, 'lead@example.test')
  assert.deepEqual(JSON.parse(calls[1].options.body).segments, [{ id: 'test-segment' }])
  assert.deepEqual(JSON.parse(calls[1].options.body).properties, { preferred_language: 'he' })
  assert.match(JSON.parse(calls[0].options.body).html, /שם בדיקה/)
})

test('English signup persists the language and redirects to the English thank-you page', async () => {
  const { response, calls } = await submit({ consent: 'yes', language: 'en', _next: '/en/thank-you' }, () => Response.json({ id: 'test-id' }))
  assert.equal(response.status, 302)
  assert.equal(response.headers.get('location'), '/en/thank-you')
  assert.deepEqual(JSON.parse(calls[1].options.body).properties, { preferred_language: 'en' })
  assert.match(JSON.parse(calls[0].options.body).html, /en/)
})

test('English validation and external-service failures render English errors', async () => {
  const noConsent = await submit({ language: 'en' }, () => { throw new Error('Must not call external services') })
  assert.equal(noConsent.response.status, 400)
  assert.equal(noConsent.calls.length, 0)
  assert.match(await noConsent.response.text(), /lang="en" dir="ltr"/)
  const failed = await submit({ consent: 'yes', language: 'en' }, url =>
    url.endsWith('/contacts') ? Response.json({ error: 'invalid' }, { status: 400 }) : Response.json({ id: 'test-id' }))
  assert.equal(failed.response.status, 502)
  const html = await failed.response.text()
  assert.match(html, /subscription could not be completed/)
  assert.doesNotMatch(html, /[\u0590-\u05ff]/)
})

test('unsupported languages fall back to Hebrew and redirects stay on the site', async () => {
  const { response, calls } = await submit({ consent: 'yes', language: '<script>', _next: '//external.test' }, () => Response.json({ id: 'test-id' }))
  assert.equal(response.headers.get('location'), '/')
  assert.deepEqual(JSON.parse(calls[1].options.body).properties, { preferred_language: 'he' })
})

test('a rejected contact registration cannot redirect to the guide', async () => {
  const { response } = await submit({ consent: 'yes' }, url =>
    url.endsWith('/contacts') ? Response.json({ error: 'unavailable' }, { status: 503 }) : Response.json({ id: 'test-id' }))
  assert.equal(response.status, 502)
  assert.equal(response.headers.get('location'), null)
})

test('a contact network failure cannot redirect to the guide', async () => {
  const { response } = await submit({ consent: 'yes' }, url => {
    if (url.endsWith('/contacts')) throw new Error('Network unavailable')
    return Response.json({ id: 'test-id' })
  })
  assert.equal(response.status, 502)
  assert.equal(response.headers.get('location'), null)
})

test('missing audience cannot be reported as a completed signup', async () => {
  const { response, calls } = await submit({ consent: 'yes' }, url =>
    url.endsWith('/audiences') ? Response.json({ data: [] }) : Response.json({ id: 'test-id' }),
  { RESEND_AUDIENCE_ID: '' })
  assert.equal(response.status, 502)
  assert.equal(response.headers.get('location'), null)
  assert.equal(calls.some(c => c.url.endsWith('/contacts')), false)
})

test('a rejected notification does not falsely complete registration', async () => {
  const { response, calls } = await submit({ consent: 'yes' }, () => Response.json({ error: 'invalid sender' }, { status: 400 }))
  assert.equal(response.status, 502)
  assert.equal(response.headers.get('location'), null)
  assert.equal(calls.length, 1)
})
