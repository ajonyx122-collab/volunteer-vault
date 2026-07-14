import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Browse from './pages/Browse'
import OpportunityDetail from './pages/OpportunityDetail'
import Profile from './pages/Profile'
import PublicVault from './pages/PublicVault'
import Certificate from './pages/Certificate'
import OrgDashboard from './pages/OrgDashboard'
import PostOpportunity from './pages/PostOpportunity'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ComingSoon from './pages/ComingSoon'
import AdminReview from './pages/AdminReview'
import MapView from './pages/MapView'
import Community from './pages/Community'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/u/:username" element={<PublicVault />} />
          <Route path="/certificate/:username" element={<Certificate />} />
          <Route path="/dashboard" element={<OrgDashboard />} />
          <Route path="/post-opportunity" element={<PostOpportunity />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminReview />} />
          <Route path="/community" element={<Community />} />
          <Route path="/map" element={<MapView />} />
          <Route
            path="/leaderboards"
            element={
              <ComingSoon
                title="School showdown — coming soon"
                blurb="Full leaderboards, streaks, and badges unlock in Phase 4. Sneak peek is on the home page."
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
