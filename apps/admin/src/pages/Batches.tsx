import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { batchesApi } from '../lib/api';
import { Package, Trash2, Copy, Check, Loader2, Plus } from 'lucide-react';
import { formatDate } from '@tokyo86/shared';

export default function Batches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedBatchId, setCopiedBatchId] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await batchesApi.list();
      if (res.data.success) {
        setBatches(res.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (batchId: string) => {
    if (!window.confirm('このバッチを完全に削除してもよろしいですか？（バッチ内の全ての画像が Cloudflare Images からも消去されます）')) return;

    try {
      await batchesApi.delete(batchId);
      setBatches(batches.filter(b => b.batch_id !== batchId));
    } catch (error) {
      console.error('Failed to delete batch:', error);
      alert('削除に失敗しました');
    }
  };

  const copyMarkdown = async (batchId: string) => {
    try {
      const res = await batchesApi.getMarkdown(batchId);
      if (res.data.success && res.data.data) {
        navigator.clipboard.writeText(res.data.data.markdown);
        setCopiedBatchId(batchId);
        setTimeout(() => setCopiedBatchId(null), 2000);
      }
    } catch (error) {
      console.error('Failed to get markdown:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">バッチ（箱）一覧</h1>
          <p className="text-gray-500 text-sm">Webtoon や大量画像を「箱」単位で管理・出力します。</p>
        </div>
        <Link 
          to="/batches/new" 
          className="flex items-center px-6 py-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all font-bold"
        >
          <Plus size={20} className="mr-2" />
          新規バッチ作成
        </Link>
      </div>

      {batches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.id} className="glass rounded-3xl overflow-hidden flex flex-col hover:shadow-xl transition-all group border border-white/50">
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary-50 text-primary-500 rounded-2xl">
                    <Package size={24} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Batch ID</span>
                    <code className="text-sm font-mono font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                      {batch.batch_id}
                    </code>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-800 line-clamp-1">
                    {batch.name || '無題のバッチ'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(batch.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-4 py-2 border-y border-gray-50 text-sm">
                  <div className="flex-1">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Images</span>
                    <span className="font-bold text-gray-700">{batch.total_images} 枚</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Path</span>
                    <span className="font-mono text-gray-500 text-xs">/{batch.batch_id}/...</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 flex items-center justify-between gap-2">
                <button
                  onClick={() => copyMarkdown(batch.batch_id)}
                  className={`flex-1 flex items-center justify-center p-2.5 rounded-xl transition-all shadow-sm ${copiedBatchId === batch.batch_id ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-white/80'}`}
                >
                  {copiedBatchId === batch.batch_id ? (
                    <><Check size={16} className="mr-2" /> Copied!</>
                  ) : (
                    <><Copy size={16} className="mr-2" /> MD 出力</>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(batch.batch_id)}
                  className="p-2.5 bg-white text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                  title="削除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Package size={64} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium">バッチがまだありません</p>
          <Link to="/batches/new" className="mt-4 text-primary-500 font-bold hover:underline">
            最初のバッチを作成する
          </Link>
        </div>
      )}
    </div>
  );
}
