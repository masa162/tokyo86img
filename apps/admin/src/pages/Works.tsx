import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { worksApi } from '@/lib/api';
import type { Work } from '@unbelong/shared';
import { Plus, Book, Image as ImageIcon, ChevronRight } from 'lucide-react';

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

  const comicWorks = works.filter(w => w.type === 'comic');
  const illustWorks = works.filter(w => w.type === 'illustration');

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">作品・マンガ管理</h1>
          <p className="text-gray-500 text-sm mt-1">マンガ作品とイラストシリーズの管理が可能です。</p>
        </div>
        <button className="flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all font-medium">
          <Plus size={20} className="mr-2" />
          新規作品作成
        </button>
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
              <Link
                key={work.id}
                to={`/works/${work.id}/episodes`}
                className="glass p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500">
                    <Book size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold group-hover:text-primary-500 transition-colors">{work.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">slug: {work.slug}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-500 transition-all" />
              </Link>
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
              <div
                key={work.id}
                className="glass p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">{work.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">slug: {work.slug}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
