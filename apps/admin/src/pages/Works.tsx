import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { worksApi } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { Work } from '@unbelong/shared';
import { Plus, Book, Image as ImageIcon, ChevronRight, Edit2, Trash2 } from 'lucide-react';

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const response = await worksApi.list();
      if (response.data.success && response.data.data) {
        setWorks(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('本当にこの作品を削除しますか？\n(注意: エピソードは削除されませんが、紐付けが解除されます)')) return;
    try {
      await worksApi.delete(id);
      setWorks(works.filter(w => w.id !== id));
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  const comicWorks = works.filter(w => w.type === 'comic');
  const illustWorks = works.filter(w => w.type === 'illustration');

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">作品・マンガ管理</h1>
          <p className="text-gray-500 text-sm mt-1">マンガ作品とイラストシリーズの管理が可能です。</p>
        </div>
        <Link 
          to="/works/new"
          className="flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all font-medium"
        >
          <Plus size={20} className="mr-2" />
          新規作品作成
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comic Works */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-bold">
            <Book size={20} className="text-primary-500" />
            <h2>マンガ作品</h2>
          </div>
          <div className="grid gap-4">
            {comicWorks.length === 0 && !loading && (
              <div className="glass p-8 text-center text-gray-400 rounded-2xl">作品がありません</div>
            )}
            {comicWorks.map(work => (
              <div key={work.id} className="relative group">
                <Link
                  to={`/works/${work.id}/episodes`}
                  className="glass p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group-hover:border-primary-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500 overflow-hidden border border-gray-100">
                      {work.thumbnail_image_id ? (
                        <img 
                          src={getImageUrl(work.thumbnail_image_id, { width: 120, fit: 'cover' })} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Book size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold group-hover:text-primary-500 transition-colors">{work.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">slug: {work.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/works/${work.id}/edit`}
                      className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-100 transition-all text-gray-400 hover:text-primary-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(work.id, e)}
                      className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-500 transition-all" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration Works */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-bold">
            <ImageIcon size={20} className="text-primary-500" />
            <h2>イラストシリーズ</h2>
          </div>
          <div className="grid gap-4">
             {illustWorks.length === 0 && !loading && (
              <div className="glass p-8 text-center text-gray-400 rounded-2xl">シリーズがありません</div>
            )}
            {illustWorks.map(work => (
              <Link
                key={work.id}
                to={`/works/${work.id}/edit`}
                className="glass p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500 overflow-hidden border border-gray-100">
                    {work.thumbnail_image_id ? (
                      <img 
                        src={getImageUrl(work.thumbnail_image_id, { width: 120, fit: 'cover' })} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold group-hover:text-primary-500 transition-colors">{work.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">slug: {work.slug}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => handleDelete(work.id, e)}
                    className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-500 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
