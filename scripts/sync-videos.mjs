import { readFile, writeFile, rename } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const CHANNEL_ID = 'UCo3tMRDrFY_zUlgeJXyvxjQ'
const snapshotPath = new URL('../src/data/videos.json', import.meta.url)
const validId = /^[\w-]{11}$/

export function parseChannel(html) {
  const match = html.match(/(?:var\s+ytInitialData\s*=\s*|window\["ytInitialData"\]\s*=\s*)(\{[^]*?\});?\s*<\/script>/)
  if (!match) throw new Error('YouTube channel data is unavailable; keeping saved videos')
  const data = JSON.parse(match[1])
  if (data.metadata?.channelMetadataRenderer?.externalId !== CHANNEL_ID) {
    throw new Error('Unexpected YouTube channel; keeping saved videos')
  }
  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || []
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

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'user-agent': 'Mozilla/5.0', 'accept-language': 'he,en;q=0.8', ...options.headers },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`YouTube returned HTTP ${response.status}; keeping saved videos`)
  return response
}

export async function fetchChannelVideos() {
  const html = await (await request('https://www.youtube.com/@yossimedalsi/shorts')).text()
  const first = collectVideos(parseChannel(html))
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

async function main() {
  const saved = JSON.parse(await readFile(snapshotPath, 'utf8'))
  const videos = mergeVideos(saved.videos, await fetchChannelVideos())
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
