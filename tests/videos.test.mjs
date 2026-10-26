import test from 'node:test'
import assert from 'node:assert/strict'
import { CHANNEL_ID, collectVideos, mergeVideos, parseChannel, fetchChannelVideos, parseVideoPublished, fillPublicationDates } from '../scripts/sync-videos.mjs'
import { normalizeVideoDate } from '../src/lib/videoDates.mjs'

const old = { id: 'C3tFtybKkR0', title: 'ישן', published: '2026-08-31' }
const fresh = { id: 'IEMMryDiD2o', title: 'חדש', published: '' }

const videoHtml = (overrides = {}) => `<script>var ytInitialPlayerResponse = ${JSON.stringify({ videoDetails: { videoId: fresh.id, channelId: CHANNEL_ID }, microformat: { playerMicroformatRenderer: { publishDate: '2026-10-12T03:50:06-07:00' } }, ...overrides })};</script>`

test('publication metadata uses the verified video and original timezone', () => {
  assert.equal(parseVideoPublished(videoHtml(), fresh.id), '2026-10-12T10:50:06.000Z')
  assert.throws(() => parseVideoPublished(videoHtml(), old.id), /Unexpected/)
  assert.throws(() => parseVideoPublished(videoHtml({ videoDetails: { videoId: fresh.id, channelId: 'other' } }), fresh.id), /Unexpected/)
  assert.throws(() => parseVideoPublished(videoHtml({ microformat: {} }), fresh.id), /timestamp unavailable/)
  assert.throws(() => parseVideoPublished('<html>Consent</html>', fresh.id), /metadata unavailable/)
  for (const value of ['', '2026-08-31', '2026-08-31T12:00:00', 'invalid']) assert.equal(normalizeVideoDate(value), null)
})

test('sync backfills incomplete dates, preserves known timestamps and fails closed', async () => {
  const realFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url) => { calls.push(url); return new Response(videoHtml()) }
  try {
    const known = { ...old, published: '2026-08-31T12:00:00Z' }
    const result = await fillPublicationDates([fresh, known])
    assert.equal(result[0].published, '2026-10-12T10:50:06.000Z')
    assert.equal(result[1].published, '2026-08-31T12:00:00.000Z')
    assert.deepEqual(calls, [`https://www.youtube.com/watch?v=${fresh.id}`])
    globalThis.fetch = async () => new Response('Consent page')
    await assert.rejects(fillPublicationDates([fresh]), /metadata unavailable/)
  } finally { globalThis.fetch = realFetch }
})

test('partial sync adds new videos without deleting saved ones or dates', () => {
  assert.deepEqual(mergeVideos([old], [fresh]), [fresh, old])
  assert.deepEqual(mergeVideos([old], [{ ...old, title: 'עודכן', published: '' }]), [{ ...old, title: 'עודכן' }])
  assert.equal(mergeVideos([old], [fresh, fresh]).length, 2)
  assert.throws(() => mergeVideos([old], []), /keeping saved videos/)
})

test('channel parser rejects consent, error pages and other channels', () => {
  assert.throws(() => parseChannel('<html>Consent required</html>'))
  const html = (id) => `<script>var ytInitialData = ${JSON.stringify({ metadata: { channelMetadataRenderer: { externalId: id } }, contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { selected: true, content: { richGridRenderer: {} } } }] } } })};</script>`
  assert.throws(() => parseChannel(html('different-channel')))
  assert.deepEqual(parseChannel(html(CHANNEL_ID)), { richGridRenderer: {} })
})

test('extracts Shorts and regular videos, ignores unrelated video IDs', () => {
  const content = [
    { shortsLockupViewModel: { onTap: { innertubeCommand: { reelWatchEndpoint: { videoId: fresh.id } } }, overlayMetadata: { primaryText: { content: fresh.title } } } },
    { videoRenderer: { videoId: old.id, title: { runs: [{ text: old.title }] } } },
    { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'next-page' } } } },
    { videoId: 'not-a-card' },
  ]
  assert.deepEqual(collectVideos(content), { videos: [fresh, { ...old, published: '' }], continuations: ['next-page'] })
})

test('YouTube HTTP failures stop the background job instead of returning an empty library', async () => {
  const realFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('Unavailable', { status: 404 })
  try {
    await assert.rejects(fetchChannelVideos(), /HTTP 404; keeping saved videos/)
  } finally {
    globalThis.fetch = realFetch
  }
})

function channelTabHtml(tab, videos, continuation) {
  const content = { items: videos.map((video) => ({ videoRenderer: { videoId: video.id, title: { simpleText: video.title } } })) }
  if (continuation) content.items.push({ continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: continuation } } } })
  return `<script>var ytInitialData = ${JSON.stringify({ metadata: { channelMetadataRenderer: { externalId: CHANNEL_ID } }, contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { selected: true, endpoint: { commandMetadata: { webCommandMetadata: { url: `/@yossimedalsi/${tab}` } } }, content } }] } } })};</script><script>var config = {"INNERTUBE_CLIENT_VERSION":"test-version"};</script>`
}

test('collects regular videos and Shorts, follows continuations and deduplicates IDs', async () => {
  const realFetch = globalThis.fetch
  const calls = []
  const extra = { id: 'PODTM6VrMo8', title: 'Continuation video', published: '' }
  globalThis.fetch = async (url) => {
    calls.push(url)
    if (url.endsWith('/shorts')) return new Response(channelTabHtml('shorts', [fresh]))
    if (url.endsWith('/videos')) return new Response(channelTabHtml('videos', [old, fresh], 'next'))
    return Response.json({ items: [{ videoRenderer: { videoId: extra.id, title: { simpleText: extra.title } } }] })
  }
  try {
    assert.deepEqual(await fetchChannelVideos(), [fresh, { ...old, published: '' }, extra])
    assert.equal(calls.length, 3)
  } finally { globalThis.fetch = realFetch }
})

test('a missing Videos tab never imports YouTube Home shelves', async () => {
  const home = channelTabHtml('featured', [old])
  assert.equal(parseChannel(home, 'videos'), null)
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url) => new Response(url.endsWith('/shorts') ? channelTabHtml('shorts', [fresh]) : home)
  try { assert.deepEqual(await fetchChannelVideos(), [fresh]) }
  finally { globalThis.fetch = realFetch }
})
