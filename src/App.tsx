import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/Home';
import DetailPage from '@/pages/Detail';
import AskPage from '@/pages/Ask';
import ConsultPage from '@/pages/Consult';
import ConsultDetailPage from '@/pages/ConsultDetail';
import HistoryPage from '@/pages/History';
import SettingsPage from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/detail" element={<DetailPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/consult" element={<ConsultPage />} />
          <Route path="/consult-detail" element={<ConsultDetailPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
