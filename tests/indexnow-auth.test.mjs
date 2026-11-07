import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

const source = await readFile(new URL('../src/pages/api/indexnow.ts', import.meta.url), 'utf8')
const siteUrl = 'https://www.heartcompass.co.il'
let version = 0

async function run(method, query, headers, env = {}, body) {
  const code = stripTypeScriptTypes(source
    .replace(/import site from .*\n/, `const site = {siteUrl: ${JSON.stringify(siteUrl)}}\n`)
    .replaceAll('import.meta.env', '{}')
    .replaceAll('process.env', JSON.stringify(env)))
  const route = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${version++}`)
  const url = new URL('/api/indexnow' + query, siteUrl)
  const request = new Request(url, { method, headers, body })
  const calls = []
  const previousFetch = globalThis.fetch
  globalThis.fetch = async (target, options) => {
    calls.push({ target, options })
    return target.endsWith('/sitemap.xml')
      ? new Response(`<urlset><url><loc>${siteUrl}/articles/test</loc></url></urlset>`)
      : new Response(null, { status: 202 })
  }
  try {
    return { response: await route[method]({ request, url }), calls }
  } finally {
    globalThis.fetch = previousFetch
  }
}

test('IndexNow fails closed and rejects spoofed cron and query credentials', async () => {
  for (const [method, query, headers, env, body] of [
    ['GET', '?all=1', { 'x-vercel-cron': '1' }, {}],
    ['GET', '?all=1&secret=manual', {}, { INDEXNOW_SECRET: 'manual' }],
    ['POST', '', { 'x-vercel-cron': '1' }, { CRON_SECRET: 'cron' }, '{}'],
    ['POST', '', {}, {}, '{}'],
  ]) {
    const { response, calls } = await run(method, query, headers, env, body)
    assert.equal(response.status, 401)
    assert.deepEqual(calls, [])
  }
})

test('authenticated cron submits the sitemap and manual auth rejects another host', async () => {
  const cron = await run('GET', '', { authorization: 'Bearer cron' }, { CRON_SECRET: 'cron' })
  assert.equal(cron.response.status, 200)
  assert.deepEqual(JSON.parse(cron.calls[1].options.body).urlList, [siteUrl + '/articles/test'])
  const foreign = await run('GET', '?url=https://example.com/article', { 'x-indexnow-secret': 'manual' }, { INDEXNOW_SECRET: 'manual' })
  assert.equal(foreign.response.status, 400)
  assert.deepEqual(foreign.calls, [])
})

test('authenticated webhook submits the correct translated article URL', async () => {
  const body = JSON.stringify({ _type: 'article', slug: { current: 'test' }, language: 'en' })
  const { response, calls } = await run('POST', '', { 'x-indexnow-secret': 'manual' }, { INDEXNOW_SECRET: 'manual' }, body)
  assert.equal(response.status, 200)
  assert.deepEqual(JSON.parse(calls[0].options.body).urlList, [siteUrl + '/en/articles/test'])
})
