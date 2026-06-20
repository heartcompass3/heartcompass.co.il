// אופטימיזציית תמונות דרך Sanity CDN:
// מוסיף רוחב מותאם + פורמט אוטומטי (WebP/AVIF) + דחיסה.
// פועל רק על כתובות cdn.sanity.io; כתובות אחרות חוזרות כמו שהן.
export function optImg(url?: string, w = 1200, q = 80): string | undefined {
  if (!url || !url.includes('cdn.sanity.io')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}w=${w}&auto=format&fit=max&q=${q}`
}
