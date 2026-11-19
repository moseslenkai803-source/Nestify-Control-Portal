import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset } from '../lib/api/auth'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('The reset link is missing its token. Please request a new reset link.')
      return
    }

    if (password.length < 12 || password.length > 128) {
      setError('Your password must contain between 12 and 128 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await confirmPasswordReset({
        token,
        new_password: password,
      })

      navigate('/login', {
        replace: true,
        state: {
          passwordReset: true,
          message: response.message || 'Your password has been changed successfully. Please sign in.',
        },
      })
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Unable to reset your password. Please request a new reset link.',
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
            Choose a new password
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use a strong password between 12 and 128 characters.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          {!token && (
            <div role="alert" className="mb-5 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2.5 text-sm text-red-300">
              This reset link is incomplete. Request a new one to continue.
            </div>
          )}

          {error && (
            <div role="alert" className="mb-5 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <label htmlFor="new-password" className="block text-sm font-medium text-slate-200">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
            disabled={isSubmitting || !token}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-slate-500 disabled:opacity-60"
            placeholder="Enter your new password"
          />

          <label htmlFor="confirm-password" className="mt-5 block text-sm font-medium text-slate-200">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
            disabled={isSubmitting || !token}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-slate-500 disabled:opacity-60"
            placeholder="Enter the password again"
          />

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Updating password...' : 'Update password'}
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

export default ResetPasswordPage
