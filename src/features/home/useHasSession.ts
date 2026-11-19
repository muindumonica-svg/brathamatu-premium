import { useEffect, useState } from 'react'
import { getStoredToken } from '../../lib/api/client'

/**
 * True once hydrated in a browser that holds a BrathaMatu session token.
 * Reads storage after mount so the server-rendered homepage and the first
 * client render match.
 */
export function useHasSession(): boolean {
  const [hasSession, setHasSession] = useState(false)
  useEffect(() => {
    try {
      setHasSession(Boolean(getStoredToken()))
    } catch {
      setHasSession(false)
    }
  }, [])
  return hasSession
}
