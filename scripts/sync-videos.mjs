import { readFile, writeFile, rename } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { normalizeVideoDate } from '../src/lib/videoDates.mjs'

export const CHANNEL_ID = 'UCo3tMRDrFY_zUlgeJXyvxjQ'
const snapshotPath = new URL('../src/data/videos.json', import.meta.url)
const validId = /^[\w-]{11}$/

export function parseChannel(html, requestedTab) {
  const match = html.match(/(?:var\s+ytInitialData\s*=\s*|window\["ytInitialData"\]\s*=\s*)(\{[^]*?\});?\s*<\/script>/)
  if (!match) throw new Error('YouTube channel data is unavailable; keeping saved videos')
  const data = JSON.parse(match[1])
  if (data.metadata?.channelMetadataRenderer?.externalId !== CHANNEL_ID) {
    throw new Error('Unexpected YouTube channel; keeping saved videos')
  }
  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || []
  if (requestedTab) {
    const requested = tabs.find((tab) => {
      const url = tab.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url
      return url?.endsWith(`/${requestedTab}`)
    })?.tabRenderer
    // YouTube returns Home when a channel has no uploads of the requested type.
    // Never collect Home shelves, recommendations, or other channels in that case.
    if (!requested) return null
    if (!requested.selected) throw new Error(`YouTube ${requestedTab} tab is not selected; keeping saved videos`)
  }
  const selected = tabs.find((tab) => tab.tabRenderer?.selected)?.tabRenderer?.content
  if (!selected) throw new Error('YouTube tab content is unavailable')
  return selected
}

export function collectVideos(data) {
  const videos = []
  const continuations = []
  function walk(value) {
    if (!value || typeof value !== 'object') return
    const video = value.videoRenderer || value.gridVideoRenderer
    if (video) {
      const title = video.title?.simpleText || video.title?.runs?.map((run) => run.text).join('')
      if (validId.test(video.videoId || '') && title) videos.push({ id: video.videoId, title, published: '' })
      return
    }
    const short = value.shortsLockupViewModel
    if (short) {
      const id = short.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId
      const title = short.overlayMetadata?.primaryText?.content
      if (validId.test(id || '') && title) videos.push({ id, title, published: '' })
      return
    }
    const token = value.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token
    if (token) continuations.push(token)
    for (const child of Object.values(value)) walk(child)
  }
  walk(data)
  return { videos, continuations }
}

export function mergeVideos(saved, fetched) {
  if (!fetched.length) throw new Error('No videos received; keeping saved videos')
  const previous = new Map(saved.map((video) => [video.id, video]))
  const merged = new Map()
  // Channel order is newest first. A partial response must never erase the archive.
  for (const video of [...fetched, ...saved]) {
    if (!validId.test(video.id || '') || !video.title || merged.has(video.id)) continue
    merged.set(video.id, { id: video.id, title: video.title, published: video.published || previous.get(video.id)?.published || '' })
  }
  return [...merged.values()]
}

export function parseVideoPublished(html, videoId) {
  const match = html.match(/(?:var\s+ytInitialPlayerResponse\s*=\s*|window\["ytInitialPlayerResponse"\]\s*=\s*)(\{[^]*?\});?\s*<\/script>/)
  if (!match) throw new Error(`YouTube publication metadata unavailable for ${videoId}`)
  const player = JSON.parse(match[1])
  if (player.videoDetails?.videoId !== videoId || player.videoDetails?.channelId !== CHANNEL_ID) {
    throw new Error(`Unexpected YouTube video or channel for ${videoId}`)
  }
  const published = normalizeVideoDate(player.microformat?.playerMicroformatRenderer?.publishDate)
  if (!published) throw new Error(`YouTube publication timestamp unavailable for ${videoId}`)
  return published
}

export async function fillPublicationDates(videos) {
  const result = []
  for (const video of videos) {
    let published = normalizeVideoDate(video.published)
    if (!published) {
      const html = await (await request(`https://www.youtube.com/watch?v=${video.id}`)).text()
      published = parseVideoPublished(html, video.id)
    }
    result.push({ ...video, published })
  }
  return result
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'user-agent': 'Mozilla/5.0', 'accept-language': 'he,en;q=0.8', ...options.headers },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`YouTube returned HTTP ${response.status}; keeping saved videos`)
  return response
}

async function fetchTabVideos(tab) {
  const html = await (await request(`https://www.youtube.com/@yossimedalsi/${tab}`)).text()
  const content = parseChannel(html, tab)
  if (!content) return []
  const first = collectVideos(content)
  const videos = [...first.videos]
  const pending = [...first.continuations]
  const seen = new Set()
  const version = html.match(/"INNERTUBE_CLIENT_VERSION"\s*:\s*"([^"]+)"/)?.[1]
  while (pending.length) {
    const token = pending.shift()
    if (seen.has(token)) throw new Error('Repeated YouTube continuation; keeping saved videos')
    if (!version || seen.size >= 100) throw new Error('Incomplete YouTube archive; keeping saved videos')
    seen.add(token)
    const response = await request('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: version, hl: 'he' } }, continuation: token }),
    })
    const next = collectVideos(await response.json())
    if (!next.videos.length) throw new Error('Empty continuation; keeping saved videos')
    videos.push(...next.videos)
    pending.push(...next.continuations)
  }
  return videos
}

export async function fetchChannelVideos() {
  const shorts = await fetchTabVideos('shorts')
  const regular = await fetchTabVideos('videos')
  return [...new Map([...shorts, ...regular].map((video) => [video.id, video])).values()]
}

async function main() {
  const saved = JSON.parse(await readFile(snapshotPath, 'utf8'))
  const videos = await fillPublicationDates(mergeVideos(saved.videos, await fetchChannelVideos()))
  videos.sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
  if (JSON.stringify(videos) === JSON.stringify(saved.videos)) {
    console.log(`Video library unchanged: ${videos.length} videos`)
    return
  }
  const temporaryPath = fileURLToPath(snapshotPath) + '.tmp'
  await writeFile(temporaryPath, JSON.stringify({ channelId: CHANNEL_ID, updatedAt: new Date().toISOString(), videos }, null, 2) + '\n')
  await rename(temporaryPath, snapshotPath)
  console.log(`Saved ${videos.length} videos`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1 })
}
