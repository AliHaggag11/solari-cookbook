import { BrowserReplayPage } from "./replay-client";

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BrowserReplayPage runId={id} />;
}
