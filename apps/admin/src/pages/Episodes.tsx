import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { episodesApi, worksApi } from '@/lib/api';
import type { Episode, Work } from '@tokyo86/shared';
import { Plus, ChevronLeft, Edit2, Trash2 } from 'lucide-react';

export default function EpisodesPage() {
  const { workId } = useParams<{ workId: string }>();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workId) {
      loadWork(workId);
      loadEpisodes(workId);
    }
  }, [workId]);

  const loadWork = async (id: string) => {
    try {
      const response = await worksApi.get(id);
      if (response.data.success && response.data.data) {
        setWork(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
    }
  };

  const loadEpisodes = async (id: string) => {
    try {
      const response = await episodesApi.list(id);
      if (response.data.success && response.data.data) {
        setEpisodes(response.data.data);
      }
    } catch (error) {
      console.error('エピソードの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await episodesApi.delete(id);
      setEpisodes(episodes.filter(e => e.id !== id));
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/works" className="flex items-center text-sm text-gray-400 hover:text-primary-500 transition-colors mb-2">
            <ChevronLeft size={16} />
            作品一覧へ
          </Link>
          <h1 className="text-2xl font-bold">{work ? `${work.title}のエピソード` : 'エピソード管理'}</h1>
        </div>
        <Link
          to={`/episodes/new?workId=${workId}`}
          className="flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all font-medium"
        >
          <Plus size={20} className="mr-2" />
          新規エピソード追加
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">話数</th>
              <th className="px-6 py-4 font-semibold">タイトル</th>
              <th className="px-6 py-4 font-semibold">スラッグ</th>
              <th className="px-6 py-4 font-semibold">ステータス</th>
              <th className="px-6 py-4 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">読み込み中...</td></tr>
            ) : episodes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">エピソードがありません</td></tr>
            ) : episodes.sort((a,b) => b.episode_number - a.episode_number).map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-500">
                  #{item.episode_number}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{item.title || '(無題)'}</div>
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
                    <Link to={`/episodes/${item.id}/edit`} className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-100 transition-all text-gray-600">
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
  );
}
