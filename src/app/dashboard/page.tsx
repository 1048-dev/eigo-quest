"use client";

import { useEffect, useState } from "react";

interface LearningItemDef {
  id: string;
  text: string;
  ja: string;
  emoji?: string | null;
}

interface Dashboard {
  user: {
    nickname: string;
    coins: number;
    streakDays: number;
    longestStreak: number;
    lastStudyDate: string | null;
  };
  todayStats: {
    count: number;
    correctCount: number;
  };
  weakest: LearningItemDef[];
  history: { date: string; overall: number }[];
}

const SHORT: Record<string, string> = {
  SCHOOL_TEST: "学校テスト",
  PHONICS: "フォニックス",
  LISTENING: "リスニング",
  SPEAKING: "発音",
  VOCABULARY: "語彙",
  WRITING: "作文",
};

export default function DashboardPage() {
  const [d, setD] = useState<Dashboard | null>(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/dashboard")
        .then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : null;
        })
        .then((data) => {
          if (data) setD(data);
        })
        .catch((err) => console.error("Failed to parse dashboard JSON:", err));
    };
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!d) return <p className="p-8 text-center">読み込み中…</p>;

  return (
    <div className="space-y-4 p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-black">英語クエスト ダッシュボード</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-500">コイン</div>
          <div className="text-lg font-bold">{d.user.coins}</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-500">継続日数</div>
          <div className="text-lg font-bold">{d.user.streakDays}日</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-500">本日の学習</div>
          <div className="text-lg font-bold">{d.todayStats.count}問</div>
        </div>
      </div>
    </div>
  );
}