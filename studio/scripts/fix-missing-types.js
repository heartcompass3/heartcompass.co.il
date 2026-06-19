/**
 * scripts/fix-missing-types.js
 *
 * מריץ תיקון לדאטה בדאטהסט:
 * מוסיף _type לפריטים בתוך מערכים (cards.items / msa.items / faq.items) אם חסר.
 *
 * הרצה:
 *   npx sanity exec scripts/fix-missing-types.js --withUserToken
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

function ensureArrayItemTypes(arr, defaultType) {
  if (!Array.isArray(arr)) return {changed: false, value: arr}
  let changed = false
  const next = arr.map((it) => {
    if (!it || typeof it !== 'object') return it
    if (it._type) return it
    changed = true
    return {...it, _type: defaultType}
  })
  return {changed, value: next}
}

export default async function fixMissingTypes() {
  const docs = await client.fetch(`*[_type == "homePage"]{_id, cards, msa, faq}`)
  if (!docs?.length) {
    console.log('No homePage documents found.')
    return
  }

  let totalPatched = 0

  for (const doc of docs) {
    const patches = {}

    // cards.items -> _type: 'card'
    if (doc.cards?.items) {
      const res = ensureArrayItemTypes(doc.cards.items, 'card')
      if (res.changed) patches['cards.items'] = res.value
    }

    // msa.items -> _type: 'msaCard'
    if (doc.msa?.items) {
      const res = ensureArrayItemTypes(doc.msa.items, 'msaCard')
      if (res.changed) patches['msa.items'] = res.value
    }

    // faq.items -> _type: 'qa'
    if (doc.faq?.items) {
      const res = ensureArrayItemTypes(doc.faq.items, 'qa')
      if (res.changed) patches['faq.items'] = res.value
    }

    const keys = Object.keys(patches)
    if (!keys.length) continue

    await client.patch(doc._id).set(patches).commit({autoGenerateArrayKeys: false})
    totalPatched++
    console.log(`Patched ${doc._id}: ${keys.join(', ')}`)
  }

  console.log(`Done. Patched documents: ${totalPatched}`)
}
