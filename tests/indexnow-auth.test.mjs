import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
const webhookModule = import.meta.resolve('@sanity/webhook')
const syncSource = await readFile(new URL('../src/lib/indexnow-sync.ts', import.meta.url), 'utf8')
const syncModule = 'data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(syncSource)).toString('base64')

const source = await readFile(new URL('../src/pages/api/indexnow.ts', import.meta.url), 'utf8')
const siteUrl = 'https://www.heartcompass.co.il'
let version = 0

async function run(method, query, headers, env = {}, body) {
  const code = stripTypeScriptTypes(source
    .replace(/import site from .*\n/, `const site = {siteUrl: ${JSON.stringify(siteUrl)}}\n`)
    .replace("from '@sanity/webhook'", 'from ' + JSON.stringify(webhookModule))
    .replace("from '../../lib/indexnow-sync'", 'from ' + JSON.stringify(syncModule))
    .replace(/import { sanity } from .*\n/, 'const sanity = {withConfig:()=>globalThis.indexNowTestClient}\n')
    .replaceAll('import.meta.env', JSON.stringify({SANITY_WRITE_TOKEN:'test-token'}))
    .replaceAll('process.env', JSON.stringify(env)))
  const route = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${version++}`)
  const url = new URL('/api/indexnow' + query, siteUrl)
  const request = new Request(url, { method, headers, body })
  const calls = []
  globalThis.indexNowTestClient = {
    fetch: async () => ({docs:[{_id:'one',_type:'article',slug:'test',language:'en',_rev:'1',_updatedAt:new Date().toISOString()}],state:null}),
    create: async () => {},
  }
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

test('authenticated cron submits changed content and manual auth rejects another host', async () => {
  const cron = await run('GET', '', { authorization: 'Bearer cron' }, { CRON_SECRET: 'cron' })
  assert.equal(cron.response.status, 200)
  assert.deepEqual(JSON.parse(cron.calls[0].options.body).urlList, [siteUrl + '/en/articles/test'])
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

test('failed deliveries can retry, duplicate revisions are skipped, renames and removals reach IndexNow', async () => {
  const {reconcile} = await import(syncModule)
  let state = null
  const doc = {_id:'article', _type:'article', slug:'one', language:'en', _rev:'1', _updatedAt:new Date().toISOString()}
  let docs = [doc]
  const client = {
    fetch: async () => ({docs,state}),
    create: async data => { state = {...data, _rev:'initial'} },
    patch: () => ({ifRevisionId: () => ({set: data => ({commit: async () => {state = {...state,...data}}})})}),
  }
  const sent = []
  const send = async urls => {sent.push(urls); return {ok:true}}
  assert.equal((await reconcile(client, siteUrl, async () => ({ok:false,status:429}))).ok, false)
  assert.equal(state,null)
  await reconcile(client, siteUrl, send)
  await reconcile(client, siteUrl, send)
  docs = [{...doc, slug:'two', _rev:'2'}]
  await reconcile(client, siteUrl, send, {id:'article'})
  docs = []
  await reconcile(client, siteUrl, send)
  const one=siteUrl+'/en/articles/one', two=siteUrl+'/en/articles/two'
  assert.deepEqual(sent,[[one],[one,two],[two]])
})

test('a genuine Sanity signature is accepted and a modified payload is rejected', async () => {
  const {encodeSignatureHeader} = await import('@sanity/webhook')
  const body = JSON.stringify({_type:'article', slug:'test'})
  const env = {INDEXNOW_SIGNING_SECRET:'test-signature-key'}
  const signature = await encodeSignatureHeader(body, Date.now(), env.INDEXNOW_SIGNING_SECRET)
  const headers = {'sanity-webhook-signature':signature, 'sanity-document-id':'one'}
  assert.equal((await run('POST','',headers,env,body)).response.status,200)
  assert.equal((await run('POST','',headers,env,body+' ')).response.status,401)
})
