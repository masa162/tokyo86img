import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { episodesApi, worksApi, imageApi } from '@/lib/api';
import type { Episode, Work } from '@unbelong/shared';
import { generateRandomSlug, generateSlug } from '@unbelong/shared';
import { Save, ArrowLeft, Image as ImageIcon, Hash, Upload, Loader2 } from 'lucide-react';

interface EpisodeFormProps {
  episode?: Episode;
  isEdit?: boolean;
}

export default function EpisodeForm({
  episode,
  isEdit = false,
}: EpisodeFormProps) {
  const navigate = useNavigate();
  const thumbFileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [formData, setFormData] = useState({
    work_id: episode?.work_id || '',
    episode_number: episode?.episode_number || 1,
    title: episode?.title || '',
    slug: episode?.slug || (isEdit ? '' : generateRandomSlug()),
    description: episode?.description || '',
    content: episode?.content || '',
    status: episode?.status || 'draft',
    thumbnail_image_id: episode?.thumbnail_image_id || '',
    og_image_id: episode?.og_image_id || '',
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const response = await worksApi.list('comic');
      if (response.data.success && response.data.data) {
        setWorks(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'thumbnail_image_id' | 'og_image_id') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(fieldName);
    try {
      const response = await imageApi.upload(file);
      if (response.data.success && response.data.data) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: response.data.data!.id,
        }));
      }
    } catch (error) {
      console.error('アップロードに失敗しました:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploading(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'episode_number' ? parseInt(value) || 0 : value,
    }));

    // タイトル変更時にスラッグを自動生成
    if (name === 'title' && !isEdit && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        description: formData.description || undefined,
        thumbnail_image_id: formData.thumbnail_image_id || undefined,
        og_image_id: formData.og_image_id || undefined,
      };

      if (isEdit && episode) {
        await (episodesApi.update as any)(episode.id, submitData);
        alert('更新しました');
        navigate('/works');
      } else {
        const response = await (episodesApi.create as any)(submitData);
        alert('作成しました');
        if (response.data.success && response.data.data) {
          navigate(`/episodes/${response.data.data.id}/edit`);
        } else {
          navigate('/works');
        }
      }
    } catch (error: any) {
      console.error('保存に失敗しました:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          戻る
        </button>
        <button
          type="submit"
          disabled={loading || !!uploading}
          className="flex items-center px-6 py-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all disabled:opacity-50"
        >
          <Save size={20} className="mr-2" />
          {isEdit ? '更新する' : '作成して詳細設定へ'}
        </button>
      </div>

      <div className="glass p-8 rounded-3xl space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">作品 <span className="text-red-500">*</span></label>
          <select
            name="work_id"
            value={formData.work_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          >
            <option value="">作品を選択してください</option>
            {works.map((work) => (
              <option key={work.id} value={work.id}>{work.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">話数 <span className="text-red-500">*</span></label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                name="episode_number"
                value={formData.episode_number}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">サムネイル画像ID</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="thumbnail_image_id"
                  value={formData.thumbnail_image_id}
                  onChange={handleChange}
                  placeholder="画像IDを入力"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => thumbFileInputRef.current?.click()}
                disabled={!!uploading}
                className="p-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {uploading === 'thumbnail_image_id' ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              </button>
              <input
                type="file"
                ref={thumbFileInputRef}
                onChange={(e) => handleFileUpload(e, 'thumbnail_image_id')}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="pt-6 border-t border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">タイトル</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">OGP画像ID</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="og_image_id"
                    value={formData.og_image_id}
                    onChange={handleChange}
                    placeholder="画像IDを入力"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => ogFileInputRef.current?.click()}
                  disabled={!!uploading}
                  className="p-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                >
                  {uploading === 'og_image_id' ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                </button>
                <input
                  type="file"
                  ref={ogFileInputRef}
                  onChange={(e) => handleFileUpload(e, 'og_image_id')}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">スラッグ</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">本文 (Markdown)</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none font-mono text-sm"
                placeholder="マンガの各ページURLを1行ずつ入力..."
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
