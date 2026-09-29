'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { afterAuthPath } from '../../../lib/authRedirect'

// Google sends people back here. supabase-js reads the login tokens from the
// URL on its own; we just wait for that to finish, then move them along.
function Callback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const next = searchParams.get('next')
    const cancelled = searchParams.get('error') || window.location.hash.includes('error=')
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user || cancelled) {
        setFailed(true)
        return
      }
      router.replace(afterAuthPath(user, next))
    })
  }, [router, searchParams])

  if (failed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-display text-2xl font-extrabold text-brand-green">That didn't go through</p>
        <p className="mt-2 text-brand-green/70">
          Google sign-in was cancelled or blocked (school accounts often are). Try a personal Gmail,
          your phone number, or email instead.
        </p>
        <Link href="/signup" className="mt-4 inline-block font-bold text-coral hover:underline">
          Back to sign up
        </Link>
      </div>
    )
  }

  return <p className="py-24 text-center text-brand-green/70">Signing you in...</p>
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  )
}
