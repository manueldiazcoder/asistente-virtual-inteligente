/**
 * Smoke tests de conectividad contra los proveedores reales.
 *
 * NO corren en CI ni en `pnpm test` por defecto: necesitan API key y gastan
 * centavos de dólar por ejecución. Son el chequeo de "¿sigue vivo el modelo
 * que tengo configurado?" que se corre a mano antes de una demo:
 *
 *   OPENAI_API_KEY=sk-... pnpm test:smoke
 *
 * Cada proveedor cuya key falte se omite, en vez de fallar: un smoke parcial
 * sigue siendo útil si solo vas a usar uno en la demo.
 *
 * Si un proveedor retiró el modelo, el fallo aparece aquí con el mensaje
 * accionable de buildModelErrorMessage (archivo a tocar y dónde mirar los IDs
 * vigentes). Ese es el objetivo: que el error diga qué hacer, no que reviente
 * en medio de una entrevista.
 */

import { describe, it, expect } from "vitest";
import { getAIService } from "../ai-service-adapter";
import type { AIProviderId, Message } from "../../domain/models";

const buildMessage = (content: string): Message => ({
  id: crypto.randomUUID(),
  role: "user",
  content,
  timestamp: Date.now(),
});

/** Envía una sola pregunta y devuelve la respuesta completa concatenada. */
const askOnce = async (provider: AIProviderId, apiKey: string) => {
  let full = "";
  await getAIService(provider).sendMessage(
    [buildMessage("Responde solo con la palabra: listo")],
    apiKey,
    (token) => (full += token)
  );
  return full;
};

const PROVIDERS: Array<{
  provider: AIProviderId;
  envVar: string;
  label: string;
}> = [
  { provider: "openai", envVar: "OPENAI_API_KEY", label: "OpenAI" },
  { provider: "claude", envVar: "ANTHROPIC_API_KEY", label: "Claude" },
  { provider: "gemini", envVar: "GEMINI_API_KEY", label: "Gemini" },
];

describe.each(PROVIDERS)("smoke: $label", ({ provider, envVar }) => {
  const apiKey = process.env[envVar] ?? "";

  it.skipIf(!apiKey)(
    "responde con el modelo configurado",
    { timeout: 30_000 },
    async () => {
      const answer = await askOnce(provider, apiKey);

      // Que llegó texto real: no un string vacío ni un fallo silencioso.
      expect(answer.trim().length).toBeGreaterThan(0);
    }
  );
});
