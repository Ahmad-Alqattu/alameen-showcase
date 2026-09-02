import { useEffect, useState } from 'react';
import {
  FileText, GitBranch, ClipboardList, Wand2,
  FileCheck2, ScanText, Sparkles, FileBarChart2, MessageSquare, Building2, Plug, Stamp,
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
 * What the platform is made of, at rail size.
 *
 * Full names, two columns. Three columns forced abbreviations — "Services", "Reports",
 * "AI" — and an abbreviation on a rail is a word the visitor has to decode instead of
 * read. "Service Definition" is the one that mattered most: "Services" named nothing a
 * visitor could picture, while the real idea is that a request type is defined once and
 * every screen that touches it comes from that definition.
 *
 * Nothing here is said anywhere else in the deck. Finance Link is the ecosystem scene's
 * Revenue tile, permissions and audit are its core band, GIS is one of its domains — a
 * rail that repeats the stage wastes the only space the stage does not have.
 *
 * Not a count, in the heading or in this comment. A printed number is read as a ceiling,
 * and this list has grown twice already while the deck was being written. One claim here
 * is forward-looking by the owner's decision — OCR is on the build list rather than
 * shipped — and it is named plainly rather than dressed up.
 */
const CAPABILITIES: { en: string; ar: string; Icon: LucideIcon }[] = [
  { en: 'Dynamic Forms', ar: 'نماذج ديناميكية', Icon: FileText },
  { en: 'Workflow Engine', ar: 'مسارات العمل', Icon: GitBranch },
  { en: 'Service Definition', ar: 'تعريف الخدمات', Icon: ClipboardList },
  { en: 'Report Builder', ar: 'منشئ التقارير', Icon: FileBarChart2 },
  { en: 'AI Reports', ar: 'تقارير AI', Icon: Wand2 },
  { en: 'AI Dashboards', ar: 'لوحات AI', Icon: Sparkles },
  { en: 'AI Assistant', ar: 'المساعد الذكي', Icon: MessageSquare },
  { en: 'Issued Documents', ar: 'الوثائق الصادرة', Icon: FileCheck2 },
  { en: 'E-Stamp', ar: 'الختم الإلكتروني', Icon: Stamp },
  { en: 'OCR & Scanning', ar: 'مسح ضوئي وOCR', Icon: ScanText },
  { en: 'Multi-Tenancy', ar: 'تعدد المؤسسات', Icon: Building2 },
  { en: 'API & Integration', ar: 'تكامل وAPI', Icon: Plug },
];

/** Height, not width: the rail is 16.5rem wide wherever it appears at all. */
function useShortScreen() {
  const [short, setShort] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-height: 900px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 900px)');
    const on = () => setShort(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return short;
}

export default function RailShowreel({ accent }: { accent: string }) {
  const bi = useBilingual();
  const short = useShortScreen();
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

  // Sizes in vh, not rem: this column is on a laptop, a booth screen and a 45-inch 4K panel,
  // and a caption that is right on one of them is unreadable on another.
  const label = { fontSize: 'clamp(9px, 0.95vh, 20px)' };
  const tileEn = { fontSize: 'clamp(8px, 0.82vh, 17px)' };
  const tileAr = { fontSize: 'clamp(7.5px, 0.78vh, 16px)' };
  const iconSize = 'clamp(0.85rem, 1.55vh, 2.1rem)';

  const heading = (ar: string, en: string) => (
    <div className="shrink-0">
      <p className="font-black tracking-[.08em] uppercase leading-tight" style={{ color: accent, ...label }}>
        {ar}
      </p>
      <p dir="ltr" className="font-semibold leading-tight text-slate-400" style={label}>{en}</p>
    </div>
  );

  return (
    // Only on the wide layout: on a phone the rail is a strip along the bottom, where this
    // would be competing with the caption for a few centimetres.
    //
    // Both blocks, at every height. A rail that swaps what it is saying makes the visitor
    // wait to learn something the booth screen tells at a glance; the height a laptop is
    // short of comes from the mark, the gloss and the QR around them instead.
    <div className="hidden lg:flex w-full flex-1 min-h-0 flex-col gap-4 [@media(max-height:900px)]:gap-2" aria-hidden>
      {/* ── Who we serve — the one part that cycles ── */}
      <div className="flex-[2] min-h-0 flex flex-col transition-opacity duration-[420ms] ease-out" style={{ opacity: shown ? 1 : 0 }}>
        {heading(group.ar, group.en)}
        {/* Three fixed rows whatever the group holds, so the block below never jumps — and
            each row tall enough that a mark is a mark and not a smudge. What is capped is
            the height; the width follows whatever shape the emblem is. */}
        <div className="mt-1.5 grid grid-cols-3 auto-rows-fr gap-1.5 flex-1 min-h-0">
          {group.files.slice(0, short ? 6 : 9).map((file, i) => (
            <div
              key={`${at}-${file}`}
              className="showcase-pop grid place-items-center rounded-lg ring-1 ring-slate-900/8 bg-white p-1.5 [@media(max-height:900px)]:p-1 overflow-hidden"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <img
                src={asset(`showcase/clients/${file}`)}
                alt=""
                loading="lazy"
                className="w-auto h-auto max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── What it is made of — always there, because it is what the visitor is being
             asked to believe while every other scene plays. ── */}
      <div className="flex-[3] min-h-0 flex flex-col">
        {heading(bi('showcase.railCapabilities').ar, bi('showcase.railCapabilities').en)}
        <div className="mt-1.5 grid grid-cols-2 auto-rows-fr gap-1.5 flex-1 min-h-0">
          {CAPABILITIES.map(({ en, ar, Icon }, i) => (
            <div
              key={en}
              className="showcase-pop flex flex-col items-center justify-center text-center gap-0.5 min-h-0 rounded-lg ring-1 ring-slate-900/8 bg-white px-1"
              style={{ animationDelay: `${300 + i * 35}ms` }}
            >
              <Icon className="shrink-0" style={{ color: accent, width: iconSize, height: iconSize }} strokeWidth={1.9} />
              <span dir="ltr" className="font-black leading-none text-slate-700" style={tileEn}>{en}</span>
              {/* On a laptop the row is too short for two lines, and the English name is
                  the half that gets scanned at that size. */}
              <span className="leading-none text-slate-400 [@media(max-height:900px)]:hidden" style={tileAr}>{ar}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
