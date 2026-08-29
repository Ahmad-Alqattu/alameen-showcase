/** Bilingual pair: [arabic, english] */
export type Bi = [string, string]

export interface ProductImage {
  f: string
  w: number
  h: number
  cap?: Bi
  note?: Bi
}

export interface ProductUser {
  n: Bi
  l: string | null
}

/**
 * A deployed client system. Citizen-facing portals carry a URL and open in a
 * new tab; staff-facing systems carry `url: null` and are shown as a
 * screenshot only — an internal login screen does not belong on a public link.
 */
export interface Portal {
  n: Bi
  l: string
  shot: string
  url: string | null
  gov: string
  w: number
  h: number
}

/** A published mobile app: the store listing plus its own phone screenshots. */
export interface AppEntry {
  n: Bi
  icon: string
  shots: { f: string; w: number; h: number }[]
  url: string
}

export interface Product {
  slug: string
  logo: string
  flagship?: boolean
  sector: Bi
  name: Bi
  tag: Bi
  about: Bi
  feats: Bi[]
  client: Bi
  imgs: ProductImage[]
  users?: ProductUser[]
  usersNote?: Bi
  portals?: Portal[]
  apps?: AppEntry[]
  staff?: Portal[]
}

export interface ClientItem {
  n: Bi
  l: string | null
}

export interface ClientGroup {
  key: string
  title: Bi
  items: ClientItem[]
}

export interface Company {
  about: Bi
  vision: Bi[]
  /** [year, arabic, english] */
  milestones: [string, string, string][]
  /** [title_ar, funder_ar, title_en, funder_en] */
  projects: [string, string, string, string][]
  /** [count, arabic, english] */
  beneficiaries: [string, string, string][]
  contact: { hq: Bi; phone: string; mobile: string; email: string; web: string }
}

export interface GovPath {
  code: string
  nameAr: string
  nameEn: string
  d: string
  cx: number
  cy: number
  area: number
  fill: string
}

export type Service = 'csc' | 'mad' | 'both' | 'water'

export interface MapPoint {
  n: Bi
  g: Bi
  lat: number
  lon: number
  s: Service
  l: string | null
}

export interface MapData {
  w: number
  h: number
  proj: { lon0: number; lon1: number; lat0: number; lat1: number }
  paths: GovPath[]
  points: MapPoint[]
}

export interface Showcase {
  products: Product[]
  company: Company
  clients: ClientGroup[]
  partners: ClientItem[]
  map: MapData
}
