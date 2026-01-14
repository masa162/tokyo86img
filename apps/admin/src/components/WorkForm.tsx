import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { worksApi, imageApi } from '@/lib/api';
import type { Work } from '@unbelong/shared';
import { generateRandomSlug, generateSlug } from '@unbelong/shared';
import { Save, ArrowLeft, Image as ImageIcon, Upload, Loader2, Tag } from 'lucide-react';

interface WorkFormProps {
  work?: Work;
  isEdit?: boolean;
}

export default function WorkForm({
  work,
  isEdit = false,
}: WorkFormProps) {
  const navigate = useNavigate();
  const thumbFileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: work?.type || 'comic',
    title: work?.title || '',
    slug: work?.slug || (isEdit ? '' : generateRandomSlug(8)),
    description: work?.description || '',
    status: work?.status || 'published',
    thumbnail_image_id: work?.thumbnail_image_id || '',
    og_image_id: work?.og_image_id || '',
    tags: work?.tags ? JSON.stringify(JSON.parse(work.tags), null, 2) : '[]',
  });

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
      [name]: value,
    }));

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
        alert('タグの形式が正しくありません (JSON形式である必要があります)');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        description: formData.description || undefined,
        thumbnail_image_id: formData.thumbnail_image_id || undefined,
        og_image_id: formData.og_image_id || undefined,
        tags: tagsArray,
      };

      if (isEdit && work) {
        await worksApi.update(work.id, submitData as any);
        alert('更新しました');
        navigate('/works');
      } else {
        await worksApi.create(submitData as any);
        alert('作成しました');
        navigate('/works');
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
          onClick={() => navigate('/works')}
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
          {isEdit ? '更新する' : '作成する'}
        </button>
      </div>

      <div className="glass p-8 rounded-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">作品タイプ <span className="text-red-500">*</span></label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white disabled:bg-gray-50"
            >
              <option value="comic">マンガ (Webtoon)</option>
              <option value="illustration">イラストシリーズ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス <span className="text-red-500">*</span></label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="published">公開</option>
              <option value="draft">下書き</option>
              <option value="archived">アーカイブ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">作品タイトル <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="作品の正式名称"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">スラッグ <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="URL用識別子"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">説明</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="作品の概要文"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="画像ID"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => thumbFileInputRef.current?.click()}
                disabled={!!uploading}
                className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0"
              >
                {uploading === 'thumbnail_image_id' ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              </button>
              <input type="file" ref={thumbFileInputRef} onChange={(e) => handleFileUpload(e, 'thumbnail_image_id')} accept="image/*" className="hidden" />
            </div>
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
                  placeholder="画像ID"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => ogFileInputRef.current?.click()}
                disabled={!!uploading}
                className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0"
              >
                {uploading === 'og_image_id' ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              </button>
              <input type="file" ref={ogFileInputRef} onChange={(e) => handleFileUpload(e, 'og_image_id')} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Tag size={16} className="mr-2" />
            タグ (JSON形式)
          </label>
          <textarea
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono text-sm"
            placeholder='["タグ1", "タグ2"]'
          />
        </div>
      </div>
    </form>
  );
}
