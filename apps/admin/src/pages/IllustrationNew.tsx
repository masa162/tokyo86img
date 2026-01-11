import IllustrationForm from '@/components/IllustrationForm';

export default function IllustrationNewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">イラスト新規投稿</h1>
        <p className="text-gray-500 text-sm mt-1">画像をアップロードし、作品を選択してください。</p>
      </div>
      <IllustrationForm />
    </div>
  );
}
