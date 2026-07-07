import { Link, useParams } from 'react-router-dom'
import { currentUser, activityLog } from '../data/mockData'
import VaultView from '../components/VaultView'

// Only one user exists in mock data — real lookup-by-username comes with Supabase.
export default function PublicVault() {
  const { username } = useParams()
  const user = username === currentUser.username ? currentUser : null

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Vault not found</h1>
        <p className="text-brand-green/70">
          There's no VolunteerVault profile at this link — double-check the username.
        </p>
        <Link
          to="/browse"
          className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
        >
          Browse opportunities instead
        </Link>
      </div>
    )
  }

  return <VaultView user={user} activity={activityLog} isOwner={false} />
}
