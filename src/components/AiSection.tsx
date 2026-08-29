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
  eyebrow: ['المساعد الذكي · سَبْر', 'Sabr · the assistant'] as Bi,
  h2a: ['اسأل بالعربية. ', 'Ask in plain Arabic. '] as Bi,
  h2em: ['يجيبك من بياناتك.', 'It answers from your data.'] as Bi,
  h2b: ['', ''] as Bi,
  lede: [
    'سؤال مكتوب كما تقوله، فيختار سَبْر البيانات ويشغّل التقرير ويعرض النتيجة رسماً أو خريطة — بصلاحياتك أنت، لا بصلاحياته.',
    'A question written the way you would say it. Sabr picks the data, runs the report and draws the result as a chart or a map — with your permissions, not its own.',
  ] as Bi,
  askLabel: ['السؤال', 'The question'] as Bi,
  stepsLabel: ['ما فعله', 'What it did'] as Bi,
  runLabel: ['يشغّل التقرير…', 'Running the report…'] as Bi,
  answerLabel: ['الشاشة كما هي في المنصة', 'The screen, as it is in the platform'] as Bi,
  flowH: ['طريق السؤال', 'The path of a question'] as Bi,
  guaranteesH: ['ما يضمنه المعمار', 'What the architecture guarantees'] as Bi,
  afterH: ['وبعد الجواب', 'After the answer'] as Bi,
}

/**
 * Three real exchanges, transcribed from the screenshots they reveal — the
 * question, the steps the assistant announced, and its own answer line.
 */
const DEMOS: { q: Bi; steps: Bi[]; a: Bi; img: string; w: number; h: number }[] = [
  {
    q: ['كم عدد الآبار المسجلة في كل محافظة؟', 'How many registered wells in each governorate?'],
    steps: [
      ['أتحقق من عدد الآبار المسجلة لكل محافظة', 'Checking registered well counts per governorate'],
      ['أعرضها كرسم أعمدة', 'Rendering them as a bar chart'],
    ],
    a: [
      'أعلى المحافظات أريحا والأغوار بـ151 بئراً، تليها جنين 131 وشمال غزة 89 — من أصل 963 بئراً.',
      'Jericho & the Jordan Valley lead with 151 wells, then Jenin at 131 and North Gaza at 89 — out of 963.',
    ],
    img: '03.jpg', w: 556, h: 616,
  },
  {
    q: ['وزّع عينات المختبر على المحافظات، بشكل دائري', 'Distribute the lab samples across governorates, as a pie'],
    steps: [
      ['جاري تجميع عدد العينات حسب المحافظة', 'Aggregating sample counts by governorate'],
    ],
    a: [
      'نابلس أولاً بـ435 عينة، تليها جنين بـ336 — وحدهما 52% من إجمالي 1,494 عينة، موزّعة على عشر محافظات.',
      'Nablus leads with 435 samples, then Jenin with 336 — together 52% of all 1,494, spread across ten governorates.',
    ],
    img: '25.jpg', w: 1088, h: 1216,
  },
  {
    q: ['اعرض مواقع الآبار على خريطة حرارية', 'Plot the wells on a heat map'],
    steps: [
      ['أرسم الكثافة النسبية بترجيح العدد', 'Plotting relative density weighted by count'],
      ['ويمكن ترجيحها بإجمالي السحب المؤكد م³', 'Or weight it by total confirmed abstraction, m³'],
    ],
    a: [
      'رُسم 952 بئراً من 963 — و11 سجلاً بلا إحداثيات، معلَنة تحت الخريطة بدل أن تُطوى بصمت.',
      '952 of 963 wells plotted — and 11 records with no coordinates, stated under the map rather than quietly dropped.',
    ],
    img: '05.jpg', w: 556, h: 606,
  },
  {
    q: ['وزّع الآبار حسب المحافظة، بمتوسط العمق', 'Distribute the wells by governorate, on average depth'],
    steps: [
      ['أجمع حسب فئة: المحافظة', 'Grouping by category: governorate'],
      ['والقيمة: متوسط العمق الكلي م', 'And the measure: average total depth, m'],
    ],
    a: [
      'محافظة واحدة تقارب 570 متراً بينما تستقر الأغلبية بين 150 و250 — والفئة نفسها قابلة للتبديل: الحوض، نوع المكمن، التكوين الجيولوجي، مستوى الخطر البيئي، أولوية التأهيل… تسعة عشر عموداً تُعاد القسمة عليها دون كتابة تقرير جديد.',
      'One governorate approaches 570 m while most settle between 150 and 250 — and the category itself is interchangeable: aquifer, reservoir type, geological formation, environmental risk, rehabilitation priority… nineteen columns the same data can be re-divided across, without writing a new report.',
    ],
    img: '09.jpg', w: 1352, h: 838,
  },
]

const GUARANTEES: { t: Bi; d: Bi }[] = [
  {
    t: ['بصلاحياتك أنت', 'Your permissions, not its own'],
    d: [
      'ما لا يحقّ لك أن تراه لا يظهر لسَبْر أصلاً — لا في البيانات ولا في الأعمدة.',
      'What you may not see never reaches Sabr — not the dataset, not the column.',
    ],
  },
  {
    t: ['لا يلمس قاعدة البيانات', 'It never touches the database'],
    d: [
      'يسأل محرّك التقارير نفسه الذي يستخدمه موظفوك. لا SQL ولا اسم جدول.',
      'It asks the same reporting engine your staff use. No SQL, no table names.',
    ],
  },
  {
    t: ['كل رقم ومصدره', 'Every number, with its source'],
    d: [
      'الفلاتر التي أنتجت النتيجة وعدد السجلات الحقيقي ظاهران مع الجواب.',
      'The filters behind the result and the true record count travel with it.',
    ],
  },
  {
    t: ['عربي أولاً', 'Arabic first'],
    d: [
      'يفهم أسماء المحافظات والآبار كما تُكتب، ويجيب بالعربية ويطبع بها.',
      'It reads governorate and well names as they are written, answers in Arabic and prints in Arabic.',
    ],
  },
]

const AFTER: Bi[] = [
  ['بدّل العرض: أعمدة · دائري · خطي · خريطة', 'Switch the view: bars · pie · line · map'],
  ['اطبع بالقالب الرسمي', 'Print on the official template'],
  ['صدّر إلى Excel', 'Export to Excel'],
  ['احفظه تقريراً أو ثبّته على لوحتك', 'Save it as a report, or pin it to a dashboard'],
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
    ['سؤالك', 'Your question'],
    ['سَبْر يختار الخطوة', 'Sabr picks the step'],
    ['محرّك التقارير', 'The reporting engine'],
    ['صلاحياتك · عزل مؤسستك', 'Your permissions · your tenant'],
    ['النتيجة ومصدرها', 'The result and its source'],
  ]
  return (
    <div className="mt-8">
      <h3 className="font-mono text-[.78rem] font-semibold tracking-[.14em] uppercase text-cyan/90 mb-4">{L(T.flowH)}</h3>
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
          'لاحظ ما ليس في المخطط: سهم من سَبْر إلى قاعدة البيانات.',
          'Note what the diagram does not have: an arrow from Sabr to the database.',
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
    const t1 = setTimeout(() => setPhase('running'), full + 600)
    const t2 = setTimeout(() => setPhase('answer'), full + 2600)
    const t3 = setTimeout(() => {
      setPhase('typing')
      setI((v) => (v + 1) % DEMOS.length)
    }, full + 9500)
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
        <div className="inline-flex items-center gap-3 font-mono text-[.78rem] font-semibold tracking-[.14em] uppercase text-cyan mb-5 before:content-[''] before:w-8 before:h-0.5 before:bg-cyan before:rounded">
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
              <div className="font-mono text-[.7rem] tracking-[.13em] uppercase text-cyan/80 font-semibold">{L(T.askLabel)}</div>
              <div className="mt-2.5 text-[clamp(1.05rem,1.9vw,1.5rem)] font-semibold leading-[1.7] min-h-[2.6em]">
                {typed}
                <span className="inline-block w-[3px] h-[1.05em] align-[-.16em] bg-cyan ms-1 animate-[blink_1s_steps(2)_infinite]" />
              </div>
              {/* The steps it announced. This is what makes the answer auditable. */}
              <div
                className={`grid transition-all duration-500 ${
                  phase === 'typing' ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100 mt-4'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="font-mono text-[.68rem] tracking-[.13em] uppercase text-cyan/70 mb-2">
                    {L(T.stepsLabel)}
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {demo.steps.map((st) => (
                      <li key={st[1]} className="flex items-start gap-2.5 text-[.82rem] text-[#a9c6e2] font-light leading-7">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-cyan/70 flex-none mt-2" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                        {L(st)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div
                className={`mt-3 flex items-center gap-2.5 text-[.82rem] text-cyan transition-opacity duration-300 ${
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
              <h3 className="font-mono text-[.78rem] font-semibold tracking-[.14em] uppercase text-cyan/90 mb-4">
                {L(T.afterH)}
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
        <h3 className="font-mono text-[.78rem] font-semibold tracking-[.14em] uppercase text-cyan/90 mt-12 mb-5">
          {L(T.guaranteesH)}
        </h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 grid-cols-1 gap-3.5">
          {GUARANTEES.map((g, n) => (
            <div key={g.t[1]} className="rounded-2xl border border-white/15 bg-white/[.05] p-5 transition hover:border-cyan/50 hover:bg-white/[.08]">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-7 h-7 rounded-lg bg-cyan/20 border border-cyan/40 text-cyan font-mono text-[.76rem] font-semibold flex items-center justify-center tabular-nums">
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
