import {
  Sparkles,
  ShieldCheck,
  Wand2,
  BarChart3,
  Droplets,
  Map as MapIcon,
  ClipboardList,
  Users,
  HardHat,
  Network,
  Receipt,
  Smartphone,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Handshake,
  Mail,
  Building2,
  Layers,
  Boxes,
  Code2,
  Globe,
  FileText,
  KeyRound,
  MessageSquare,
  Archive,
  Lightbulb,
  Server,
  Atom,
  Database,
  Container,
  Plug,
  LayoutDashboard,
  GitBranch,
  FileCheck2,
  BellRing,
  MapPin,
  Users2,
  type LucideIcon,
} from 'lucide-react';

/**
 * What the presentation draws behind the words.
 *
 * Real product screenshots are the intended end state — see `image` below. Until they land, each
 * slide animates an ABSTRACT shape of what its subject does, which is what an empty stage would
 * otherwise be. Nothing here claims to be a screen of the product.
 */
export type SlideVisual =
  | 'mark'
  | 'aiflow'
  | 'shield'
  | 'layers'
  | 'grid'
  | 'register'
  | 'map'
  | 'chart'
  | 'workflow'
  | 'device'
  | 'coverage'
  | 'logowall'
  | 'logogrid'
  | 'partnerwall'
  | 'chips'
  | 'funders'
  | 'ecosystem';

/**
 * The chapters the deck is grouped into.
 *
 * The progress bar clusters by these and labels each run, so a presenter asked "go back to the AI
 * part" clicks the AI band rather than hunting through twenty-six equal dots.
 */
export type ShowcaseSection = 'company' | 'ai' | 'platform' | 'products' | 'contact';

export interface ShowcaseSlide {
  /**
   * Part of the seven-scene elevator cut.
   *
   * A stand is walk-past traffic: the full deck runs eight minutes and nobody standing in
   * an aisle sees a whole turn of it. The short cut is a seventy-second loop that opens on
   * the assistant and proves it sits on a real system — the version a visitor actually
   * catches. The long one survives untouched for a meeting where someone sits down.
   */
  short?: boolean;
  /** Also the i18n key suffix: showcase.slides.<id>.* */
  id: string;
  section: ShowcaseSection;
  Icon: LucideIcon;
  visual: SlideVisual;
  /** How many b1..bN points the locale files carry. They reveal one at a time, PowerPoint-style. */
  points: number;
  accent: keyof typeof SLIDE_ACCENTS;
  /**
   * Explicit screens for a slide that is not about one product, as "<slug>/<file>" paths into
   * PRODUCT_SHOTS. Lets the AI slides show the assistant, and the record slides show the systems
   * they were funded to build, rather than a drawing standing in for either.
   */
  shots?: string[];
  /**
   * Show this product's mark instead of its screens.
   *
   * Four of the ten are older systems whose every capture — all 30 of BuildFlow's, all 46
   * of Eywa's — is a dense form from a decade ago. Beside the platform's screens they
   * read as the company's present rather than its history, and a visitor draws the wrong
   * conclusion from the pixels no matter what the words say. The slide keeps its title,
   * its tagline and every one of its feature cards; only the picture changes, from a
   * screen we would have to apologise for to a mark we would not.
   */
  logoOnly?: boolean;
  /**
   * The product whose REAL screenshots this slide shows, keyed into PRODUCT_SHOTS.
   *
   * When set, the stage cycles that product's actual screens and the abstract `visual` is not
   * drawn at all — a drawing only stands in where no screenshot exists.
   */
  product?: string;
  /**
   * A single real screenshot for a non-product slide, as a path under `public/showcase/`.
   *
   * Drop the file in, name it here, and the stage shows the screen instead of the abstract shape —
   * the copy, the timing and the point-by-point build all stay exactly as they are.
   */
  image?: string;
  /**
   * The nine capabilities, drawn as one board. Named here rather than in the locale files
   * because each carries its own icon and accent, which are design, not translation.
   */
  ecosystem?: { key: string; icon: keyof typeof CHIP_ICONS }[];
  /**
   * Short labels drawn as a tile grid — specializations, a technology stack, a method.
   * These are lists whose items are the picture: no screenshot says ".NET 10" and a
   * paragraph that does say it is not read at four metres.
   */
  chips?: { label: string; icon: keyof typeof CHIP_ICONS }[];
  /** Only for slides that correspond to a section of THIS platform, for the "open" affordance. */
  route?: string;
  moduleCode?: string;
}

/**
 * Presentation accents.
 *
 * `company` is the mark's own blue, sampled from `public/company-logo.png` (#2c5eff). The rest are
 * the saturated end of each product's family — literal colours because Tailwind 4 cannot see a
 * class name assembled at runtime (`bg-${hue}-500` compiles to nothing).
 */
/**
 * One accent per slide, as a single ink colour.
 *
 * Not a gradient and not a glow: on a light ground the accent's whole job is the eyebrow, the rule
 * under it, and the small marks — so it has to hold at 14px on white, which the pale end of a
 * gradient never does. `company` is the mark's own blue, sampled from `public/company-logo.png`.
 * Literal values because Tailwind 4 cannot see a class name assembled at runtime.
 */
/** Icons a chip may name. Kept explicit so an unknown name is a type error, not a blank tile. */
export const CHIP_ICONS = {
  Code2, Globe, Smartphone, Map: MapIcon, Sparkles, ClipboardList, Archive, Lightbulb,
  Server, Atom, Database, MapPin, Container, Plug,
  BarChart3, LayoutDashboard, GitBranch, FileText, FileCheck2, BellRing, KeyRound,
  Users, Wand2, MessageSquare,
} as const;

export const SLIDE_ACCENTS = {
  company: '#2c5eff',
  violet: '#7c3aed',
  sky: '#0284c7',
  teal: '#0d9488',
  emerald: '#059669',
  amber: '#b45309',
  indigo: '#4f46e5',
  orange: '#ea580c',
  cyan: '#0891b2',
  rose: '#e11d48',
  slate: '#475569',
} as const;

/**
 * The running order — a company profile, not a product tour.
 *
 * Who we are, then the AI that runs through everything we build, then the ten products, then the
 * record and how to reach us. Content comes from the company's own Company Profile and LEAP decks;
 * the AI slides additionally follow `docs/ai-assistant.md`, so what they claim is what the code
 * actually does.
 */
export const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  // ── Who we are ────────────────────────────────────────────────────────────
  { id: 'cover', section: 'company', Icon: Sparkles, visual: 'mark', points: 0, accent: 'company' },
  { id: 'company', short: true, section: 'company', Icon: Building2, visual: 'mark', shots: ['dwp/02.jpg', 'madeenati/01.jpg', 'eservices/01.jpg', 'eywa/01.jpg', 'buildflow/01.jpg', 'ptax/01.jpg'], points: 4, accent: 'company' },
  { id: 'reach', section: 'company', Icon: BarChart3, visual: 'logogrid', points: 5, accent: 'company' },
  { id: 'coverage', section: 'company', Icon: MapPin, visual: 'coverage', points: 4, accent: 'sky' },
  { id: 'clients', section: 'company', Icon: Users2, visual: 'logowall', points: 4, accent: 'company' },
  { id: 'projects', section: 'company', Icon: Landmark, visual: 'funders', points: 5, accent: 'slate' },
  { id: 'specializations', section: 'company', Icon: Layers, visual: 'chips', points: 4, accent: 'company',
    chips: [
      { label: 'تطوير الأنظمة والبرمجيات', icon: 'Code2' },
      { label: 'تطبيقات الويب', icon: 'Globe' },
      { label: 'تطبيقات الجوال', icon: 'Smartphone' },
      { label: 'نظم المعلومات الجغرافية', icon: 'Map' },
      { label: 'الذكاء الاصطناعي التطبيقي', icon: 'Sparkles' },
      { label: 'بوابات الخدمات الإلكترونية', icon: 'ClipboardList' },
      { label: 'الأرشفة الرقمية', icon: 'Archive' },
      { label: 'الاستشارات التقنية', icon: 'Lightbulb' },
    ] },
  { id: 'stack', section: 'company', Icon: Boxes, visual: 'chips', points: 4, accent: 'company',
    chips: [
      { label: '.NET 10', icon: 'Server' },
      { label: 'React 19', icon: 'Atom' },
      { label: 'PostgreSQL 18', icon: 'Database' },
      { label: 'PostGIS', icon: 'MapPin' },
      { label: 'Docker', icon: 'Container' },
      { label: 'REST · OpenAPI', icon: 'Plug' },
    ] },
  { id: 'partners', section: 'company', Icon: Handshake, visual: 'partnerwall', points: 5, accent: 'slate' },

  // ── The AI, before the products, because it runs through all of them ──────
  { id: 'ecosystem', short: true, section: 'platform', Icon: Boxes, visual: 'ecosystem', points: 3, accent: 'teal',
    ecosystem: [
      { key: 'eservices', icon: 'ClipboardList' },
      { key: 'hr', icon: 'Users' },
      { key: 'gis', icon: 'Map' },
      { key: 'mis', icon: 'BarChart3' },
      { key: 'portal', icon: 'Globe' },
      { key: 'documents', icon: 'FileCheck2' },
    ] },
  { id: 'capabilities', section: 'platform', Icon: Layers, visual: 'ecosystem', points: 3, accent: 'teal',
    ecosystem: [
      { key: 'workflow', icon: 'GitBranch' },
      { key: 'aiEngine', icon: 'Sparkles' },
      { key: 'forms', icon: 'FileText' },
      { key: 'reportBuilder', icon: 'LayoutDashboard' },
      { key: 'aiReports', icon: 'Wand2' },
      { key: 'assistant', icon: 'MessageSquare' },
      { key: 'notifications', icon: 'BellRing' },
      { key: 'permissions', icon: 'KeyRound' },
      { key: 'apiFirst', icon: 'Plug' },
    ] },
  { id: 'aiAssistant', short: true, section: 'ai', Icon: Sparkles, visual: 'aiflow', shots: ['dwp/03.jpg'], points: 3, accent: 'violet' },
  { id: 'aiAnswers', short: true, section: 'ai', Icon: Sparkles, visual: 'aiflow', shots: ['dwp/04.jpg'], points: 3, accent: 'violet' },
  { id: 'aiMap', short: true, section: 'ai', Icon: MapPin, visual: 'aiflow', shots: ['dwp/05.jpg'], points: 3, accent: 'violet' },
  // The one slide that keeps a diagram: it is a claim about WHERE the permission check
  // sits, and no screenshot shows a place in an architecture.
  { id: 'aiSafety', section: 'ai', Icon: ShieldCheck, visual: 'aiflow', points: 4, accent: 'emerald' },
  { id: 'aiReport', section: 'ai', Icon: Wand2, visual: 'chart', shots: ['dwp/06.jpg'], points: 3, accent: 'indigo' },
  { id: 'aiReportBuilder', section: 'ai', Icon: Wand2, visual: 'chart', shots: ['dwp/09.jpg'], points: 3, accent: 'indigo' },
  { id: 'aiDashboard', short: true, section: 'ai', Icon: LayoutDashboard, visual: 'chart', shots: ['dwp/10.jpg'], points: 3, accent: 'indigo' },
  { id: 'aiDashboardBuild', section: 'ai', Icon: LayoutDashboard, visual: 'chart', shots: ['dwp/11.jpg'], points: 3, accent: 'indigo' },

  // ── What the platform underneath every product does ───────────────────────
  { id: 'workflow', section: 'platform', Icon: GitBranch, visual: 'workflow', shots: ['dwp/12.jpg', 'dwp/19.jpg', 'dwp/20.jpg', 'dwp/22.jpg'], points: 5, accent: 'orange' },
  { id: 'services', section: 'platform', Icon: ClipboardList, visual: 'workflow', shots: ['dwp/17.jpg', 'dwp/18.jpg', 'dwp/21.jpg', 'dwp/14.jpg', 'dwp/16.jpg'], points: 5, accent: 'cyan' },
  { id: 'documents', section: 'platform', Icon: FileCheck2, visual: 'grid', shots: ['dwp/24.jpg', 'dwp/13.jpg'], points: 4, accent: 'emerald' },
  { id: 'geo', section: 'platform', Icon: MapIcon, visual: 'map', shots: ['dwp/02.jpg', 'dwp/07.jpg', 'dwp/08.jpg'], points: 4, accent: 'amber' },
  { id: 'notifications', section: 'platform', Icon: BellRing, visual: 'workflow', shots: ['dwp/15.jpg', 'dwp/23.jpg', 'dwp/01.jpg'], points: 4, accent: 'rose' },

  // ── The products ──────────────────────────────────────────────────────────
  { id: 'dwp', section: 'products', Icon: Droplets, visual: 'layers', product: 'dwp', points: 5, accent: 'sky', route: '/dashboard' },
  { id: 'madeenati', section: 'products', Icon: MapIcon, visual: 'map', product: 'madeenati', points: 5, accent: 'amber' },
  { id: 'eservices', section: 'products', Icon: ClipboardList, visual: 'workflow', product: 'eservices', points: 5, accent: 'cyan' },
  { id: 'eywa', section: 'products', Icon: Users, visual: 'register', product: 'eywa', logoOnly: true, points: 5, accent: 'violet' },
  { id: 'buildflow', section: 'products', Icon: HardHat, visual: 'chart', product: 'buildflow', logoOnly: true, points: 5, accent: 'orange' },
  { id: 'wsdis', section: 'products', Icon: Network, visual: 'map', product: 'wsdis', points: 5, accent: 'teal', route: '/wsdis', moduleCode: 'WSDIS' },
  { id: 'ptax', section: 'products', Icon: Receipt, visual: 'register', product: 'ptax', logoOnly: true, points: 5, accent: 'emerald' },
  { id: 'pwaApp', section: 'products', Icon: Smartphone, visual: 'device', product: 'pwa-app', points: 5, accent: 'sky' },
  { id: 'atlas', section: 'products', Icon: GraduationCap, visual: 'layers', product: 'atlas', points: 4, accent: 'rose' },
  { id: 'social', section: 'products', Icon: HeartHandshake, visual: 'chart', product: 'social', logoOnly: true, points: 4, accent: 'indigo' },

  // ── The way in ────────────────────────────────────────────────────────────
  { id: 'contact', short: true, section: 'contact', Icon: Mail, visual: 'mark', points: 4, accent: 'company' },
];

/** Chapter order, for the clustered nav. */
export const SHOWCASE_SECTIONS: ShowcaseSection[] = ['company', 'ai', 'platform', 'products', 'contact'];

/**
 * The screens each product slide actually shows, chosen by eye and ordered as a walk-through.
 *
 * A product folder holds twenty to forty screens and a slide has room for five, so left to file
 * order the deck opened every product on whatever happened to be `01.jpg` — for several that is a
 * dense entry form. These lead with the screen that shows what the product IS (a map, a portfolio,
 * a dashboard) and then move inward to the registers and the detail behind it.
 */
export const PRODUCT_PICKS: Record<string, string[]> = {
  // The map first — Madeenati is a GIS, and its registers mean nothing before you have seen it.
  // the maps carry it; 24 and 43 were near-empty tables
  madeenati: ['01.jpg', '02.jpg', '03.jpg'],
  // Citizen portal, then the request register with its status colours, then the back office.
  // 27 was a stock illustration, which reads as having no real screen
  eservices: ['01.jpg', '06.jpg', '11.jpg'],
  eywa: ['25.jpg', '30.jpg', '21.jpg', '20.jpg', '46.jpg'],
  buildflow: ['03.jpg', '22.jpg', '23.jpg', '24.jpg', '16.jpg'],
  // The three network maps carry this one; the tables come after.
  // the network maps hold up; the grey admin tables date it
  wsdis: ['01.jpg', '02.jpg', '03.jpg'],
  ptax: ['01.jpg', '08.jpg', '10.jpg', '13.jpg', '20.jpg'],
  // The app grid is the recognisable screen, so it opens rather than closes.
  'pwa-app': ['14.jpg', '12.jpg', '13.jpg', '09.jpg', '03.jpg'],
  atlas: ['01.jpg', '02.jpg', '03.jpg', '07.jpg', '09.jpg'],
  social: ['07.jpg', '03.jpg', '04.jpg', '05.jpg', '01.jpg'],
  // One from each part of the platform, since this slide stands for all of it.
  dwp: ['03.jpg', '06.jpg', '11.jpg', '12.jpg', '24.jpg', '02.jpg'],
};

/** How long each slide holds before the deck advances on its own. */
export const SLIDE_DURATION_MS = 14_000;

/**
 * Product slides hold longer, because they are showing real screens rather than one drawing:
 * at SCREEN_HOLD_MS apart, this is five or six actual screenshots per product.
 */
export const PRODUCT_SLIDE_DURATION_MS = 20_000;

/**
 * Where the QR sends a visitor.
 *
 * The company's own site, not `window.location.origin` — the deck is shown at an exhibition, where
 * the person scanning wants Al-Ameen, not the platform instance the laptop happens to be serving.
 */
export const QR_TARGET = 'https://alameentech.com';

/**
 * The share of a slide spent revealing its points.
 *
 * Points appear one at a time across this fraction of the slide, so the deck reads as narration
 * rather than a wall of text that lands at once; the rest of the slide holds the finished list
 * still, long enough to be read.
 */
export const POINT_BUILD_SHARE = 0.62;

/**
 * Which cut is playing.
 *
 * `?deck=full` opens the long version; anything else gets the elevator cut, because the
 * default viewer is a stranger walking past a screen, not a client in a chair.
 */
export function activeSlides(): ShowcaseSlide[] {
  const full = new URLSearchParams(window.location.search).get('deck') === 'full';
  if (full) return SHOWCASE_SLIDES;
  // Explicit order, not source order. The cut escalates — who we are, that this is a real
  // system, the assistant, then ask, analyse, connect — and the ecosystem has to land
  // second, before the assistant, or the assistant reads as a chat box with no platform
  // under it. In source order it falls after the AI section and arrives too late to do
  // that job.
  const ORDER = ['cover', 'ecosystem', 'aiAssistant', 'aiAnswers', 'aiMap', 'aiDashboard'];
  return ORDER.flatMap((id) => SHOWCASE_SLIDES.filter((s) => s.id === id));
}
