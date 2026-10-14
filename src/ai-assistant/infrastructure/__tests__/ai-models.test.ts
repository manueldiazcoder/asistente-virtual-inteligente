/**
 * Tests del registro central de modelos.
 *
 * Protegen el fallo que motivó este archivo: un proveedor retira el modelo
 * hardcodeado y el asistente deja de funcionar sin aviso.
 */

import { describe, it, expect } from "vitest";
import {
  AI_MODELS,
  getModelCandidates,
  isModelNotFoundError,
  buildModelErrorMessage,
  type RealProviderId,
} from "../ai-models";

const PROVIDERS: RealProviderId[] = ["openai", "claude", "gemini"];

describe("registro de modelos", () => {
  it("cada proveedor declara modelo preferido y reservas, ninguno vacío", () => {
    // Un solo test que recorre los tres: repetir la misma afirmación por
    // proveedor solo infla el conteo sin añadir cobertura.
    for (const provider of PROVIDERS) {
      const { primary, fallbacks } = AI_MODELS[provider];

      expect(primary.trim().length).toBeGreaterThan(0);
      // Guardia contra el bug original: un ID vencido no es un placeholder.
      expect(primary).not.toMatch(/TODO|FIXME|placeholder/i);
      expect(fallbacks.length).toBeGreaterThan(0);

      // La cadena de intentos empieza por el preferido y no se repite.
      const candidates = getModelCandidates(provider);
      expect(candidates[0]).toBe(primary);
      expect(new Set(candidates).size).toBe(candidates.length);
    }
  });

  it("reconoce los errores de modelo de las tres APIs", () => {
    // Mensajes reales que devuelven OpenAI, Anthropic y Gemini cuando el
    // modelo ya no existe o la cuenta no tiene acceso a él.
    const MODEL_ERRORS = [
      "The model `gpt-4-turbo` does not exist or you do not have access to it.",
      "model_not_found",
      "model: claude-3-5-sonnet-20241022 does not exist",
      "NOT_FOUND: models/gemini-2.0-flash is not found for API version v1beta",
      "The model `x` is unsupported",
    ];

    for (const message of MODEL_ERRORS) {
      expect(isModelNotFoundError(new Error(message))).toBe(true);
    }
  });

  it("no confunde un error de clave o de cuota con un error de modelo", () => {
    // Frontera de decisión: si un fallo de clave se tratara como de modelo,
    // el sistema cambiaría de modelo sin motivo y escondería el problema real.
    const NOT_MODEL_ERRORS = [
      "Incorrect API key provided",
      "Insufficient quota",
      "Rate limit reached",
      "fetch failed",
    ];

    for (const message of NOT_MODEL_ERRORS) {
      expect(isModelNotFoundError(new Error(message))).toBe(false);
    }
  });

  it("el error de agotar reservas indica qué archivo abrir y dónde mirar IDs", () => {
    const message = buildModelErrorMessage(
      "claude",
      ["claude-sonnet-5-5", "claude-sonnet-4-5"],
      new Error("model does not exist")
    );

    // Qué falló y qué se intentó.
    expect(message).toContain("Anthropic Claude");
    expect(message).toContain("claude-sonnet-5-5, claude-sonnet-4-5");

    // Dónde arreglarlo: un solo archivo, sin ambigüedad.
    expect(message).toContain(
      "src/ai-assistant/infrastructure/ai-models.ts"
    );

    // Dónde mirar los IDs vigentes.
    expect(message).toContain(AI_MODELS.claude.docsUrl);
  });
});
