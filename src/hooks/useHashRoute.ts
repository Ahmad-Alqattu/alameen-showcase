import { useEffect, useState } from 'react'

/** Returns the product slug from `#/p/<slug>`, or null on the home route. */
export function useHashRoute(): string | null {
  const read = () => {
    const m = window.location.hash.match(/^#\/p\/([\w-]+)/)
    return m ? m[1] : null
  }
  const [slug, setSlug] = useState<string | null>(read)
  useEffect(() => {
    const on = () => setSlug(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return slug
}

export const goHome = () => { window.location.hash = '#/' }
