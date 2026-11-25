import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";

/**
 * 入口のふりわけ（DB には問い合わせない。DB が止まっていても すぐ開く）
 *  - ログインの cookie がある → だれが あそぶ？（/who。DB 停止なら そこから おためしモードへ）
 *  - おためしを選んだことがある → いつもの マップ
 *  - はじめて → スタート画面（/welcome）
 */
export default async function Home() {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value) redirect("/who");
  if (jar.get("eq_trial")?.value) redirect("/map");
  redirect("/welcome");
}
