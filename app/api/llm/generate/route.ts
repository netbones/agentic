import { NextResponse } from "next/server";
import { z } from "zod";
import { getModel, type Provider } from "@/utils/llm/config";

const bodySchema = z.object({
  provider: z.enum(["openrouter", "mistral"]).default("openrouter"),
  model: z.string().optional(),
  input: z.string().min(1),
});

export const POST = async (req: Request) => {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);

    const { model } = getModel(body.provider as Provider, body.model);

    // For now, simple non-streamed call using Vercel AI SDK's generateText
    const { generateText } = await import("ai");

    const result = await generateText({
      model,
      prompt: body.input,
    });

    return NextResponse.json({
      provider: body.provider,
      model: (model as any).modelId ?? body.model,
      text: result.text,
      usage: result.usage ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unexpected error" },
      { status: 400 },
    );
  }
};
