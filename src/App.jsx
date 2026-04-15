import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import WorkerDashboard from './pages/WorkerDashboard';
import PolicyManagement from './pages/PolicyManagement';
import PremiumEngine from './pages/PremiumEngine';
import ClaimsCenter from './pages/ClaimsCenter';
import AlertsPage from './pages/AlertsPage';
import AutomationPage from './pages/AutomationPage';
import AdminDashboard from './pages/AdminDashboard';
import DemoSimulation from './pages/DemoSimulation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages (no sidebar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App pages (with sidebar layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<WorkerDashboard />} />
          <Route path="/policies" element={<PolicyManagement />} />
          <Route path="/premium" element={<PremiumEngine />} />
          <Route path="/claims" element={<ClaimsCenter />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/automation" element={<AutomationPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/simulation" element={<DemoSimulation />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
