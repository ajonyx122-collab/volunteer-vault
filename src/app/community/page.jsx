import { permanentRedirect } from 'next/navigation'

// Community projects now live as a tab on /student-led.
export default function CommunityRedirect() {
  permanentRedirect('/student-led?tab=projects')
}
