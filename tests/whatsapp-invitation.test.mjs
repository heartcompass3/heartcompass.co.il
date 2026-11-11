import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

const source = await readFile(new URL('../src/components/ExitIntentWhatsApp.astro', import.meta.url), 'utf8')
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1]
function setup({ touch = false, consent = 'accepted', seen, sessionSeen = false } = {}) {
  const events = () => {
    const listeners = new Map()
    return {
      addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn) },
      removeEventListener(type, fn) { listeners.get(type)?.delete(fn) },
      emit(type, event = {}) { for (const fn of [...(listeners.get(type) || [])]) fn(event) },
    }
  }
  const control = (expanded = 'false') => ({ getAttribute: () => expanded, set expanded(value) { expanded = value } })
  const classes = new Set(['hidden'])
  const close = events(), cta = events(), a11y = control(), wa = control()
  const root = {
    classList: { add: x => classes.add(x), remove: x => classes.delete(x) },
    querySelector: selector => selector === '[data-exit-close]' ? close : selector === '[data-exit-cta]' ? cta : null,
  }
  const data = new Map([['hc_cookie_consent', consent]])
  if (seen !== undefined) data.set('hc_exit_wa', String(seen))
  const session = new Map(sessionSeen ? [['hc_exit_wa', 'seen']] : [])
  const storage = map => ({ getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, value) })
  let now = 2_000_000_000
  const timers = new Map()
  const document = {
    ...events(), visibilityState: 'visible', documentElement: { scrollHeight: 3000 }, activeElement: null,
    querySelector: selector => selector === '[data-exit-root]' ? root : selector === '[data-a11y-toggle]' ? a11y : selector === '[data-wa-button]' ? wa : null,
  }
  const window = { ...events(), innerHeight: 1000, scrollY: 0, matchMedia: () => ({ matches: touch }) }
  vm.runInNewContext(script, {
    document, window, Element: class Element {}, Date: { now: () => now },
    localStorage: storage(data), sessionStorage: storage(session),
    requestAnimationFrame: fn => fn(), setTimeout: fn => { fn(); return 1 },
    setInterval: fn => { timers.set(1, fn); return 1 }, clearInterval: id => timers.delete(id),
  })
  return {
    document, a11y, wa, close, data, session,
    shown: () => !classes.has('hidden'),
    advance(ms) { for (let elapsed = 0; elapsed < ms; elapsed += 1000) { now += 1000; for (const fn of [...timers.values()]) fn() } },
    scroll(fraction) { window.scrollY = fraction * 2000; window.emit('scroll') },
    exit() { document.emit('mouseout', { clientY: 0, relatedTarget: null }) },
    visibility(value) { document.visibilityState = value; document.emit('visibilitychange') },
  }
}

test('desktop exit requires 90 visible seconds AND 40% scroll', () => {
  const page = setup()
  page.scroll(.5); page.exit(); assert.equal(page.shown(), false)
  page.advance(89000); page.exit(); assert.equal(page.shown(), false)
  page.advance(1000); assert.equal(page.shown(), false)
  page.exit(); assert.equal(page.shown(), true)
  assert.ok(page.data.get('hc_exit_wa'))
  assert.equal(page.session.get('hc_exit_wa'), 'seen')
  page.close.emit('click'); assert.equal(page.shown(), false)
  page.exit(); assert.equal(page.shown(), false)
})

test('mobile waits for reading and scroll, regardless of which happens first', () => {
  const timeFirst = setup({ touch: true })
  timeFirst.advance(90000); assert.equal(timeFirst.shown(), false)
  timeFirst.scroll(.39); assert.equal(timeFirst.shown(), false)
  timeFirst.scroll(.4); assert.equal(timeFirst.shown(), true)
  const scrollFirst = setup({ touch: true })
  scrollFirst.scroll(.5); scrollFirst.advance(89000); assert.equal(scrollFirst.shown(), false)
  scrollFirst.advance(1000); assert.equal(scrollFirst.shown(), true)
})

test('background tab time does not count towards reading time', () => {
  const page = setup({ touch: true })
  page.scroll(.5); page.advance(30000)
  page.visibility('hidden'); page.advance(180000); assert.equal(page.shown(), false)
  page.visibility('visible'); page.advance(59000); assert.equal(page.shown(), false)
  page.advance(1000); assert.equal(page.shown(), true)
})

test('cookie banner, accessibility, WhatsApp panel and form editing take priority', () => {
  for (const blocker of ['consent', 'a11y', 'wa', 'editing']) {
    const page = setup({ touch: true, consent: blocker === 'consent' ? '' : 'accepted' })
    if (blocker === 'a11y') page.a11y.expanded = 'true'
    if (blocker === 'wa') page.wa.expanded = 'true'
    if (blocker === 'editing') page.document.activeElement = { matches: () => true }
    page.scroll(.5); page.advance(90000); assert.equal(page.shown(), false, blocker)
    page.data.set('hc_cookie_consent', 'declined'); page.a11y.expanded = 'false'; page.wa.expanded = 'false'; page.document.activeElement = null
    page.advance(1000); assert.equal(page.shown(), true, blocker)
  }
})

test('frequency cap and manual WhatsApp interaction suppress automatic invitations', () => {
  for (const options of [{ sessionSeen: true }, { seen: 2_000_000_000 - 86400000 }]) {
    const page = setup({ ...options, touch: true })
    page.scroll(.8); page.advance(180000); assert.equal(page.shown(), false)
  }
  const page = setup({ touch: true })
  page.document.emit('hc:whatsapp-open'); page.scroll(.8); page.advance(180000)
  assert.equal(page.shown(), false)
  const expired = setup({ touch: true, seen: 2_000_000_000 - 15 * 86400000 })
  expired.scroll(.5); expired.advance(90000); assert.equal(expired.shown(), true)
})
