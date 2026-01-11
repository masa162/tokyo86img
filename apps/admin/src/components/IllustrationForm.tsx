import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { illustrationsApi, worksApi, imageApi } from '@/lib/api';
import type { Illustration, Work } from '@unbelong/shared';
import { generateRandomSlug, generateSlug } from '@unbelong/shared';
import { Save, ArrowLeft, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

interface IllustrationFormProps {
  illustration?: Illustration;
  isEdit?: boolean;
}

export default function IllustrationForm({
  illustration,
  isEdit = false,
}: IllustrationFormProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [formData, setFormData] = useState({
    work_id: illustration?.work_id || '',
    title: illustration?.title || '',
    slug: illustration?.slug || (isEdit ? '' : generateRandomSlug()),
    description: illustration?.description || '',
    image_id: illustration?.image_id || '',
    og_image_id: illustration?.og_image_id || '',
    status: illustration?.status || 'draft',
    tags: illustration?.tags ? JSON.stringify(JSON.parse(illustration.tags), null, 2) : '[]',
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const response = await worksApi.list('illustration');
      if (response.data.success && response.data.data) {
        setWorks(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image_id' | 'og_image_id') => {
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
      [name]: value,
    }));

    // タイトル変更時にスラッグを自動生成 (非推奨だが互換性のために維持、新規時はランダムが入る)
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
      let tagsArray = [];
      try {
        tagsArray = JSON.parse(formData.tags);
      } catch (err) {
        alert('タグの形式が正しくありません');
        setLoading(false);
        return;
      }

      const submitData = {
        work_id: formData.work_id,
        title: formData.title || '無題', // 新規作成時は空でも可
        slug: formData.slug,
        description: formData.description || undefined,
        image_id: formData.image_id,
        og_image_id: formData.og_image_id || undefined,
        status: formData.status,
        tags: tagsArray,
      };

      if (isEdit && illustration) {
        await (illustrationsApi.update as any)(illustration.id, submitData);
        alert('更新しました');
        navigate('/illustrations');
      } else {
        const response = await (illustrationsApi.create as any)(submitData);
        alert('作成しました');
        if (response.data.success && response.data.data) {
          // 作成後は詳細設定のために編集画面へ遷移
          navigate(`/illustrations/${response.data.data.id}/edit`);
        } else {
          navigate('/illustrations');
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
        {/* 作品選択 */}
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

        {/* 画像ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">画像ID (Cloudflare Images) <span className="text-red-500">*</span></label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="image_id"
                value={formData.image_id}
                onChange={handleChange}
                placeholder="Cloudflare ImagesのIDを入力"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!uploading}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center shrink-0 disabled:opacity-50"
            >
              {uploading === 'image_id' ? <Loader2 className="animate-spin mr-2" size={18} /> : <Upload className="mr-2" size={18} />}
              アップロード
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, 'image_id')}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* 編集時のみ表示される項目 */}
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">OG画像 ID</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="og_image_id"
                    value={formData.og_image_id}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => ogFileInputRef.current?.click()}
                  disabled={!!uploading}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center shrink-0 disabled:opacity-50"
                >
                  {uploading === 'og_image_id' ? <Loader2 className="animate-spin mr-2" size={18} /> : <Upload className="mr-2" size={18} />}
                  アップロード
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">説明</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
