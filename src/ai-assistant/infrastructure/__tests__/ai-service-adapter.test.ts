/**
 * Tests del adaptador: fábrica de servicios, modo demo y servicio real.
 *
 * No tocan red ni necesitan API key, así corren en cualquier entorno.
 */

import { describe, it, expect } from "vitest";
import { getAIService } from "../ai-service-adapter";
import type { AIProviderId, Message } from "../../domain/models";

const buildMessage = (
  content: string,
  role: Message["role"] = "user"
): Message => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: Date.now(),
});

describe("adaptador de servicios de IA", () => {
  it("la fábrica devuelve el modo demo para mock y el servicio real para los demás", () => {
    expect(getAIService("mock").constructor.name).toBe("MockAIService");

    for (const provider of ["openai", "claude", "gemini"] as AIProviderId[]) {
      expect(getAIService(provider).constructor.name).toBe(
        "VercelSDKService"
      );
    }
  });

  it("el modo demo responde sin API key y transmite la respuesta en varios trozos", async () => {
    const tokens: string[] = [];
    await getAIService("mock").sendMessage(
      [buildMessage("necesito un hotel")],
      "",
      (token) => tokens.push(token)
    );

    // Sin key y sin red, y en streaming: más de un trozo, no un bloque único.
    expect(tokens.length).toBeGreaterThan(1);
    expect(tokens.join("").length).toBeGreaterThan(0);
  });

  it("el servicio real avisa si falta la API key antes de llamar a la API", async () => {
    // Un fallo claro en la frontera evita una llamada de red inútil.
    await expect(
      getAIService("openai").sendMessage([buildMessage("hola")], "", () => {})
    ).rejects.toThrow(/API Key no configurada para openai/);
  });
});
