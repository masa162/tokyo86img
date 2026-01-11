import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { illustrationsApi } from '@/lib/api';
import type { Illustration } from '@unbelong/shared';
import { Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@unbelong/shared';

export default function IllustrationsPage() {
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadIllustrations();
  }, []);

  const loadIllustrations = async () => {
    try {
      const response = await illustrationsApi.list();
      if (response.data.success && response.data.data) {
        setIllustrations(response.data.data);
      }
    } catch (error) {
      console.error('イラストの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await illustrationsApi.delete(id);
      setIllustrations(illustrations.filter(i => i.id !== id));
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  const filteredIllustrations = illustrations.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">イラスト管理</h1>
          <p className="text-gray-500 text-sm mt-1">投稿したイラストの確認と編集が可能です。</p>
        </div>
        <Link
          to="/illustrations/new"
          className="flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all font-medium"
        >
          <Plus size={20} className="mr-2" />
          新規投稿
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="タイトルやスラッグで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 rounded-lg outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">プレビュー</th>
                <th className="px-6 py-4 font-semibold">情報</th>
                <th className="px-6 py-4 font-semibold">スラッグ</th>
                <th className="px-6 py-4 font-semibold">ステータス</th>
                <th className="px-6 py-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">読み込み中...</td></tr>
              ) : filteredIllustrations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">データが見つかりません</td></tr>
              ) : filteredIllustrations.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                      <img
                        src={getImageUrl(item.image_id, { width: 100 })}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(item.created_at * 1000).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{item.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link to={`/illustrations/${item.id}/edit`} className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-100 transition-all text-gray-600">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
