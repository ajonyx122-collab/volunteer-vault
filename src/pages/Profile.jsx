import { currentUser, activityLog } from '../data/mockData'
import VaultView from '../components/VaultView'

export default function Profile() {
  return <VaultView user={currentUser} activity={activityLog} isOwner />
}
