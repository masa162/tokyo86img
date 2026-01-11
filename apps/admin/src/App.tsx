import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, BookOpen, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import IllustrationsPage from './pages/Illustrations';
import IllustrationNewPage from './pages/IllustrationNew';
import IllustrationEditPage from './pages/IllustrationEdit';
import WorksPage from './pages/Works';
import EpisodesPage from './pages/Episodes';
import EpisodeNewPage from './pages/EpisodeNew';
import EpisodeEditPage from './pages/EpisodeEdit';

// 仮のダッシュボードページ
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass p-6 rounded-2xl shadow-sm">
        <h3 className="text-gray-500 text-sm font-medium">作品数</h3>
        <p className="text-3xl font-bold mt-2">12</p>
      </div>
      <div className="glass p-6 rounded-2xl shadow-sm">
        <h3 className="text-gray-500 text-sm font-medium">エピソード数</h3>
        <p className="text-3xl font-bold mt-2">154</p>
      </div>
      <div className="glass p-6 rounded-2xl shadow-sm">
        <h3 className="text-gray-500 text-sm font-medium">イラスト数</h3>
        <p className="text-3xl font-bold mt-2">48</p>
      </div>
    </div>
  </div>
);

// レイアウトコンポーネント
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'ダッシュボード', path: '/' },
    { icon: BookOpen, label: '作品・マンガ', path: '/works' },
    { icon: ImageIcon, label: 'イラスト', path: '/illustrations' },
    { icon: Settings, label: '設定', path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-primary-500">unbelong <span className="text-xs text-gray-400 font-normal">v2</span></span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <Menu size={20} />
          </button>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 w-full px-4">
          <button className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all w-full">
            <LogOut size={20} />
            <span className="font-medium">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <header className="h-16 glass flex items-center justify-between px-6 border-b border-gray-200 sticky top-0 z-40">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center space-x-4">
             <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">M</div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:workId/episodes" element={<EpisodesPage />} />
          <Route path="/illustrations" element={<IllustrationsPage />} />
          <Route path="/illustrations/new" element={<IllustrationNewPage />} />
          <Route path="/illustrations/:id/edit" element={<IllustrationEditPage />} />
          <Route path="/episodes/new" element={<EpisodeNewPage />} />
          <Route path="/episodes/:id/edit" element={<EpisodeEditPage />} />
          <Route path="/settings" element={<div className="p-6">Settings Page (Coming Soon)</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
