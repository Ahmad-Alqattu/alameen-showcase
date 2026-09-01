import { useEffect, useState } from 'react';
import {
  FileText, GitBranch, ClipboardList, Wand2, LayoutDashboard, MessageSquare,
  FileCheck2, ScanBarcode, ScanText, BellRing, Zap, Plug,
  type LucideIcon,
} from 'lucide-react';
import { asset } from './assetUrl';
import { useBilingual } from './bilingual';

/**
 * The side rail's lower half — two blocks that between them fill it.
 *
 * It started as one slot showing one thing at a time, and that was the mistake: a visitor
 * who glanced at the rail saw six ministry marks and concluded the company works for
 * ministries. A rotating panel only reads as "a sample of many" if you watch it rotate, and
 * nobody at a stand watches a rail. So the two stories stand at once, stacked, and only the
 * client block cycles — through fuller groups, nine marks at a time, so each turn already
 * looks like a lot rather than like all there is.
 *
 * The capability block below it is the slide that used to be scene eleven, shrunk. Twelve
 * tiles were worth a board when the deck had thirty-five scenes to spend; as a thing the
 * visitor should be able to check at any moment — while the assistant is answering, while
 * the film is playing — they are worth more here, permanently, than they were worth once.
 */

const HOLD_MS = 5200;
const FADE_MS = 420;

/**
 * Who the company has served, in groups big enough that one of them is not mistaken for the
 * whole answer. Files are real marks under `public/assets/clients` (86 in the register).
 */
const CLIENT_GROUPS: { key: string; ar: string; en: string; files: string[] }[] = [
  {
    key: 'government',
    ar: 'وزارات وهيئات حكومية',
    en: 'Ministries & authorities',
    files: ['mof.png', 'moe.png', 'mone.png', 'mopwh.png', 'mot.png', 'mosd.png',
            'pwa-auth.png', 'land-auth.png', 'pcbs.png'],
  },
  {
    key: 'cities',
    ar: 'بلديات ومدن',
    en: 'Municipalities & cities',
    files: ['bireh.png', 'tulkarem.png', 'jericho.png', 'dura.png', 'birzeit-mun.png',
            'alram.png', 'aqraba.png', 'khader.png', 'sabastia.png'],
  },
  {
    key: 'councils',
    ar: 'بلديات ومجالس خدمات',
    en: 'Municipalities & service councils',
    files: ['azzun.png', 'yaabad.png', 'surif.png', 'nuba.png', 'doha.png',
            'aqqaba.png', 'bani-zaid.png', 'asira.png', 'zawya.png'],
  },
  {
    key: 'gaza',
    ar: 'بلديات قطاع غزة',
    en: 'Gaza Strip municipalities',
    files: ['breij.png', 'maghazi.png', 'khuzaa.png', 'shuka.png', 'zahra.png', 'fukhari.png'],
  },
  {
    key: 'funders',
    ar: 'ممولون وشركاء دوليون',
    en: 'International funders & partners',
    files: ['world-bank.png', 'usaid.png', 'giz.png', 'tetra-tech.png',
            'global-communities.png', 'btc.png'],
  },
  {
    key: 'academia',
    ar: 'جامعات وقطاع خاص',
    en: 'Universities & private sector',
    files: ['birzeit-univ.png', 'alquds-univ.png', 'ptu.png', 'paltel.png',
            'hec.png', 'atlas-tech.png'],
  },
];

/**
 * The twelve, at rail size.
 *
 * Their own short names, not the board's: "Report Builder" does not fit in a third of a
 * sixteen-rem column, and a name clipped mid-word is worse than a shorter true one. Terms
 * the room says in English stay in English — Barcode, QR, OCR, AI.
 *
 * Two of these are not the same kind of claim as the other ten, and the deck should know
 * which: OCR is on the build list rather than shipped, and Finance Link is an integration
 * with the organisation's existing financial system rather than a financial module of our
 * own. Named that way on purpose — "Finance Link", not "Finance" — so the tile still holds
 * when a delegate asks which of the two it is.
 *
 * Permissions and audit are deliberately absent. They were never a thirteenth thing anyone
 * chooses; they are the core, and the core has its own band on the ecosystem scene.
 */
const CAPABILITIES: { en: string; ar: string; Icon: LucideIcon }[] = [
  { en: 'Forms', ar: 'نماذج', Icon: FileText },
  { en: 'Workflow', ar: 'مسارات', Icon: GitBranch },
  { en: 'Services', ar: 'خدمات', Icon: ClipboardList },
  { en: 'Reports', ar: 'تقارير', Icon: Wand2 },
  { en: 'Dashboards', ar: 'لوحات', Icon: LayoutDashboard },
  { en: 'AI', ar: 'ذكاء صناعي', Icon: MessageSquare },
  { en: 'QR Verify', ar: 'تحقّق', Icon: FileCheck2 },
  { en: 'Barcode', ar: 'باركود', Icon: ScanBarcode },
  { en: 'OCR', ar: 'مسح وقراءة', Icon: ScanText },
  { en: 'Alerts', ar: 'إشعارات', Icon: BellRing },
  { en: 'Automation', ar: 'أتمتة', Icon: Zap },
  { en: 'Finance Link', ar: 'تكامل مالي', Icon: Plug },
];

export default function RailShowreel({ accent }: { accent: string }) {
  const bi = useBilingual();
  const [at, setAt] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setShown(false), HOLD_MS);
    const swap = setTimeout(() => {
      setAt((n) => (n + 1) % CLIENT_GROUPS.length);
      setShown(true);
    }, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(swap);
    };
  }, [at]);

  const group = CLIENT_GROUPS[at];

  return (
    // Only on the wide layout: on a phone the rail is a strip along the bottom, where this
    // would be competing with the caption for a few centimetres.
    <div className="hidden lg:flex w-full flex-col gap-5" aria-hidden>
      {/* ── Who we serve — the one part that cycles ── */}
      <div>
        <div className="transition-opacity duration-[420ms] ease-out" style={{ opacity: shown ? 1 : 0 }}>
          <p className="text-[10px] font-black tracking-[.08em] uppercase leading-tight" style={{ color: accent }}>
            {group.ar}
          </p>
          <p dir="ltr" className="text-[10px] font-semibold leading-tight text-slate-400">{group.en}</p>

          {/* Three fixed rows whatever the group holds, so the block below never jumps. */}
          <div className="mt-2 grid grid-cols-3 grid-rows-3 auto-rows-fr gap-1.5 h-[9.5rem]">
            {group.files.map((file, i) => (
              <div
                key={`${at}-${file}`}
                className="showcase-pop grid place-items-center rounded-md ring-1 ring-slate-900/8 bg-white p-1"
                style={{ animationDelay: `${i * 45}ms` }}
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
        </div>
      </div>

      {/* ── What it is made of — always there, because it is what the visitor is being asked
             to believe while every other scene plays. ── */}
      <div>
        <p className="text-[10px] font-black tracking-[.08em] uppercase leading-tight" style={{ color: accent }}>
          {bi('showcase.slides.capabilities.title').ar}
        </p>
        <p dir="ltr" className="text-[10px] font-semibold leading-tight text-slate-400">
          {bi('showcase.slides.capabilities.title').en}
        </p>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {CAPABILITIES.map(({ en, ar, Icon }, i) => (
            <div
              key={en}
              className="showcase-pop flex flex-col items-center justify-center text-center gap-0.5 h-[3.1rem] rounded-md ring-1 ring-slate-900/8 bg-white px-0.5"
              style={{ animationDelay: `${300 + i * 35}ms` }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} strokeWidth={2} />
              <span dir="ltr" className="text-[8px] font-black leading-none text-slate-700">{en}</span>
              <span className="text-[8px] leading-none text-slate-400">{ar}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
