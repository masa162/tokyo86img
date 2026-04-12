import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { episodesApi } from '@/lib/api';
import type { Episode } from '@tokyo86/shared';
import EpisodeForm from '@/components/EpisodeForm';

export default function EpisodeEditPage() {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadEpisode(id);
  }, [id]);

  const loadEpisode = async (id: string) => {
    try {
      const response = await episodesApi.get(id);
      if (response.data.success && response.data.data) {
        setEpisode(response.data.data);
      }
    } catch (error) {
      console.error('エピソードの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (!episode) return <div className="p-6">エピソードが見つかりません</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">エピソード詳細編集</h1>
        <p className="text-gray-500 text-sm mt-1">本文(Markdown)、タイトル、スラッグなどを編集できます。</p>
      </div>
      <EpisodeForm episode={episode} isEdit={true} />
    </div>
  );
}
