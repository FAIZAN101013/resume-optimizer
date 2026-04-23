import { Link } from 'react-router-dom'
import { Zap, ArrowRight, FileEdit, BarChart2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import FeatureCard from '../components/FeatureCard'
import Button from '../components/Button'
import Footer from '../components/home/Footer'
import DashboardPreview from '../components/home/DashboardPreview'

const STATS = [
  { value: '3.2×', label: 'more interviews' },
  { value: '48h',  label: 'avg. response time' },
  { value: '94%',  label: 'ATS pass rate' },
]

const AVATARS = [
  { initials: 'AK', bg: 'bg-violet-700' },
  { initials: 'JL', bg: 'bg-cyan-700' },
  { initials: 'SR', bg: 'bg-pink-700' },
  { initials: 'MT', bg: 'bg-emerald-900' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-500/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-200px] right-1/3 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[140px] animate-pulse" />
      </div>

      {/* ── Hero ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center px-6 pt-20 pb-24"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="flex items-center gap-2 bg-violet-500/10 border border-violet-400/20 text-violet-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <Sparkles className="w-3 h-3" />
          AI-Powered Career Operating System
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 max-w-5xl">
          Stop guessing your
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            next career move.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-xl leading-relaxed mb-4">
          Optimize your resume, track your job pipeline, and land interviews faster —
          all in one powerful system.
        </motion.p>

        {/* Social proof */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-10">
          <div className="flex">
            {AVATARS.map((av, i) => (
              <div
                key={av.initials}
                className={`w-7 h-7 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-[9px] font-medium ${av.bg} ${i > 0 ? '-ml-2' : ''}`}
              >
                {av.initials}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            <span className="text-gray-300 font-medium">2,400+ professionals</span> optimized their careers this month
          </p>
        </motion.div>

        {/* CTAs — single primary, softer secondary */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap justify-center mb-14">
          <Button to="/dashboard" size="lg">
            Start Optimizing Now <ArrowRight className="w-4 h-4" />
          </Button>
          <Button to="/optimizer" variant="secondary" size="lg">
            Watch demo
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="flex gap-10 flex-wrap justify-center mb-16">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard preview — with real mock content */}
        <motion.div variants={fadeUp}>
  <DashboardPreview />
</motion.div>
      </motion.section>

      {/* ── Features ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="px-6 pb-24 max-w-5xl mx-auto"
      >
        <p className="text-center text-xs text-gray-700 uppercase tracking-widest font-medium mb-10">
          Everything you need to win your career
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <motion.div variants={fadeUp}>
            <FeatureCard
              title="AI Resume Optimizer"
              description="6 precision AI tools to audit, rewrite, and align your resume for any role. Beat ATS filters and impress recruiters in seconds."
              icon={FileEdit}
              tags={['Recruiter Audit', 'ATS Alignment', 'Achievement Conversion']}
              to="/optimizer"
              color="violet"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FeatureCard
              title="Job Tracker"
              description="Track every application, interview, and offer in one intelligent dashboard. Never lose track of your pipeline again."
              icon={BarChart2}
              tags={['Pipeline View', 'Status Tracking', 'Interview Notes']}
              to="/tracker"
              color="emerald"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ── CTA ── */}
      <section className="px-6 pb-28 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Ready to take control of your career?
        </h2>
        <p className="text-gray-400 mb-8">
          Stop guessing. Start optimizing. Land interviews faster.
        </p>
        <Button to="/dashboard" size="lg">
          Get Started Now <ArrowRight className="w-4 h-4" />
        </Button>
      </section>

      {/* Footer */}
      <Footer/>

    </div>
  )
}