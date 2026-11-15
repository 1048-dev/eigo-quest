/** API が失敗したときのおしらせ（画面はクラッシュさせず、デフォルト値で表示を続ける） */
export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="speech px-3 py-2 text-sm font-bold">
      <span className="font-title mr-1 text-[#b3202a]">おしらせ</span>{message}
    </p>
  );
}
