"use client";

import { useEffect, useState } from "react";

export default function ArenaPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/arena")
      .then(async (r) => {
        const text = await r.text();
        return text ? JSON.parse(text) : null;
      })
      .then((d) => setData(d || {}))
      .catch((err) => {
        console.error("Failed to load arena:", err);
        setData({ arenaUser: { nickname: "ゲスト", coins: 0 }, battles: [] });
      });
  }, []);

  if (!data) return <p className="p-8 text-center font-bold">読み込み中…</p>;

  return (
    <div className="space-y-4 p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-black">英語クエスト アリーナ</h1>
      <div className="bg-purple-50 p-4 rounded-xl shadow-sm">
        <div className="text-sm text-gray-600">プレイヤー: {data.arenaUser?.nickname ?? "ゲスト"}</div>
        <div className="text-lg font-bold">所持コイン: 🪙 {data.arenaUser?.coins ?? 0}</div>
      </div>
      <div className="card p-4 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500 text-center py-6">現在利用可能な対戦はありません。</p>
      </div>
    </div>
  );
}