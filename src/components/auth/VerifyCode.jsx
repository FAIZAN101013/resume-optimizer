import { useEffect, useRef, useState } from 'react'
import { MailCheck, Loader2 } from 'lucide-react'

const RESEND_COOLDOWN_SECONDS = 45

export default function VerifyCode({ email, onVerify, onResend, onBack }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Stops someone hammering resend and burning the daily email quota.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function submit(value = code) {
    const token = value.trim()
    if (token.length < 6) {
      setError('Enter the 6-digit code from your email.')
      return
    }

    setVerifying(true)
    setError('')
    setNotice('')

    const { error: verifyError } = await onVerify(token)

    if (verifyError) {
      setError(
        /expired/i.test(verifyError.message)
          ? 'That code has expired. Send a new one below.'
          : 'That code is not right. Check it and try again.',
      )
      setVerifying(false)
    }
    // On success the auth state changes and this screen unmounts.
  }

  async function handleResend() {
    setError('')
    setNotice('')

    const { error: resendError } = await onResend()

    if (resendError) {
      setError(resendError.message)
      return
    }

    setCooldown(RESEND_COOLDOWN_SECONDS)
    setNotice(`A new code is on its way to ${email}.`)
  }

  function handleChange(e) {
    // Codes are numeric; strip anything pasted in around them.
    const next = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(next)
    setError('')

    // Submit as soon as the code is complete — no reason to make them click.
    if (next.length === 6) submit(next)
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-white/[0.07] dark:bg-white/[0.02] dark:shadow-none dark:backdrop-blur-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/15">
          <MailCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={1.75} />
        </div>

        <h1 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
          Check your email
        </h1>
        <p className="text-sm text-gray-500">
          We sent a 6-digit code to{' '}
          <span className="text-gray-700 dark:text-gray-300">{email}</span>
        </p>
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        value={code}
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        disabled={verifying}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] text-gray-900 transition-all placeholder:text-gray-300 focus:border-violet-500/50 focus:bg-white focus:outline-none disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-gray-700 dark:focus:bg-white/[0.06]"
      />

      {error && <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {notice && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">{notice}</p>}

      <button
        onClick={() => submit()}
        disabled={verifying || code.length < 6}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 disabled:opacity-50"
      >
        {verifying ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Verifying…
          </>
        ) : (
          'Verify email'
        )}
      </button>

      <div className="mt-6 space-y-2 text-center">
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-xs text-violet-600 transition-colors hover:text-violet-500 disabled:text-gray-400 disabled:hover:text-gray-400 dark:text-violet-400 dark:disabled:text-gray-600"
        >
          {cooldown > 0 ? `Send another code in ${cooldown}s` : "Didn't get it? Send another code"}
        </button>

        <div>
          <button
            onClick={onBack}
            className="text-xs text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Use a different email
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-600">
        Codes expire after an hour. Check your spam folder if it hasn't arrived
        within a minute or two.
      </p>
    </div>
  )
}
