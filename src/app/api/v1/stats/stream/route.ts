import { getDemoStats } from "@/lib/demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let previous = "";
      let lastHeartbeat = Date.now();
      const sendStats = () => {
        if (request.signal.aborted) return;
        const payload = JSON.stringify(getDemoStats());
        if (payload !== previous) {
          previous = payload;
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          lastHeartbeat = Date.now();
        } else if (Date.now() - lastHeartbeat >= 15_000) {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
          lastHeartbeat = Date.now();
        }
      };
      sendStats();
      interval = setInterval(sendStats, 3000);
      request.signal.addEventListener("abort", () => {
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {
          // The stream may already have been canceled by the client.
        }
      }, { once: true });
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
