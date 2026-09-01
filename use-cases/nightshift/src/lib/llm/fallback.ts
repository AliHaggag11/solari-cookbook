import { z } from "zod";

const ActionSchema = z.object({
  action: z.enum(["click", "type", "wait", "navigate", "press"]),
  selector: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
  keys: z.array(z.string()).optional(),
  reason: z.string(),
});

export type LlmAction = z.infer<typeof ActionSchema>;

export async function llmFallback(params: {
  screenshotBase64?: string;
  pageText: string;
  goal: string;
  failedSelector?: string;
}): Promise<LlmAction | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const messages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }> = [
    {
      role: "system",
      content:
        "You recover browser automation when a selector fails. Return ONLY valid JSON matching: {\"action\":\"click|type|wait|navigate|press\",\"selector?\":\"\",\"text?\":\"\",\"url?\":\"\",\"keys?\":[],\"reason\":\"\"}. No markdown.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Goal: ${params.goal}\nFailed selector: ${params.failedSelector ?? "none"}\nPage text:\n${params.pageText.slice(0, 6000)}`,
        },
        ...(params.screenshotBase64
          ? [
              {
                type: "image_url" as const,
                image_url: {
                  url: `data:image/jpeg;base64,${params.screenshotBase64}`,
                },
              },
            ]
          : []),
      ],
    },
  ];

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Nightshift",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages,
        temperature: 0,
        max_tokens: 300,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const json = raw.replace(/^```json?\s*|\s*```$/g, "");
    return ActionSchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}
