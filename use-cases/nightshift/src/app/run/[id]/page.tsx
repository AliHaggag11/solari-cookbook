import { notFound } from "next/navigation";
import { OperatorShell } from "@/components/OperatorShell";
import { getRun } from "@/lib/store";

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) notFound();

  return <OperatorShell runId={id} initialRun={run} />;
}
