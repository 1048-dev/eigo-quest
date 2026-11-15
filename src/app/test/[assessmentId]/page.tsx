import { TestRunner } from "@/components/test/TestRunner";

export default async function TestPage({ params, searchParams }: { params: Promise<{ assessmentId: string }>; searchParams: Promise<{ mode?: string; alert?: string }> }) {
  const { assessmentId } = await params;
  const sp = await searchParams;
  return <TestRunner assessmentId={assessmentId} arenaMode={sp.mode} reviewAlertId={sp.alert} />;
}
