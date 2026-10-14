// @vitest-environment jsdom
/**
 * Tests de la capa de aplicación: el hook que maneja el estado del chat.
 *
 * Cubren el flujo que ve el usuario, no la lógica interna del adaptador:
 * que el mensaje del usuario entra, que la respuesta se acumula en streaming
 * y que elegir un proveedor sin API key produce un aviso claro en el chat en
 * vez de un fallo silencioso.
 */

import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatService } from "../useChatService";

describe("useChatService", () => {
  it("arranca con el mensaje de bienvenida del guía", () => {
    const { result } = renderHook(() => useChatService());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    expect(result.current.messages[0].content).toMatch(/Calima/);
  });

  it("modo demo: el mensaje del usuario entra y la respuesta se acumula en streaming", async () => {
    const { result } = renderHook(() => useChatService());

    await act(async () => {
      await result.current.sendMessage("necesito un hotel");
    });

    expect(result.current.messages.some((m) => m.role === "user")).toBe(true);

    // La respuesta del asistente quedó con contenido, no vacía.
    await waitFor(() => {
      const assistantMessages = result.current.messages.filter(
        (m) => m.role === "assistant"
      );
      const last = assistantMessages[assistantMessages.length - 1];
      expect(last.content.length).toBeGreaterThan(0);
    });
  });

  it("proveedor sin API key: avisa en el chat qué falta, sin lanzar excepción", async () => {
    const { result } = renderHook(() => useChatService());

    act(() => {
      result.current.updateConfig({ providerId: "openai", openaiKey: "" });
    });

    await act(async () => {
      await result.current.sendMessage("hola");
    });

    // El error quedó como mensaje visible en el chat, no propagado.
    const systemMessage = result.current.messages.find(
      (m) => m.role === "system"
    );
    expect(systemMessage?.content).toMatch(/API Key/);
    expect(systemMessage?.content).toMatch(/OPENAI/);
  });
});
