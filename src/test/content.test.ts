import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { SHOWCASE } from '../data'
import type { Bi } from '../types'

/**
 * Content integrity. showcase.json is edited far more often than the code is,
 * so these guard the failure that actually happens: a renamed or missing asset
 * that only shows up as a broken image at the exhibition booth.
 */

const pub = (p: string) => resolve(__dirname, '../../public', p.replace(/^\.\//, ''))
const assetExists = (p: string) => existsSync(pub(p))

/** Every [ar, en] pair must have both halves filled in. */
const bothLangs = (b: Bi) => b.length === 2 && b.every((s) => typeof s === 'string' && s.trim().length > 0)

describe('products', () => {
  it('has products, each with a unique slug', () => {
    const slugs = SHOWCASE.products.map((p) => p.slug)
    expect(slugs.length).toBeGreaterThan(0)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has exactly one flagship', () => {
    expect(SHOWCASE.products.filter((p) => p.flagship).length).toBe(1)
  })

  it.each(SHOWCASE.products.map((p) => [p.slug, p] as const))('%s: logo file exists', (_slug, p) => {
    expect(assetExists(`assets/products/${p.slug}/${p.logo}`)).toBe(true)
  })

  it.each(SHOWCASE.products.map((p) => [p.slug, p] as const))('%s: every screenshot exists and is sized', (_slug, p) => {
    expect(p.imgs.length).toBeGreaterThan(0)
    for (const img of p.imgs) {
      expect(assetExists(`assets/products/${p.slug}/${img.f}`), `missing ${p.slug}/${img.f}`).toBe(true)
      expect(img.w).toBeGreaterThan(0)
      expect(img.h).toBeGreaterThan(0)
    }
  })

  it.each(SHOWCASE.products.map((p) => [p.slug, p] as const))('%s: bilingual text is complete', (_slug, p) => {
    for (const field of [p.name, p.tag, p.about, p.sector, p.client]) expect(bothLangs(field)).toBe(true)
    expect(p.feats.length).toBeGreaterThan(0)
    for (const f of p.feats) expect(bothLangs(f)).toBe(true)
  })

  it.each(SHOWCASE.products.map((p) => [p.slug, p] as const))('%s: captions are bilingual and complete', (_slug, p) => {
    for (const img of p.imgs) {
      if (img.cap) expect(bothLangs(img.cap)).toBe(true)
      // a note without a caption would render an orphan line
      if (img.note) expect(img.cap).toBeDefined()
    }
  })

  it.each(SHOWCASE.products.filter((p) => p.users?.length).map((p) => [p.slug, p] as const))(
    '%s: "used by" logos exist',
    (_slug, p) => {
      for (const u of p.users!) {
        expect(bothLangs(u.n)).toBe(true)
        if (u.l) expect(assetExists(`assets/clients/${u.l}`), `missing client logo ${u.l}`).toBe(true)
      }
    },
  )
})

describe('clients', () => {
  it('groups are non-empty and uniquely keyed', () => {
    const keys = SHOWCASE.clients.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const g of SHOWCASE.clients) {
      expect(bothLangs(g.title)).toBe(true)
      expect(g.items.length).toBeGreaterThan(0)
    }
  })

  it('every client logo file exists', () => {
    const missing: string[] = []
    for (const g of SHOWCASE.clients)
      for (const it of g.items) {
        expect(bothLangs(it.n)).toBe(true)
        if (it.l && !assetExists(`assets/clients/${it.l}`)) missing.push(`${g.key}/${it.n[1]} -> ${it.l}`)
      }
    expect(missing).toEqual([])
  })

  it('partners resolve too', () => {
    for (const p of SHOWCASE.partners) {
      expect(bothLangs(p.n)).toBe(true)
      if (p.l) expect(assetExists(`assets/clients/${p.l}`), `missing partner logo ${p.l}`).toBe(true)
    }
  })

  it('no duplicate client names within a group', () => {
    for (const g of SHOWCASE.clients) {
      const names = g.items.map((i) => i.n[1])
      expect(new Set(names).size, `duplicates in ${g.key}`).toBe(names.length)
    }
  })
})

describe('coverage map', () => {
  const { map } = SHOWCASE

  it('has governorate shapes with drawable paths', () => {
    expect(map.paths.length).toBeGreaterThan(0)
    for (const g of map.paths) {
      expect(g.d.startsWith('M')).toBe(true)
      expect(g.nameAr.length).toBeGreaterThan(0)
      expect(g.nameEn.length).toBeGreaterThan(0)
    }
  })

  it('every point falls inside the projection window', () => {
    const { lon0, lon1, lat0, lat1 } = map.proj
    for (const p of map.points) {
      expect(p.lon, `${p.n[1]} longitude`).toBeGreaterThanOrEqual(lon0)
      expect(p.lon, `${p.n[1]} longitude`).toBeLessThanOrEqual(lon1)
      expect(p.lat, `${p.n[1]} latitude`).toBeGreaterThanOrEqual(lat0)
      expect(p.lat, `${p.n[1]} latitude`).toBeLessThanOrEqual(lat1)
    }
  })

  it('every point has a known service and existing logo', () => {
    const services = new Set(['csc', 'mad', 'both', 'water'])
    for (const p of map.points) {
      expect(services.has(p.s), `${p.n[1]} service ${p.s}`).toBe(true)
      expect(bothLangs(p.n)).toBe(true)
      expect(bothLangs(p.g)).toBe(true)
      if (p.l) expect(assetExists(`assets/clients/${p.l}`), `missing pin logo ${p.l}`).toBe(true)
    }
  })

  it('no two points share the exact same coordinates', () => {
    const seen = new Map<string, string>()
    const clashes: string[] = []
    for (const p of map.points) {
      const k = `${p.lat},${p.lon}`
      if (seen.has(k)) clashes.push(`${p.n[1]} == ${seen.get(k)}`)
      seen.set(k, p.n[1])
    }
    expect(clashes).toEqual([])
  })
})

describe('company profile', () => {
  const c = SHOWCASE.company
  it('is fully bilingual', () => {
    expect(bothLangs(c.about)).toBe(true)
    for (const v of c.vision) expect(bothLangs(v)).toBe(true)
    expect(bothLangs(c.contact.hq)).toBe(true)
  })
  it('milestones are chronological', () => {
    const years = c.milestones.map((m) => Number(m[0]))
    expect([...years].sort((a, b) => a - b)).toEqual(years)
  })
  it('projects name a funder', () => {
    for (const p of c.projects) expect(p.every((s) => s.trim().length > 0)).toBe(true)
  })
})

describe('brand assets', () => {
  it('company logos and fonts ship with the site', () => {
    for (const f of [
      'assets/logo-alameen.png',
      'assets/logo-alameen-white.png',
      'assets/fonts/readex-arabic.woff2',
      'assets/fonts/readex-latin.woff2',
      'icons/icon-192.png',
      'icons/icon-512.png',
      'manifest.webmanifest',
      'sw.js',
    ])
      expect(assetExists(f), `missing ${f}`).toBe(true)
  })
})

describe('client portals and apps', () => {
  const es = SHOWCASE.products.find((p) => p.slug === 'eservices')!

  it('every portal has a screenshot, a logo and a reachable-looking URL', () => {
    expect(es.portals?.length).toBeGreaterThan(0)
    for (const p of es.portals!) {
      expect(bothLangs(p.n)).toBe(true)
      expect(assetExists(`assets/portals/${p.shot}`), `missing shot ${p.shot}`).toBe(true)
      expect(assetExists(`assets/clients/${p.l}`), `missing logo ${p.l}`).toBe(true)
      expect(p.url).toMatch(/^https?:\/\//)
    }
  })

  it('every citizen portal is linked', () => {
    for (const p of es.portals!) expect(p.url, `${p.n[1]} should link`).toBeTruthy()
  })

  it('every app has an icon, phone shots and a store link', () => {
    expect(es.apps?.length).toBeGreaterThan(0)
    for (const a of es.apps!) {
      expect(bothLangs(a.n)).toBe(true)
      expect(assetExists(`assets/apps/${a.icon}`), `missing icon ${a.icon}`).toBe(true)
      expect(a.shots.length).toBeGreaterThan(0)
      for (const sh of a.shots) expect(assetExists(`assets/apps/${sh.f}`), `missing ${sh.f}`).toBe(true)
      expect(a.url).toContain('play.google.com')
    }
  })
})

describe('the recorded demo', () => {
  it('ships both codecs and a poster', () => {
    for (const f of ['assets/video/sabr_demo.webm', 'assets/video/sabr_demo.mp4', 'assets/video/sabr_poster.jpg'])
      expect(assetExists(f), `missing ${f}`).toBe(true)
  })
})

describe('AI band screenshots', () => {
  /**
   * The band references product screenshots by filename directly rather than
   * through showcase.json, so nothing else would catch a rename.
   */
  it.each(['03.jpg', '25.jpg', '05.jpg', '09.jpg'])('dwp/%s exists', (f) => {
    expect(assetExists(`assets/products/dwp/${f}`)).toBe(true)
  })
})
