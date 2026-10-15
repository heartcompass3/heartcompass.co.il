import test from 'node:test'
import assert from 'node:assert/strict'
import { CHANNEL_ID, collectVideos, mergeVideos, parseChannel, fetchChannelVideos } from '../scripts/sync-videos.mjs'

const old = { id: 'C3tFtybKkR0', title: 'ישן', published: '2026-08-31' }
const fresh = { id: 'IEMMryDiD2o', title: 'חדש', published: '' }

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
