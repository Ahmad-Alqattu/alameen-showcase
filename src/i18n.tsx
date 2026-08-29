import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Bi } from './types'

export type Lang = 'ar' | 'en'

const DICT = {
  ar: {
    overline: 'الأمين للتقنيات — ملف تعريفي',
    heroTitle: ['حلولٌ رقمية ', 'تُدار بها', ' مدنٌ ومؤسسات'],
    heroSub:
      'منذ 2008 نبني أنظمة حكومية وبلدية تعمل فعلياً: من المنصة الوطنية للمياه إلى نظم المعلومات الجغرافية والخدمات الإلكترونية والموارد البشرية — في فلسطين والشرق الأوسط.',
    stat1: 'تأسست الشركة',
    stat2: 'منتجات مطبَّقة',
    stat3: 'جهة تخدمها حلولنا',
    stat4: 'لقطة حية من الأنظمة',
    productsLabel: 'المنتجات',
    productsH2: 'منتجاتنا وحلولنا',
    productsSub:
      'كل منتج مبني على احتياج حقيقي ومُشغَّل لدى جهات فعلية — افتح أي بطاقة لتشاهد شاشاته الحية وتفاصيله.',
    aboutLabel: 'عن الشركة',
    aboutH2: 'من نحن',
    projectsLabel: 'مشاريع بارزة',
    clientsLabel: 'عملاؤنا',
    clientsH2: 'جهات وثقت بنا',
    clientsSub:
      'وزارات وهيئات حكومية و54 بلدية وجامعات ومؤسسات دولية — أكثر من 85 جهة تعمل حلولنا لديها.',
    covLabel: 'خريطة الانتشار',
    covH2: 'أين تعمل حلولنا',
    covSub: 'كل نقطة بلدية أو هيئة تعمل أنظمتنا لديها فعلياً — من جنين حتى رفح.',
    legCsc: 'منصة الخدمات الإلكترونية',
    legMad: 'مدينتي GIS',
    legBoth: 'الخدمات الإلكترونية + مدينتي',
    legWater: 'قطاع المياه',
    mapHint: 'اسحب للتنقل · عجلة الفأرة أو الأزرار للتكبير · المس النقطة لعرض اللوجو',
    partnersLabel: 'شركاؤنا التقنيون',
    usersH: 'جهات تستخدمه',
    sideStaff: 'وجه الموظف',
    sideCitizen: 'وجه المواطن',
    portalsH: 'بورتالات المواطنين',
    portalsSub: 'وجه المواطن أعلاه ليس نموذجاً — هذه هي البلديات التي يعمل فيها الآن. اللقطة من الموقع نفسه، والبطاقة تفتحه في تبويب جديد لمن أراد أن يتصفّحه بنفسه.',
    portalsNote: 'البورتالات على شبكة البلديات — قد لا تُفتح من خلف بعض الشبكات أو بلا اتصال.',
    appsH: 'وعلى الهاتف',
    appsSub: 'التطبيقات نفسها منشورة على Google Play باسم Alameen Technologies — واللقطات من صفحة كل تطبيق.',
    staffH: 'أنظمة الموظفين',
    staffSub: 'الوجه الداخلي للمنصة، حيث يعالج موظف البلدية الطلب. أنظمة داخلية — تُعرض لقطةً فقط دون رابط.',
    navProducts: 'المنتجات',
    navAi: 'الذكاء الاصطناعي',
    navAbout: 'عن الشركة',
    navClients: 'عملاؤنا',
    navContact: 'تواصل',
    back: 'كل المنتجات',
    aboutH: 'عن المنتج',
    featsH: 'أبرز المكوّنات',
    flagBadge: 'المنتج الرائد',
    shots: 'لقطة',
    langBtn: 'English',
  },
  en: {
    overline: 'Al-Ameen Technologies — Company Profile',
    heroTitle: ['Digital solutions ', 'that run', ' cities & institutions'],
    heroSub:
      'Since 2008 we build government and municipal systems that actually run — from the national water platform to GIS, e-services and HR, across Palestine and the Middle East.',
    stat1: 'Company founded',
    stat2: 'Products in production',
    stat3: 'Client organizations',
    stat4: 'Live system screens',
    productsLabel: 'Products',
    productsH2: 'Products & Solutions',
    productsSub:
      'Every product answers a real operational need and runs at real organizations — open any card for live screens and details.',
    aboutLabel: 'About',
    aboutH2: 'Who we are',
    projectsLabel: 'Selected projects',
    clientsLabel: 'Our clients',
    clientsH2: 'Organizations that trust us',
    clientsSub:
      'Ministries, government authorities, 54 municipalities, universities and international agencies — 85+ organizations run our solutions.',
    covLabel: 'Coverage map',
    covH2: 'Where our solutions run',
    covSub: 'Every dot is a municipality or authority where our systems actually run — from Jenin to Rafah.',
    legCsc: 'E-Services platform',
    legMad: 'Madeenati GIS',
    legBoth: 'E-Services + Madeenati',
    legWater: 'Water sector',
    mapHint: 'Drag to pan · wheel or buttons to zoom · tap a dot for the logo',
    partnersLabel: 'Technology partners',
    usersH: 'Used by',
    sideStaff: 'Officer’s side',
    sideCitizen: 'Citizen’s side',
    portalsH: 'Citizen portals',
    portalsSub: 'The citizen side above is not a mock-up — these are the municipalities it runs in today. Each screenshot is of that site, and the card opens it in a new tab for anyone who wants to browse it themselves.',
    portalsNote: 'Portals sit on the municipality network — they may not open from behind some networks, or offline.',
    appsH: 'And on the phone',
    appsSub: 'The same services shipped as apps, published on Google Play under Alameen Technologies — screenshots are from each listing.',
    staffH: 'Staff systems',
    staffSub: 'The inside of the platform, where a municipal officer handles the request. Internal systems — shown as a screenshot, with no outward link.',
    navProducts: 'Products',
    navAi: 'AI',
    navAbout: 'About',
    navClients: 'Clients',
    navContact: 'Contact',
    back: 'All products',
    aboutH: 'About the product',
    featsH: 'Key modules',
    flagBadge: 'Flagship',
    shots: 'screens',
    langBtn: 'عربي',
  },
} as const

export type DictKey = keyof (typeof DICT)['ar']

interface I18n {
  lang: Lang
  t: (k: DictKey) => string
  heroTitle: readonly [string, string, string]
  /** Pick from a [ar, en] pair */
  L: (pair: Bi) => string
  /** The opposite language of a pair (used for the secondary name line) */
  Lx: (pair: Bi) => string
  toggle: () => void
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar')
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }, [lang])
  const value: I18n = {
    lang,
    t: (k) => DICT[lang][k] as string,
    heroTitle: DICT[lang].heroTitle,
    L: (pair) => pair[lang === 'ar' ? 0 : 1],
    Lx: (pair) => pair[lang === 'ar' ? 1 : 0],
    toggle: () => setLang((l) => (l === 'ar' ? 'en' : 'ar')),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18n {
  const v = useContext(Ctx)
  if (!v) throw new Error('useI18n outside provider')
  return v
}

export const hasArabic = (s: string) => /[؀-ۿ]/.test(s)
