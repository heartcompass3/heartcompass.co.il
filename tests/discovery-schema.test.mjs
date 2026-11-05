import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

const source = await readFile(new URL('../src/lib/schema.ts', import.meta.url), 'utf8')
const schema = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`)
const siteUrl = 'https://www.heartcompass.co.il'

test('WebPage language follows the English route boundary and keeps its service reference', () => {
  for (const [path, expected] of [['/en', 'en'], ['/en/specialties/parents', 'en'], ['/specialties/parents', 'he'], ['/enlightenment', 'he']]) {
    const page = schema.buildAeoWebPageSchema({ url: siteUrl + path, name: 'Page', mainEntityId: `${siteUrl}${path}#service` })
    assert.equal(page.inLanguage, expected)
    assert.equal(page.mainEntity['@id'], `${siteUrl}${path}#service`)
  }
})

test('translated service metadata preserves provider identity without promising English sessions', () => {
  const english = schema.buildServiceSchema({ siteUrl, url: `${siteUrl}/en/specialties/parents`, name: 'Parent coaching' })
  const hebrew = schema.buildServiceSchema({ siteUrl, url: `${siteUrl}/specialties/parents`, name: 'הדרכת הורים' })
  assert.deepEqual(english.provider, hebrew.provider)
  assert.equal(english.areaServed[0].name, 'Netanya')
  assert.equal(hebrew.areaServed[0].name, 'נתניה')
  assert.equal(english.areaServed.length, hebrew.areaServed.length)
  assert.equal(english.availableChannel, undefined)
  assert.equal(hebrew.availableChannel.availableLanguage.alternateName, 'he')
  assert.equal(english.inLanguage, undefined)
})

test('credential translations refer to the same published qualifications', () => {
  const en = schema.getProfessionalCredentials(siteUrl, 'en')
  const he = schema.getProfessionalCredentials(siteUrl, 'he')
  assert.deepEqual(en.map(c => c.url), he.map(c => c.url))
  for (const credential of en) {
    assert.match(credential.name, /Migdalor Campus \(2026\)/)
    assert.doesNotMatch(credential.name, /ICF|10 years/)
  }
})
