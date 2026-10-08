import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, Download, LogOut, Bell, AlertCircle, Check } from 'lucide-react'

import Card from '../components/common/Card'
import Button from '../components/Button'
import { Toggle } from '../components/common/Field'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { listJobs } from '../services/jobService'
import { listResumes } from '../services/resumeService'
import { listInterviews } from '../services/interviewService'
import { listEmails } from '../services/emailService'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile, saveProfile } = useProfile()
  const navigate = useNavigate()

  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState(null)

  // Exports everything the account owns, as one JSON file.
  async function handleExport() {
    setExporting(true)
    setStatus(null)
    try {
      const [jobs, resumes, interviews, emails] = await Promise.all([
        listJobs(),
        listResumes(),
        listInterviews(),
        listEmails(1000),
      ])

      const payload = {
        exported_at: new Date().toISOString(),
        account: { email: user?.email },
        profile,
        jobs,
        resumes,
        interviews,
        emails,
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jobz-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      setStatus({
        type: 'success',
        text: `Exported ${jobs.length} applications, ${resumes.length} resumes, ${interviews.length} interviews and ${emails.length} emails.`,
      })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', text: err.message || 'Could not export your data.' })
    } finally {
      setExporting(false)
    }
  }

  async function handleOpenToWork(e) {
    try {
      await saveProfile({ open_to_work: e.target.checked })
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not save that.' })
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Appearance, your data, and your account
        </p>
      </div>

      {status && (
        <div
          className={`mb-5 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
            status.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          {status.type === 'success' ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          {status.text}
        </div>
      )}

      <div className="space-y-5">

        <Card title="Appearance" subtitle="How JoBz looks">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
          >
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Theme</div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">
                Currently {theme === 'dark' ? 'dark' : 'light'}
              </p>
            </div>

            <span className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 dark:border-white/[0.1] dark:text-gray-400">
              {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </span>
          </button>
        </Card>

        <Card title="Job search" subtitle="Visible on your profile">
          <Toggle
            label="Open to work"
            description="Shows an availability badge on your profile."
            name="open_to_work"
            checked={profile?.open_to_work ?? true}
            onChange={handleOpenToWork}
          />
        </Card>

        <Card
          title="Reminders"
          subtitle="Scheduled notifications are not switched on yet"
        >
          <div className="rounded-lg border border-dashed border-gray-200 p-4 dark:border-white/[0.08]">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
              Coming with scheduled tasks
            </div>

            <p className="text-xs leading-relaxed text-gray-500 dark:text-white/35">
              The database already records reminders for stale applications,
              upcoming interviews and follow-ups. Delivery needs a scheduled job,
              so no switches are shown here until they would actually do something.
            </p>
          </div>
        </Card>

        <Card title="Your data" subtitle="Everything stored against this account">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Preparing export…' : 'Export all data as JSON'}
          </Button>

          <p className="mt-2 text-[11px] leading-relaxed text-gray-400 dark:text-white/25">
            Includes your profile, applications, resumes, interviews and saved
            emails. Uploaded resume files stay in storage and are not included.
          </p>
        </Card>

        <Card title="Account" subtitle={user?.email}>
          <Button variant="danger" onClick={handleSignOut} className="w-full">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  )
}
