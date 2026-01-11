import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { illustrationsApi } from '@/lib/api';
import type { Illustration } from '@unbelong/shared';
import IllustrationForm from '@/components/IllustrationForm';

export default function IllustrationEditPage() {
  const { id } = useParams<{ id: string }>();
  const [illustration, setIllustration] = useState<Illustration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadIllustration(id);
  }, [id]);

  const loadIllustration = async (id: string) => {
    try {
      const response = await illustrationsApi.get(id);
      if (response.data.success && response.data.data) {
        setIllustration(response.data.data);
      }
    } catch (error) {
      console.error('イラストの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (!illustration) return <div className="p-6">イラストが見つかりません</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">イラスト詳細設定</h1>
        <p className="text-gray-500 text-sm mt-1">タイトル、説明、タグなどを編集できます。</p>
      </div>
      <IllustrationForm illustration={illustration} isEdit={true} />
    </div>
  );
}
