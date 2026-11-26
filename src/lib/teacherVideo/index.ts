/**
 * run8 P9: 先生の 動画を つくる「プロバイダー」の 入口。
 *
 *   generate(lesson) → 動画の URL（できていれば）/ まだなら「つぎに すること」
 *
 * いまは "manual"（手で つくって アップロードする）だけ。
 *  1. npx tsx scripts/teacher-export.ts で exports/teacher/<lessonNo>/ に 台本・字幕・スライドを 書きだす
 *  2. えらんだ AI アバター動画サービスで 動画を つくる（docs/run8/VIDEO-VENDORS.md）
 *  3. 動画（と 字幕 .vtt）を ストレージに アップロードする
 *  4. npx tsx scripts/teacher-link.ts link <lessonNo> <url> で content/teacher-videos.json に つなぐ
 *
 * 本物の サービスの API を つかう プロバイダーは、サービスを えらんで その 公式ドキュメントを たしかめてから
 * この インターフェースで 足す（よそうで API を 書かない）。
 */
import type { LessonDef } from "@/lib/domain/types";
import { teacherVideoUrl, type TeacherVideoManifest } from "./manifest";
import { vttUrlFor } from "@/lib/teacher/media";

export type TeacherVideoResult =
  | { status: "ready"; provider: string; lessonNo: number; videoUrl: string; subtitlesUrl: string | null }
  | { status: "pending"; provider: string; lessonNo: number; messageJa: string; nextStepsJa: string[] };

export interface TeacherVideoProvider {
  id: string;
  labelJa: string;
  /** レッスンの 動画を つくる（または すでに ある 動画を さがす） */
  generate(lesson: Pick<LessonDef, "lessonNo">): Promise<TeacherVideoResult>;
}

export function manualProvider(manifest?: TeacherVideoManifest): TeacherVideoProvider {
  return {
    id: "manual",
    labelJa: "手動（書きだし → 動画サービス → アップロード → teacher-link）",
    async generate(lesson) {
      const url = teacherVideoUrl(lesson.lessonNo, manifest);
      if (url) return { status: "ready", provider: "manual", lessonNo: lesson.lessonNo, videoUrl: url, subtitlesUrl: vttUrlFor(url) };
      const dir = `exports/teacher/${String(lesson.lessonNo).padStart(4, "0")}/`;
      return {
        status: "pending",
        provider: "manual",
        lessonNo: lesson.lessonNo,
        messageJa: `L${lesson.lessonNo} の 動画は まだ ありません（バーチャル先生が 授業します）。`,
        nextStepsJa: [
          `npx tsx scripts/teacher-export.ts --from ${lesson.lessonNo} --to ${lesson.lessonNo} で ${dir} を つくる`,
          `${dir}script.txt と slides.json を 動画サービスに わたして 動画を つくる`,
          `動画を ストレージに アップロードし、${dir}subtitles.vtt を 動画と 同じ 名前の .vtt で となりに おく`,
          `npx tsx scripts/teacher-link.ts link ${lesson.lessonNo} <動画の URL>`,
        ],
      };
    },
  };
}

const PROVIDERS: Record<string, () => TeacherVideoProvider> = {
  manual: () => manualProvider(),
};

export const TEACHER_VIDEO_PROVIDER_IDS = Object.keys(PROVIDERS);

export function getTeacherVideoProvider(id = "manual"): TeacherVideoProvider {
  const make = PROVIDERS[id];
  if (!make) throw new Error(`unknown teacher video provider: ${id} (available: ${TEACHER_VIDEO_PROVIDER_IDS.join(", ")})`);
  return make();
}

export { teacherVideoUrl } from "./manifest";
