// Where to send someone after they log in / sign up. `next` comes from the URL
// (e.g. /signup?next=/opportunities/123), so only same-site paths are allowed —
// never "//evil.com" or "https://...".
export function safeNext(next, fallback = '/browse') {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}

// Google and phone sign-ups skip the signup form, so the first time through we
// ask for name / school / grade on /welcome. Email sign-ups fill those in on
// the form and are marked `onboarded` right away.
export function afterAuthPath(user, next) {
  const dest = safeNext(next)
  if (!user?.user_metadata?.onboarded) return `/welcome?next=${encodeURIComponent(dest)}`
  return dest
}
