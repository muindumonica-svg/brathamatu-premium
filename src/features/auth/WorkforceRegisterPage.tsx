import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { Alert, Button, Field } from '../../components/ui'
import { ApiError, api, setStoredTenantId, setStoredToken } from '../../lib/api/client'
import { authResponseSchema } from '../../lib/api/schemas'
import { AuthLayout } from './LoginPage'
import { CollapsibleForm } from '../../components/ui'

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(120),
  email: z.string().trim().email('Enter a valid email address.').max(255),
  password: z.string()
    .min(8, 'Use at least 8 characters.')
    .regex(/[a-zA-Z]/, 'Include a letter.')
    .regex(/[0-9]/, 'Include a number.'),
  password_confirmation: z.string(),
}).refine((value) => value.password === value.password_confirmation, {
  message: 'Passwords do not match.',
  path: ['password_confirmation'],
})

type FormValues = z.infer<typeof signupSchema>

export function WorkforceRegisterPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const parsed = signupSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form')
        fieldErrors[key] ??= issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const result = authResponseSchema.parse(await api.post('/public/workforce/registration', parsed.data))
      setStoredToken(result.token)
      setStoredTenantId(null)
      sessionStorage.setItem('brathamatu.verification_email_sent', 'sent')
      if (result.verification_test_code) {
        sessionStorage.setItem('brathamatu.verify.test_code', result.verification_test_code)
      }
      queryClient.setQueryData(['me'], result.user)
      await router.navigate({ to: '/verify' })
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors: Record<string, string> = {}
        for (const [field, messages] of Object.entries(error.details)) {
          fieldErrors[field] = messages[0]
        }
        setErrors({ ...fieldErrors, form: error.message })
      } else {
        setErrors({ form: 'Could not create your account. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Apply as a stock taker"
      subtitle="Create a workforce account, verify your email, and complete your applicant profile."
    >
      <CollapsibleForm>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {errors.form && <Alert kind="error">{errors.form}</Alert>}
          <Field
            label="Full name"
            name="name"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            error={errors.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          />
          <Field
            label="Confirm password"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={values.password_confirmation}
            error={errors.password_confirmation}
            onChange={(event) => setValues((current) => ({
              ...current,
              password_confirmation: event.target.value,
            }))}
          />
          <Button type="submit" loading={submitting} className="w-full">
            Create stock taker account
          </Button>
        </form>
      </CollapsibleForm>
      <p className="mt-6 text-center text-sm text-gray-500">
        Registering a business?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Create a business account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
