// יוצר עוגן (id) מטקסט כותרת. משמש גם ל-id בכותרות וגם לקישורי ה-TOC,
// כדי שיתאימו. שומר עברית, מסיר פיסוק, רווחים -> מקפים.
export function slugify(text = ''): string {
  return text
    .trim()
    .replace(/["'`?!.,:;()[\]{}]/g, '')
    .replace(/\s+/g, '-')
}
