import {
  ArrowRight,
  FileEdit,
  FileText,
  BarChart2,
  Sparkles,
  CalendarDays,
  PieChart,
} from 'lucide-react'
import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'

import FeatureCard from '../components/FeatureCard'
import MaskButton from '../components/common/MaskButton'
import Button from '../components/Button'
import Footer from '../components/home/Footer'
import DashboardPreview from '../components/home/DashboardPreview'
import { useTheme } from '../context/ThemeContext'

// What the product actually does, in the order you actually do it. This
// replaced a row of invented statistics — no real numbers exist to quote yet,
// and made-up ones would be the first thing a recruiter sees.
const STEPS = [
  {
    step: '01',
    title: 'Track',
    body: 'Every application in one pipeline, from saved to offer, with a timeline of what happened when.',
  },
  {
    step: '02',
    title: 'Tailor',
    body: 'Score your resume against the actual job description and see exactly which keywords are missing.',
  },
  {
    step: '03',
    title: 'Prepare',
    body: 'Interview questions generated from that same description, then a follow-up email when it is done.',
  },
]

const FEATURES = [
  {
    title: 'Resume Optimizer',
    description:
      'Upload a PDF or DOCX and score it against a specific job. Match score, ATS breakdown, missing keywords, and fixes that quote your actual wording.',
    icon: FileEdit,
    tags: ['ATS score', 'Missing keywords', 'Section rewriter'],
    to: '/optimizer',
    color: 'violet',
    label: 'Optimize a resume',
  },
  {
    title: 'Resume Builder',
    description:
      'Build a resume from your profile in four templates, get an AI critique of it, and export a PDF whose text stays selectable.',
    icon: FileText,
    tags: ['4 templates', 'AI review', 'PDF export'],
    to: '/builder',
    color: 'cyan',
    label: 'Build a resume',
  },
  {
    title: 'Job Tracker',
    description:
      'Seven stages from saved to withdrawn, with search, sorting, date filters and a timeline the database keeps honest.',
    icon: BarChart2,
    tags: ['Pipeline', 'Timeline', 'CSV export'],
    to: '/tracker',
    color: 'emerald',
    label: 'Track applications',
  },
  {
    title: 'Interviews & Prep',
    description:
      'Schedule rounds against an application, then generate likely technical, behavioural and HR questions from the real job description.',
    icon: CalendarDays,
    tags: ['Scheduling', 'Question sets', 'Prep notes'],
    to: '/interviews',
    color: 'amber',
    label: 'Plan interviews',
  },
  {
    title: 'AI Assistant',
    description:
      'Seven kinds of career email — follow-ups, thank-yous, reschedules, withdrawals — grounded in the application they belong to.',
    icon: Sparkles,
    tags: ['7 email types', 'Editable drafts', 'Saved history'],
    to: '/assistant',
    color: 'violet',
    label: 'Write an email',
  },
  {
    title: 'Career Analytics',
    description:
      'Conversion funnel, application volume over time, and breakdowns by status, company and source — so you can see what is working.',
    icon: PieChart,
    tags: ['Funnel', 'Trends', 'Breakdowns'],
    to: '/analytics',
    color: 'cyan',
    label: 'See your numbers',
  },
]

// Split out so ogl (the WebGL library) never lands in the main bundle. The
// landing page is the only thing that uses it; someone signing straight in
// should not download it.
const GradientWaves = lazy(() => import('../components/home/GradientWaves'))

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

export default function Home() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900 transition-colors duration-300 dark:bg-[#0a0a0f] dark:text-white">

      {/* Animated wave field behind the hero, in the brand purple and cyan.
          Masked so it dissolves rather than cutting off against the content
          below, and pointer-events-none so it never eats a click. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[820px]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        }}
      >
        <Suspense fallback={null}>
          <GradientWaves
            horizonColor="#7C3AED"
            waveColor="#06B6D4"
            // White crests are invisible on a white page — in light mode the
            // highlight has to be a mid tone to read at all.
            crestColor={isDark ? '#FFFFFF' : '#8B5CF6'}
            speed={0.28}
            amplitude={2.2}
            waveScale={0.55}
            tilt={1.16}
            height={5.0}
            fogDepth={13}
            detail="medium"
            brightness={isDark ? 0.95 : 0.85}
            opacity={isDark ? 0.62 : 0.78}
            parallaxStrength={0.4}
            grainIntensity={0.04}
          />
        </Suspense>
      </div>

      {/* Keeps the headline legible wherever a crest happens to sit. */}
      {/* Just enough veil to keep the headline readable. At 70% it was
          erasing the waves in light mode rather than softening them. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[820px] bg-gradient-to-b from-white/45 via-white/15 to-transparent dark:from-[#0a0a0f]/70 dark:via-[#0a0a0f]/40" />

      {/* Hero */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-6 pb-20 pt-20 text-center"
      >
        <motion.div
          variants={fadeUp}
          className="mb-8 flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400"
        >
          <Sparkles className="h-3 w-3" />
          AI-powered career management
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mb-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
        >
          Your whole job search,
          <br />
          <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
            in one place.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mb-10 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300"
        >
          Track applications, tailor your resume to each job with AI, prepare
          for interviews, and see what is actually working.
        </motion.p>

        <motion.div variants={fadeUp} className="mb-16 flex flex-wrap items-center justify-center gap-4">
          <Button to="/register" size="lg">
            Create free account <ArrowRight className="h-4 w-4" />
          </Button>
          <Button to="/login" variant="secondary" size="lg">
            Sign in
          </Button>
        </motion.div>

        <motion.div variants={fadeUp}>
          <DashboardPreview />
        </motion.div>
      </motion.section>

      {/* How it works */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-5xl px-6 pb-24"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02]"
            >
              <div className="mb-3 text-xs font-semibold tracking-widest text-violet-600 dark:text-violet-400">
                {s.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Modules */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05, margin: '0px 0px -120px 0px' }}
        className="relative z-10 mx-auto max-w-6xl px-6 pb-24"
      >
        <p className="mb-10 text-center text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-600">
          Six connected modules, one workflow
        </p>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={fadeUp} className="h-full">
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-gray-500">
          They share one source of truth. A job description you paste into the
          tracker is what the resume analyser scores against, what interview
          prep is generated from, and what your follow-up email refers to.
        </p>
      </motion.section>

      {/* Close */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28 text-center">
        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
          Ready to take control of your search?
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Free to use. Your data stays yours — every record is scoped to your
          account.
        </p>
        <div className="flex justify-center">
          <MaskButton to="/register" size="lg">
            Get started
          </MaskButton>
        </div>
      </section>

      <Footer />
    </div>
  )
}
