import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { worksApi } from '@/lib/api';
import type { Work } from '@unbelong/shared';
import WorkForm from '@/components/WorkForm';
import { Loader2 } from 'lucide-react';

export default function WorkEditPage() {
  const { id } = useParams<{ id: string }>();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWork(id);
    }
  }, [id]);

  const loadWork = async (id: string) => {
    try {
      const response = await worksApi.get(id);
      if (response.data.success && response.data.data) {
        setWork(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="p-6 text-center text-gray-500">
        作品が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">作品編集</h1>
        <p className="text-gray-500 text-sm mt-1">作品の基本情報を更新します。</p>
      </div>
      <WorkForm work={work} isEdit />
    </div>
  );
}
