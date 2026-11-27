/** run9 Phase 1: 「この英語、へん？」ボタンが 出る（さいしょは 小さな ボタンだけ） */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ReportEnglishButton } from "@/components/common/ReportEnglishButton";

describe("ReportEnglishButton", () => {
  it("さいしょは ボタンだけ（まどは とじている）", () => {
    const html = renderToStaticMarkup(<ReportEnglishButton page="teacher" lessonNo={1} segmentId="teacher:0:greet" text="Hello, everyone!" tone="dark" />);
    expect(html).toContain("この英語、へん？");
    expect(html).toContain('data-testid="report-english"');
    expect(html).not.toContain("report-english-form");
  });
});
