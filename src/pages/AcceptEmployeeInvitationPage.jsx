import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { acceptEmployeeInvitation } from '../lib/api/auth'

function AcceptEmployeeInvitationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data) {
    if (!token) {
      setSubmitError('The invitation link is missing its token.')
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      await acceptEmployeeInvitation({
        token,
        password: data.password,
      })

      navigate('/login', {
        replace: true,
        state: {
          invitationAccepted: true,
          message: 'Your account is ready. Sign in with your email and new password.',
        },
      })
    } catch (error) {
      setSubmitError(
        error.response?.data?.detail ||
          'Unable to accept this invitation. Check the link and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-400">Nestify</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Accept employee invitation
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Set a password to activate your employee account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          {!token && (
            <div
              role="alert"
              className="rounded-lg border border-amber-800 bg-amber-950/40 px-3 py-2.5 text-sm text-amber-200"
            >
              This invitation link does not contain a token. Open the complete
              link provided by your Nestify administrator.
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2.5 text-sm text-red-300"
            >
              {submitError}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Create password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting || !token}
              {...register('password', {
                required: 'Password is required.',
                minLength: {
                  value: 12,
                  message: 'Password must be at least 12 characters.',
                },
                maxLength: {
                  value: 128,
                  message: 'Password must be no more than 128 characters.',
                },
              })}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="At least 12 characters"
            />
            {errors.password && (
              <p className="mt-2 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-200"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting || !token}
              {...register('confirmPassword', {
                required: 'Please confirm your password.',
                validate: (value) =>
                  value === getValues('password') || 'Passwords do not match.',
              })}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Enter the password again"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Activating account...' : 'Accept invitation'}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-slate-200 underline underline-offset-4 hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default AcceptEmployeeInvitationPage
