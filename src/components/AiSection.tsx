import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { productImg } from '../data'
import type { Bi } from '../types'
import { Wrap } from './Chrome'

/**
 * The AI band. Everything claimed here is architecture from docs/ai-assistant.md
 * of the platform — the model holds no connection string, no SQL and no table
 * name; every answer is a report run with the asking user's own token.
 *
 * The typing demo re-enacts real questions and reveals the real product
 * screenshots as their answers — no invented charts, no invented numbers.
 */

const T = {
  eyebrow: ['الذكاء الاصطناعي · سَبْر', 'Artificial Intelligence · Sabr'] as Bi,
  h2a: ['ذكاءٌ اصطناعي ', 'An AI that '] as Bi,
  h2em: ['لا يستطيع التسريب', 'cannot leak'] as Bi,
  h2b: ['', ''] as Bi,
  lede: [
    'كل مزوّد في هذا المعرض سيقول إن لديه ذكاءً اصطناعياً. السؤال الذي يسأله المشتري الحكومي هو الآخر: ما الذي يمنعه من رؤية ما لا يحق لسائله رؤيته؟ عندنا الجواب معماريّ لا وعديّ — «سَبْر» لا يملك اتصالاً بقاعدة البيانات أصلاً.',
    'Every vendor at this show will say they have AI. The question a government buyer actually asks is the next one: what stops it from seeing what the person asking is not allowed to see? Our answer is architectural rather than a promise — Sabr has no database connection at all.',
  ] as Bi,
  askLabel: ['سؤال المستخدم', 'User question'] as Bi,
  runLabel: ['يشغّل تقريراً محكوماً بصلاحيات السائل…', 'Running a governed report with the asker’s permissions…'] as Bi,
  answerLabel: ['الإجابة كما تظهر في المنصة', 'The answer, as it appears in the platform'] as Bi,
  flowH: ['الطريق الذي يسلكه كل سؤال', 'The path every question takes'] as Bi,
  guaranteesH: ['أربع ضمانات مبنيّة في المعمار', 'Four guarantees built into the architecture'] as Bi,
}

/**
 * Each demo is a real exchange, transcribed from the screenshot it reveals —
 * the question as it was typed, and the assistant's own answer line.
 */
const DEMOS: { q: Bi; a: Bi; img: string; w: number; h: number }[] = [
  {
    q: ['كم عدد الآبار المسجلة في كل محافظة؟', 'How many registered wells are there per governorate?'],
    a: [
      'أعلى المحافظات تسجيلاً للآبار هي أريحا والأغوار بـ151 بئراً، تليها جنين (131) وشمال غزة (89). من إجمالي 963 بئراً.',
      'The governorate with the most registered wells is Jericho & the Jordan Valley with 151, followed by Jenin (131) and North Gaza (89) — out of 963 wells in total.',
    ],
    img: '03.jpg', w: 556, h: 616,
  },
  {
    q: ['وزّع الآبار حسب حالة الترخيص، بشكل دائري', 'Break the wells down by licence status, as a pie'],
    a: [
      'الغالبية الساحقة من الآبار (تقريباً 94%) حالتها الترخيصية غير مسجلة.',
      'The overwhelming majority of wells (roughly 94%) have no recorded licence status.',
    ],
    img: '04.jpg', w: 556, h: 616,
  },
  {
    q: ['اعرض مواقع الآبار على خريطة حرارية', 'Show the well locations on a heat map'],
    a: [
      'تم عرض توزيع مواقع الآبار على الخريطة الحرارية، ويظهر التمركز الجغرافي للآبار المسجلة.',
      'The well locations are plotted on the heat map, showing where registered wells cluster geographically.',
    ],
    img: '05.jpg', w: 556, h: 606,
  },
]

const GUARANTEES: { t: Bi; d: Bi }[] = [
  {
    t: ['لا اتصال بقاعدة البيانات', 'No database connection'],
    d: [
      'النموذج لا يملك سلسلة اتصال، ولا يكتب SQL، ولا يعرف اسم جدول أو عمود واحد. كل ما يستطيع تسميته هو ما ينشره كتالوج البيانات المصفّى بالصلاحيات.',
      'The model holds no connection string, writes no SQL, and knows no table or column name. All it can name is what the permission-filtered dataset catalog publishes.',
    ],
  },
  {
    t: ['بصلاحيات السائل نفسه', 'The asker’s own permissions'],
    d: [
      'كل استدعاء يمر بمسار التقارير بِرمز المستخدم نفسه. مجموعة بيانات لا يقرؤها ليست في الكتالوج، وعمود لا يقرؤه يرفضه الطرف الخادم — ولا يوجد أمر يوسّع أياً منهما.',
      'Every call goes through the reporting route with the caller’s own token. A dataset they cannot read is not in the catalog; a column they cannot read is rejected — and no prompt can widen either.',
    ],
  },
  {
    t: ['عزل المؤسسة بالبناء', 'Tenant isolation by construction'],
    d: [
      'الاستعلام يسلك المسار ذاته الذي يسلكه تقرير بشري، فيسري عزل المؤسسة وأمن مستوى الصف تلقائياً — لا كقاعدة يجب أن يتذكرها أحد.',
      'The query takes the same path a human report run takes, so tenant scoping and row-level security apply automatically — not as a rule someone must remember.',
    ],
  },
  {
    t: ['نتيجة محكومة، لا تفريغ للبيانات', 'A governed result, never a data dump'],
    d: [
      'حجم النتيجة تحدده المنصة لا النموذج، ويصل معها عدد الصفوف الحقيقي والفلاتر التي أنتجتها — فلا تصير «الأعلى» تعني «الأعلى ضمن أول خمسين صفاً».',
      'The platform, not the model, fixes the result size — and the true row count and the filters that produced it travel with it, so “the highest” can never quietly mean “the highest of the first fifty rows”.',
    ],
  },
]

const AFTER: Bi[] = [
  ['جدول حقيقي بالفلاتر وعدد الصفوف', 'A real table with its filters and row count'],
  ['بدّل العرض: أعمدة · دائري · خطي', 'Switch the view: bars · pie · line'],
  ['اطبع بالقالب الرسمي', 'Print on the official template'],
  ['صدّر إلى Excel', 'Export to Excel'],
  ['افتحه في منشئ التقارير', 'Open it in the report builder'],
]

/** Types a string out, then holds. Respects reduced-motion by showing it at once. */
function useTypewriter(text: string, active: boolean) {
  const [out, setOut] = useState('')
  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOut(text)
      return
    }
    setOut('')
    let i = 0
    const id = setInterval(() => {
      i++
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 42)
    return () => clearInterval(id)
  }, [text, active])
  return out
}

function FlowDiagram() {
  const { L, lang } = useI18n()
  const steps: Bi[] = [
    ['سؤال المستخدم', 'User question'],
    ['سَبْر — يقرر خطوة واحدة', 'Sabr — decides one step'],
    ['محرّك التقارير برمز المستخدم', 'Report engine, user’s token'],
    ['الصلاحيات · بوابات الأعمدة · RLS', 'Permissions · column gates · RLS'],
    ['النتيجة + بياناتها الوصفية', 'Result + its metadata'],
  ]
  return (
    <div className="mt-8">
      <h3 className="text-[.8rem] font-semibold tracking-[.13em] uppercase text-cyan/90 mb-4">{L(T.flowH)}</h3>
      <ol className="flex flex-wrap items-stretch gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {steps.map((s, i) => (
          <li key={s[1]} className="flex items-center gap-2">
            <div
              className={`px-4 py-3 rounded-xl text-[.84rem] font-semibold leading-6 border ${
                i === 3
                  ? 'bg-cyan/15 border-cyan/50 text-white'
                  : 'bg-white/[.06] border-white/15 text-[#d7e8fa]'
              }`}
            >
              {L(s)}
            </div>
            {i < steps.length - 1 && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan/60 shrink-0 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[.8rem] text-[#93b4d4] font-light leading-7">
        {L([
          'لا يوجد سهم من النموذج إلى قاعدة البيانات — وهذه هي النقطة كلها.',
          'There is no arrow from the model to the database — and that is the entire point.',
        ])}
      </p>
    </div>
  )
}

export function AiSection() {
  const { L } = useI18n()
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'running' | 'answer'>('typing')
  const sectionRef = useRef<HTMLElement>(null)
  const [live, setLive] = useState(false)

  /* Only animate once the band is actually on screen. */
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setLive(e.isIntersecting),
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const demo = DEMOS[i]
  const typed = useTypewriter(L(demo.q), live && phase === 'typing')

  /* typing -> running -> answer -> next question */
  useEffect(() => {
    if (!live) return
    const full = L(demo.q).length * 42
    const t1 = setTimeout(() => setPhase('running'), full + 500)
    const t2 = setTimeout(() => setPhase('answer'), full + 1500)
    const t3 = setTimeout(() => {
      setPhase('typing')
      setI((v) => (v + 1) % DEMOS.length)
    }, full + 7000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, live])

  return (
    <section
      ref={sectionRef}
      id="ai"
      className="relative mt-[clamp(30px,5vh,64px)] py-[clamp(40px,7vh,86px)] overflow-hidden bg-gradient-to-br from-[#031A33] via-navy to-[#06294d] text-white"
    >
      {/* atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-70
          [background:radial-gradient(680px_420px_at_82%_-8%,rgb(0_167_225/.28),transparent_62%),radial-gradient(560px_380px_at_-4%_100%,rgb(0_120_233/.22),transparent_60%)]"
      />
      <Wrap className="relative">
        <div className="inline-flex items-center gap-3 text-[.8rem] font-semibold tracking-[.14em] uppercase text-cyan mb-5 before:content-[''] before:w-8 before:h-0.5 before:bg-cyan before:rounded">
          {L(T.eyebrow)}
        </div>
        <h2 className="text-[clamp(1.7rem,3.6vw,3rem)] font-bold leading-[1.28] max-w-[20ch]">
          {L(T.h2a)}
          <em className="not-italic text-transparent bg-clip-text bg-gradient-to-l ltr:bg-gradient-to-r from-cyan to-[#7fd8ff]">
            {L(T.h2em)}
          </em>
        </h2>
        <p className="mt-4 text-[clamp(.95rem,1.25vw,1.1rem)] font-light text-[#b9d3ec] max-w-[62ch] leading-8">
          {L(T.lede)}
        </p>

        {/* live re-enactment */}
        <div className="grid lg:grid-cols-[1fr_minmax(300px,440px)] grid-cols-1 gap-8 mt-9 items-start">
          <div>
            <div className="rounded-2xl border border-white/15 bg-white/[.05] backdrop-blur-sm p-5">
              <div className="text-[.72rem] tracking-[.12em] uppercase text-cyan/80 font-semibold">{L(T.askLabel)}</div>
              <div className="mt-2.5 text-[clamp(1.05rem,1.9vw,1.5rem)] font-semibold leading-[1.7] min-h-[2.6em]">
                {typed}
                <span className="inline-block w-[3px] h-[1.05em] align-[-.16em] bg-cyan ms-1 animate-[blink_1s_steps(2)_infinite]" />
              </div>
              <div
                className={`mt-3.5 flex items-center gap-2.5 text-[.82rem] text-cyan transition-opacity duration-300 ${
                  phase === 'running' ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="relative flex w-2.5 h-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-cyan opacity-70 animate-ping" />
                  <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-cyan" />
                </span>
                {L(T.runLabel)}
              </div>
              <div
                className={`grid transition-all duration-500 ${
                  phase === 'answer' ? 'grid-rows-[1fr] opacity-100 mt-3.5' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex gap-3 items-start border-s-2 border-cyan ps-3.5">
                    <p className="text-[.92rem] font-light leading-8 text-[#dcecfb]">{L(demo.a)}</p>
                  </div>
                </div>
              </div>
            </div>

            <FlowDiagram />

            <div className="mt-8">
              <h3 className="text-[.8rem] font-semibold tracking-[.13em] uppercase text-cyan/90 mb-4">
                {L(['وما الذي يمكن فعله بالإجابة', 'And what you can do with the answer'] as Bi)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {AFTER.map((a) => (
                  <span key={a[1]} className="px-3.5 py-2 rounded-full text-[.82rem] font-medium bg-white/[.07] border border-white/15 text-[#d7e8fa]">
                    {L(a)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* the real screen */}
          <figure className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/15 bg-white/[.05] p-3 shadow-[0_30px_70px_-24px_rgb(0_0_0/.7)]">
              <img
                key={demo.img}
                src={productImg('dwp', demo.img)}
                width={demo.w}
                height={demo.h}
                alt={L(demo.q)}
                className={`w-full rounded-xl bg-white transition-all duration-500 ${
                  phase === 'answer' ? 'opacity-100 translate-y-0' : 'opacity-35 translate-y-1'
                }`}
              />
            </div>
            <figcaption className="mt-2.5 text-[.75rem] text-[#8fb0d4] text-center font-light">
              {L(T.answerLabel)}
            </figcaption>
          </figure>
        </div>

        {/* guarantees */}
        <h3 className="text-[.8rem] font-semibold tracking-[.13em] uppercase text-cyan/90 mt-12 mb-5">
          {L(T.guaranteesH)}
        </h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 grid-cols-1 gap-3.5">
          {GUARANTEES.map((g, n) => (
            <div key={g.t[1]} className="rounded-2xl border border-white/15 bg-white/[.05] p-5 transition hover:border-cyan/50 hover:bg-white/[.08]">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-7 h-7 rounded-lg bg-cyan/20 border border-cyan/40 text-cyan text-[.78rem] font-bold flex items-center justify-center tabular-nums">
                  {n + 1}
                </span>
                <b className="text-[.95rem] font-bold">{L(g.t)}</b>
              </div>
              <p className="text-[.83rem] font-light leading-7 text-[#b9d3ec]">{L(g.d)}</p>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}
