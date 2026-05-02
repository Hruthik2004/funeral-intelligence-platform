import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Providers from './pages/Providers';
import Scraper from './pages/Scraper';
import Chat from './pages/Chat';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-body">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/scraper" element={<Scraper />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-16">
              <div className="text-center">
                <div className="font-display text-8xl font-bold text-slate-200 mb-4">404</div>
                <h2 className="font-display text-2xl font-semibold text-slate-700 mb-2">Page not found</h2>
                <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </div>
    </Router>
  );
}
