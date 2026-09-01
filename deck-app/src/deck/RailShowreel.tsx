import { useEffect, useState } from 'react';
import {
  FileText, GitBranch, ClipboardList, Wand2, LayoutDashboard, MessageSquare,
  FileCheck2, ScanBarcode, ScanLine, BellRing, Zap, KeyRound,
  type LucideIcon,
} from 'lucide-react';
import { asset } from './assetUrl';

/**
 * The lower half of the side rail, which was empty.
 *
 * The rail carried the mark, the caption for whatever is on the stage, and the QR at the
 * foot — and a hand's width of nothing in between, on every scene, for the whole loop. Two
 * things the deck never has room to say outright fit exactly there, so they take turns in
 * that space: who the company has actually served, and what the platform is made of.
 *
 * One slot, not two stacked blocks. A rail beside a moving stage can hold one quiet thing
 * changing slowly; two of them compete with the slide for the visitor's eye, which is the
 * one thing the rail must never do. So the panels cross-fade — out, swap, in — every few
 * seconds, and the marks inside pop in one after another rather than all at once.
 *
 * The two kinds alternate, so a visitor who glances twice sees one of each rather than
 * four consecutive logo walls.
 */

const HOLD_MS = 5200;
const FADE_MS = 420;

/**
 * Who the company has served, grouped the way the register itself groups them.
 *
 * Files are real marks under `public/assets/clients` (86 of them; these are the ones an
 * international visitor recognises). Six or nine per group so a three-wide row stays even.
 */
const CLIENT_GROUPS: { key: string; ar: string; en: string; files: string[] }[] = [
  {
    key: 'ministries',
    ar: 'الوزارات',
    en: 'Ministries',
    files: ['mof.png', 'moe.png', 'mone.png', 'mopwh.png', 'mot.png', 'mosd.png'],
  },
  {
    key: 'authorities',
    ar: 'الهيئات والدوائر الحكومية',
    en: 'Government authorities',
    files: ['pwa-auth.png', 'land-auth.png', 'pcbs.png', 'pbc.png', 'ptax-dir.png', 'detainees.png'],
  },
  {
    key: 'funders',
    ar: 'الممولون والشركاء الدوليون',
    en: 'International funders',
    files: ['world-bank.png', 'usaid.png', 'giz.png', 'tetra-tech.png', 'global-communities.png', 'btc.png'],
  },
  {
    key: 'cities',
    ar: 'البلديات والمدن',
    en: 'Municipalities & cities',
    files: ['jericho.png', 'bireh.png', 'tulkarem.png', 'birzeit-mun.png', 'dura.png', 'alram.png'],
  },
  {
    key: 'gaza',
    ar: 'بلديات قطاع غزة',
    en: 'Gaza Strip municipalities',
    files: ['breij.png', 'maghazi.png', 'khuzaa.png', 'shuka.png', 'zahra.png', 'fukhari.png'],
  },
  {
    key: 'academia',
    ar: 'الجامعات والقطاع الخاص',
    en: 'Universities & private sector',
    files: ['birzeit-univ.png', 'alquds-univ.png', 'ptu.png', 'paltel.png', 'hec.png', 'atlas-tech.png'],
  },
];

/**
 * What the platform is made of — every one of these is shipped code, not a roadmap.
 *
 * Deliberately NOT translated where the room says the word in English: a visitor at an
 * international stand reads Barcode and QR and AI faster than any Arabic coinage for them,
 * and a coined term reads as a translation exercise rather than as the company's own voice.
 */
const TECH_PANELS: { ar: string; en: string; items: { ar: string; en: string; Icon: LucideIcon }[] }[] = [
  {
    ar: 'يُبنى بالإعداد',
    en: 'Built by configuration',
    items: [
      { en: 'Dynamic Forms', ar: 'نماذج ديناميكية', Icon: FileText },
      { en: 'Workflow', ar: 'مسارات عمل', Icon: GitBranch },
      { en: 'Service Builder', ar: 'منشئ خدمات', Icon: ClipboardList },
      { en: 'Report Builder', ar: 'منشئ تقارير', Icon: Wand2 },
      { en: 'Dashboards', ar: 'لوحات', Icon: LayoutDashboard },
      { en: 'AI Assistant', ar: 'مساعد ذكي', Icon: MessageSquare },
    ],
  },
  {
    ar: 'يشتغل بنفسه',
    en: 'Runs on its own',
    items: [
      { en: 'QR Verification', ar: 'تحقّق من الوثيقة', Icon: FileCheck2 },
      { en: 'Barcode', ar: 'باركود', Icon: ScanBarcode },
      { en: 'Scan & Read', ar: 'مسح وقراءة', Icon: ScanLine },
      { en: 'Notifications', ar: 'إشعارات', Icon: BellRing },
      { en: 'Automation', ar: 'أتمتة', Icon: Zap },
      { en: 'Permissions', ar: 'صلاحيات', Icon: KeyRound },
    ],
  },
];

/** clients, tech, clients, tech — so a glance in either direction finds both stories. */
type Panel =
  | { kind: 'clients'; ar: string; en: string; files: string[] }
  | { kind: 'tech'; ar: string; en: string; items: { ar: string; en: string; Icon: LucideIcon }[] };

const PANELS: Panel[] = CLIENT_GROUPS.flatMap((group, i) => [
  { kind: 'clients' as const, ar: group.ar, en: group.en, files: group.files },
  { kind: 'tech' as const, ...TECH_PANELS[i % TECH_PANELS.length] },
]);

export default function RailShowreel({ accent }: { accent: string }) {
  const [at, setAt] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setShown(false), HOLD_MS);
    const swap = setTimeout(() => {
      setAt((n) => (n + 1) % PANELS.length);
      setShown(true);
    }, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(swap);
    };
  }, [at]);

  const panel = PANELS[at];

  return (
    // Only on the wide layout: on a phone the rail is a strip along the bottom, where this
    // would be competing with the caption for a few centimetres.
    <div className="hidden lg:block w-full" aria-hidden>
      <div
        className="transition-opacity duration-[420ms] ease-out"
        style={{ opacity: shown ? 1 : 0 }}
      >
        <p className="text-[10px] font-black tracking-[.1em] uppercase" style={{ color: accent }}>
          {panel.ar}
        </p>
        <p dir="ltr" className="text-[10px] font-semibold text-slate-400">{panel.en}</p>

        {panel.kind === 'clients' ? (
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {panel.files.map((file, i) => (
              <div
                key={`${at}-${file}`}
                className="showcase-pop grid place-items-center h-14 rounded-md ring-1 ring-slate-900/8 bg-white p-1"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <img
                  src={asset(`showcase/clients/${file}`)}
                  alt=""
                  loading="lazy"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {panel.items.map(({ en, ar, Icon }, i) => (
              <div
                key={`${at}-${en}`}
                className="showcase-pop flex flex-col items-center justify-center text-center gap-0.5 h-14 rounded-md ring-1 ring-slate-900/8 bg-white px-1"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} strokeWidth={2} />
                <span dir="ltr" className="text-[9px] font-black leading-none text-slate-700">{en}</span>
                <span className="text-[8px] leading-none text-slate-400">{ar}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
