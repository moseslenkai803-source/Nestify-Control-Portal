import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../lib/api/auth'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    try {
      const response = await requestPasswordReset({ email: email.trim() })
      setMessage(
        response.message ||
          'If an account exists for that email, password reset instructions will be sent.',
      )
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Unable to process your request right now. Please try again later.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-400">Nestify</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter the email address associated with your Control Portal account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          {message && (
            <div role="status" className="mb-5 rounded-lg border border-emerald-800 bg-emerald-950/40 px-3 py-2.5 text-sm text-emerald-200">
              {message}
            </div>
          )}

          {error && (
            <div role="alert" className="mb-5 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <label htmlFor="reset-email" className="block text-sm font-medium text-slate-200">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500 disabled:opacity-60"
            placeholder="Enter your account email"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Sending request...' : 'Send reset instructions'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            <Link to="/login" className="font-medium text-slate-200 hover:text-white">
              Back to sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
