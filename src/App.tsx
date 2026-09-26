import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import ReportPage from './pages/ReportPage';
import FeedPage from './pages/FeedPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </div>
    </Router>
  );
}
