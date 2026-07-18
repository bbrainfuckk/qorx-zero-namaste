type ProviderName = "openai" | "qwen";

const MAX_QUESTION_CHARS = 2000;
const MAX_PROOF_CHARS = 1800;

function extractText(payload: Record<string, unknown>): string | null {
  if (typeof payload.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload.output)) return null;
  for (const item of payload.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

function providerConfig(provider: ProviderName) {
  if (provider === "qwen") {
    const baseUrl = (
      process.env.DASHSCOPE_BASE_URL ??
      "https://dashscope-us.aliyuncs.com/compatible-mode/v1"
    ).replace(/\/$/, "");
    return {
      apiKey: process.env.DASHSCOPE_API_KEY ?? process.env.QWEN_API_KEY,
      url: `${baseUrl}/responses`,
      model: process.env.QWEN_MODEL ?? "qwen3.7-plus",
      label: "Qwen Cloud",
    };
  }
  return {
    apiKey: process.env.OPENAI_API_KEY,
    url: "https://api.openai.com/v1/responses",
    model: process.env.OPENAI_MODEL ?? "gpt-5.6-terra",
    label: "OpenAI GPT-5.6 Terra",
  };
}

export async function POST(request: Request) {
  let body: { question?: unknown; proofFrame?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    typeof body.question !== "string" ||
    body.question.length === 0 ||
    body.question.length > MAX_QUESTION_CHARS ||
    typeof body.proofFrame !== "string" ||
    body.proofFrame.length > MAX_PROOF_CHARS
  ) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const provider = (process.env.QORX_ZERO_PROVIDER === "qwen"
    ? "qwen"
    : "openai") satisfies ProviderName;
  const config = providerConfig(provider);
  if (!config.apiKey) {
    return Response.json(
      { error: "provider_not_configured", provider: config.label },
      { status: 503 },
    );
  }

  const instructions = [
    "Answer only from the Qorx Zero proof frame.",
    "If the proof frame does not support the answer, say what is missing.",
    "Never claim access to other local memories or files.",
    "Keep the answer concise and cite source hashes in square brackets.",
  ].join(" ");

  try {
    const input = [
      { role: "system", content: instructions },
      {
        role: "user",
        content: `PROOF FRAME\n${body.proofFrame || "(empty)"}\n\nQUESTION\n${body.question}`,
      },
    ];
    const providerBody =
      provider === "openai"
        ? {
            model: config.model,
            store: false,
            reasoning: { effort: "low" },
            text: { verbosity: "low" },
            input,
          }
        : { model: config.model, input };

    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(providerBody),
    });
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return Response.json(
        { error: "provider_error", status: response.status },
        { status: 502 },
      );
    }
    const answer = extractText(payload);
    if (!answer) {
      return Response.json({ error: "empty_provider_response" }, { status: 502 });
    }
    return Response.json({ answer, provider: config.label, model: config.model });
  } catch {
    return Response.json({ error: "provider_unreachable" }, { status: 502 });
  }
}
