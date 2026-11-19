import { redirect } from '@tanstack/react-router'
import { getStoredToken } from '../lib/api/client'

// Route guards carried over unchanged from the original code-based router.
export function requireAuth() {
  if (!getStoredToken()) throw redirect({ to: '/login' })
}

export function redirectIfAuthed() {
  if (getStoredToken()) throw redirect({ to: '/app' })
}
