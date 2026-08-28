import type { Showcase } from '../types'
import raw from './showcase.json'

export const SHOWCASE = raw as unknown as Showcase

export const clientLogo = (l: string) => `./assets/clients/${l}`
export const productLogo = (p: { slug: string; logo: string }) =>
  `./assets/products/${p.slug}/${p.logo}`
export const productImg = (slug: string, f: string) => `./assets/products/${slug}/${f}`

export const SVC_COLOR: Record<string, string> = {
  csc: '#0078e9',
  mad: '#d9640d',
  both: '#4a3aa7',
  water: '#0f9d8f',
}
