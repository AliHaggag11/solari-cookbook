import { runDemoCloseOnInstance } from "@/lib/runbook/kickoff";
import { getRun, sanitizeRunForClient } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastEventCount = 0;
      let attempts = 0;

      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let run = await getRun(id);
      if (!run && attempts < 10) {
        for (let i = 0; i < 10 && !run; i++) {
          await new Promise((r) => setTimeout(r, 400));
          run = await getRun(id);
        }
      }
      if (!run) {
        send({ error: "not_found" });
        controller.close();
        return;
      }

      const shouldRunEngine = run.status === "queued";

      const engineTask = shouldRunEngine
        ? runDemoCloseOnInstance(id)
        : Promise.resolve();

      while (attempts < 600) {
        run = await getRun(id);
        if (!run) break;

        if (run.events.length > lastEventCount) {
          const newEvents = run.events.slice(lastEventCount);
          lastEventCount = run.events.length;
          send({ run: sanitizeRunForClient(run), events: newEvents });
        } else {
          send({ run: sanitizeRunForClient(run), events: [] });
        }

        if (run.status === "completed" || run.status === "failed") {
          send({ run: sanitizeRunForClient(run), done: true });
          break;
        }

        attempts += 1;
        await new Promise((r) => setTimeout(r, 1000));
      }

      await engineTask.catch(() => {
        /* errors recorded on the run */
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
