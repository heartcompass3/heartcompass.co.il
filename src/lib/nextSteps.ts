// Keep link labels and destinations in Sanity; only change their presentation.
export function splitNextSteps(body: any[] = []) {
  const index = body.findIndex(block => block.style === 'h2' &&
    ['מאיפה ממשיכים?', 'Where would you like to begin?'].includes(
      (block.children || []).map((span: any) => span.text || '').join('')))
  if (index < 0) return { body, title: '', links: [] }
  const tail = body.slice(index + 1)
  const links = tail.map(block => {
    const link = block.markDefs?.find((mark: any) => mark._type === 'link')
    const children = block.children || []
    if (!link || children.some((span: any) => span.text?.trim() && !span.marks?.includes(link._key))) return null
    return { href: link.href, label: children.map((span: any) => span.text || '').join('') }
  })
  // If editors add narrative text, preserve the full section as rich text.
  if (!links.length || links.some(link => !link)) return { body, title: '', links: [] }
  return { body: body.slice(0, index), title: body[index].children.map((span: any) => span.text || '').join(''), links }
}
