import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, login } from '../lib/api/auth'
import { useAuth } from '../auth/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const { saveSession } = useAuth()
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data) {
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const tokenResponse = await login(data)
      const currentUser = await getCurrentUser(tokenResponse.access_token)

      saveSession(tokenResponse.access_token, currentUser)
      navigate('/', { replace: true })
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        'Unable to sign in. Please check your credentials and try again.'

      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-400">
            Nestify
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Control Portal
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in with your Nestify employee credentials.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          {submitError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2.5 text-sm text-red-300"
            >
              {submitError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              {...register('email', {
                required: 'Email is required',
              })}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="employee@nestify.co.ke"
            />

            {errors.email && (
              <p className="mt-2 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register('password', {
                required: 'Password is required',
              })}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Enter your password"
            />

            {errors.password && (
              <p className="mt-2 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
