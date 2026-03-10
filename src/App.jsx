import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClaimsPage from './pages/ClaimsPage';
import DemoSimulation from './pages/DemoSimulation';
import PredictiveAlerts from './pages/PredictiveAlerts';

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<WorkerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/demo" element={<DemoSimulation />} />
        <Route path="/alerts" element={<PredictiveAlerts />} />
      </Route>
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}

export default App;
