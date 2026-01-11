import { useSearchParams } from 'react-router-dom';
import EpisodeForm from '@/components/EpisodeForm';

export default function EpisodeNewPage() {
  const [searchParams] = useSearchParams();
  const workId = searchParams.get('workId') || '';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">エピソード新規追加</h1>
        <p className="text-gray-500 text-sm mt-1">話数とサムネイルを設定して、新しいエピソードを作成します。</p>
      </div>
      <EpisodeForm episode={{ work_id: workId } as any} />
    </div>
  );
}
