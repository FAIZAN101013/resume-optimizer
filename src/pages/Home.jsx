import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from "framer-motion"
import FeatureCard from "../components/FeatureCard"
import { FileEdit, BarChart2 } from "lucide-react"
import Button from '../components/Button'


export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden">

      {/* 🔥 Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-500/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-200px] right-1/3 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[140px] animate-pulse" />
      </div>

      {/* ── Hero ── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center text-center px-6 pt-20 pb-24"
      >

        {/* Badge */}
        <div className="flex items-center gap-2 bg-white/[0.05] backdrop-blur-md border border-white/[0.08] text-violet-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <Sparkles className="w-3 h-3" />
          AI-Powered Career Operating System
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 max-w-5xl">
          Stop guessing your
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            next career move.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-lg max-w-xl leading-relaxed mb-4">
          Optimize your resume, track your job pipeline, and land interviews faster —
          all in one powerful system.
        </p>

        <p className="text-xs text-gray-600 mb-10">
          Built for ambitious developers & professionals 🚀
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Button to="/dashboard" size="lg">
  Start Optimizing Now <ArrowRight className="w-4 h-4" />
</Button>

         <Button to="/optimizer" variant="secondary" size="lg">
  Try Optimizer
</Button>
        </div>

        {/* 🖥️ Dashboard Preview */}
        <div className="mt-20 w-full max-w-5xl">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">

            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>

            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="col-span-2 h-32 rounded-lg bg-white/[0.04] border border-white/[0.05]" />
              <div className="h-32 rounded-lg bg-white/[0.04] border border-white/[0.05]" />
              <div className="h-24 rounded-lg bg-white/[0.04] border border-white/[0.05]" />
              <div className="h-24 rounded-lg bg-white/[0.04] border border-white/[0.05]" />
              <div className="h-24 rounded-lg bg-white/[0.04] border border-white/[0.05]" />
            </div>
          </div>
        </div>

      </motion.section>

      {/* ── Features ── */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">

        <p className="text-center text-xs text-gray-700 uppercase tracking-widest font-medium mb-10">
          Everything you need to win your career
        </p>

        <div className="grid md:grid-cols-2 gap-5">

          <FeatureCard
            title="AI Resume Optimizer"
            description="6 precision AI tools to audit, rewrite, and align your resume for any role. Beat ATS filters and impress recruiters in seconds."
            icon={FileEdit}
            tags={["Recruiter Audit", "ATS Alignment", "Achievement Conversion"]}
            to="/optimizer"
            color="violet"
          />

          <FeatureCard
            title="Job Tracker"
            description="Track every application, interview, and offer in one intelligent dashboard. Never lose track of your pipeline again."
            icon={BarChart2}
            tags={["Pipeline View", "Status Tracking", "Interview Notes"]}
            to="/tracker"
            color="emerald"
          />

        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-28 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Ready to take control of your career?
        </h2>

        <p className="text-gray-400 mb-8">
          Stop guessing. Start optimizing. Land interviews faster.
        </p>

       <Button to="/dashboard" size="lg">
  Get Started Now →
</Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
          <span className="text-xs text-gray-600 font-medium">CareerOS</span>
        </div>
        <p className="text-xs text-gray-700">
          © 2024 CareerOS. Built like a real product.
        </p>
      </footer>

    </div>
  )
}