import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, BookOpen, Settings, LogOut, Menu, Upload, Loader2, Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { imageApi, worksApi, episodesApi, illustrationsApi } from './lib/api';
import { getImageUrl } from '@unbelong/shared';
import IllustrationsPage from './pages/Illustrations';
import IllustrationNewPage from './pages/IllustrationNew';
import IllustrationEditPage from './pages/IllustrationEdit';
import WorksPage from './pages/Works';
import EpisodesPage from './pages/Episodes';
import EpisodeNewPage from './pages/EpisodeNew';
import EpisodeEditPage from './pages/EpisodeEdit';

// ダッシュボードページ
const Dashboard = () => {
  const [uploading, setUploading] = useState(false);
  const [lastImageId, setLastImageId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ works: 0, episodes: 0, illustrations: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [works, episodes, illustrations] = await Promise.all([
          worksApi.list(),
          episodesApi.list(),
          illustrationsApi.list()
        ]);
        setStats({
          works: works.data.data?.length || 0,
          episodes: episodes.data.data?.length || 0,
          illustrations: illustrations.data.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await imageApi.upload(file);
      if (response.data.success && response.data.data) {
        setLastImageId(response.data.data.id);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (!lastImageId) return;
    navigator.clipboard.writeText(lastImageId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-gray-400 mb-6 font-mono text-sm">
          2026 - Production Environment 
          <span className="ml-4 px-2 py-0.5 bg-gray-100 rounded text-[10px] uppercase">
            API: {import.meta.env.VITE_API_URL || 'Localhost (8787)'}
          </span>
        </p>
      </div>

      {/* クイックアップロードセクション */}
      <div className="glass p-8 rounded-3xl border border-primary-100 shadow-xl shadow-primary-50/50">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <Upload className="mr-2 text-primary-500" size={20} />
          クイック画像アップロード
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Cloudflare Images に直接画像をアップロードして、ID を取得できます。
              投稿前に画像を準備する際にお使いください。
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center px-6 py-4 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all font-bold disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Upload className="mr-2" size={20} />
              )}
              {uploading ? 'アップロード中...' : '画像を選択してアップロード'}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-6 min-h-[200px] bg-gray-50/50">
            {lastImageId ? (
              <div className="w-full space-y-4 animate-in zoom-in-95 duration-300">
                <div className="relative group aspect-video rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                  <img
                    src={getImageUrl(lastImageId, { width: 400 })}
                    alt="Uploaded preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <code className="flex-1 text-xs font-mono text-gray-600 truncate">{lastImageId}</code>
                  <button
                    onClick={copyToClipboard}
                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto text-gray-200 mb-2" size={48} />
                <p className="text-xs text-gray-400">プレビューがここに表示されます</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">作品数</h3>
          <p className="text-3xl font-bold mt-2">{loadingStats ? '...' : stats.works}</p>
        </div>
        <div className="glass p-6 rounded-2xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">エピソード数</h3>
          <p className="text-3xl font-bold mt-2">{loadingStats ? '...' : stats.episodes}</p>
        </div>
        <div className="glass p-6 rounded-2xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">イラスト数</h3>
          <p className="text-3xl font-bold mt-2">{loadingStats ? '...' : stats.illustrations}</p>
        </div>
      </div>
    </div>
  );
};

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
