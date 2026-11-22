import type { SanityClient } from '@sanity/client'

const stateId = 'drafts.indexnow-delivery-checkpoint'
const types = [
  'article',
  'page',
  'homePage',
  'methodPage',
  'service',
  'pain',
  'landingPage',
]
const query = `{
  "docs": *[_type in $types && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{
    _id, _rev, _type, _updatedAt, language, "slug":slug.current, publishedSite, "noindex":seo.noindex
  },
  "state": *[_id == $stateId][0]{_rev, entries}
}`

type Doc = {
  _id: string
  _rev: string
  _type: string
  _updatedAt: string
  slug?: string
  language?: string
  noindex?: boolean
  publishedSite?: string
}
type Entry = { id: string; rev: string; url: string }
type State = { _rev: string; entries: Entry[] }
type Delivery = { ok: boolean; status?: number }
type Scope = { id?: string; type?: string; slug?: string }

function pageUrl(doc: Doc, base: string) {
  if (doc.noindex) return null
  const en = doc.language === 'en'
  if (doc._type === 'homePage')
    return base + (doc._id === 'en-home-page' ? '/en' : '/')
  if (doc._type === 'methodPage')
    return base + (doc._id === 'en-method-page' ? '/en/method' : '/method')
  const slug = doc.slug?.trim()
  if (
    !slug ||
    /[\s?#:\\]/.test(slug) ||
    slug.split('/').some((part) => !part || part === '.' || part === '..')
  )
    return null
  const encoded = slug.split('/').map(encodeURIComponent).join('/')
  switch (doc._type) {
    case 'article':
      return base + (en ? '/en/articles/' : '/articles/') + encoded
    case 'page':
      return base + '/' + encoded
    case 'service':
      return base + '/services/' + encoded
    case 'pain':
      return doc.publishedSite === 'old' ? null : base + '/pain/' + encoded
    case 'landingPage':
      return (
        base +
        (encoded === 'parent-conflict-pause' ? '/tools/' : '/guide/') +
        encoded
      )
    default:
      return null
  }
}

export async function reconcile(
  client: SanityClient,
  base: string,
  send: (urls: string[]) => Promise<Delivery>,
  scope?: Scope,
) {
  // Read content and checkpoint in the same snapshot. A competing writer cannot overwrite a newer receipt.
  const { docs, state } = await client.fetch<{
    docs: Doc[]
    state: State | null
  }>(query, { types, stateId })
  const prior = new Map(
    (state?.entries || []).map((entry) => [entry.id, entry]),
  )
  const current = new Map<string, Entry>()
  const urls = new Set<string>()
  // Migration from the previously verified full-site submission. Replay recent edits conservatively.
  const cutoff = Date.now() - 3 * 86400_000
  const bootstrap = !state
  let changed = bootstrap
  for (const doc of docs) {
    const url = pageUrl(doc, base)
    const selected =
      !scope ||
      (scope.id
        ? scope.id === doc._id
        : scope.type === doc._type && (!scope.slug || scope.slug === doc.slug))
    const old = prior.get(doc._id)
    if (url) current.set(doc._id, { id: doc._id, rev: doc._rev, url })
    if (!selected && !bootstrap) continue
    if (old?.rev === doc._rev && old.url === url) continue
    if (!url && !old) continue
    changed = true
    if (old && old.url !== url) urls.add(old.url)
    if (
      url &&
      (!bootstrap ||
        (scope && selected) ||
        Date.parse(doc._updatedAt) >= cutoff)
    )
      urls.add(url)
  }
  for (const old of prior.values()) {
    if ((!scope || scope.id === old.id) && !current.has(old.id)) {
      urls.add(old.url)
      changed = true
    }
  }
  if (!changed) return { ok: true, submitted: 0 }
  if (urls.size) {
    const result = await send([...urls])
    if (!result.ok) return { ok: false, status: result.status, submitted: 0 }
  }
  let entries = [...current.values()]
  if (scope && !bootstrap) {
    const selectedIds = new Set(
      scope.id
        ? [scope.id]
        : docs
            .filter(
              (d) =>
                d._type === scope.type &&
                (!scope.slug || d.slug === scope.slug),
            )
            .map((d) => d._id),
    )
    entries = [...prior.values()]
      .filter((e) => !selectedIds.has(e.id))
      .concat(entries.filter((e) => selectedIds.has(e.id)))
  }
  if (state) {
    await client
      .patch(stateId)
      .ifRevisionId(state._rev)
      .set({ entries })
      .commit({ autoGenerateArrayKeys: true })
  } else {
    await client.create(
      { _id: stateId, _type: 'indexNowCheckpoint', entries },
      { autoGenerateArrayKeys: true },
    )
  }
  return { ok: true, submitted: urls.size }
}
