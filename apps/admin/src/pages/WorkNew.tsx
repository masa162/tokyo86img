import WorkForm from '@/components/WorkForm';

export default function WorkNewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">作品新規作成</h1>
        <p className="text-gray-500 text-sm mt-1">新しいマンガ作品またはイラストシリーズを登録します。</p>
      </div>
      <WorkForm />
    </div>
  );
}
