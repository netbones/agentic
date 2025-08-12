import { env } from "@/utils/env";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModelV2 } from "@ai-sdk/provider";

export type Provider = "openrouter" | "mistral";

export function getModel(provider: Provider, model?: string): { provider: Provider; modelName: string; model: LanguageModelV2 } {
  if (provider === "mistral") {
    const name = model || "mistral-large-latest";
    return {
      provider,
      modelName: name,
      model: createMistral({ apiKey: env.MISTRAL_API_KEY })(name),
    };
  }

  const name = model || "google/gemini-2.5-pro";
  return {
    provider: "openrouter",
    modelName: name,
    model: createOpenRouter({ apiKey: env.OPENROUTER_API_KEY }).chat(name),
  };
}
