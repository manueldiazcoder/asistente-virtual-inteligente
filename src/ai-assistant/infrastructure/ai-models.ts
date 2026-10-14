/**
 * ==============================================================================
 * CAPA 2: INFRASTRUCTURE
 * Registro central de modelos por proveedor.
 * ==============================================================================
 *
 * Único punto del proyecto donde se declara qué modelo usa cada proveedor.
 * Cuando un proveedor retire un modelo, se cambia aquí y en ningún otro sitio.
 *
 * Cada proveedor tiene un modelo preferido y una lista de reservas: si la API
 * responde que el modelo no existe, se intenta la siguiente reserva antes de
 * fallar. Eso evita que una retirada de modelo deje el asistente inservible.
 *
 * Documentación oficial consultada (2026-10-12):
 *   OpenAI:    https://developers.openai.com/api/docs/models
 *   Anthropic: https://platform.claude.com/docs/en/models/overview
 *   Gemini:    https://ai.google.dev/gemini-api/docs/models
 */

export type RealProviderId = "openai" | "claude" | "gemini";

export interface ProviderModelConfig {
  /** Nombre del proveedor tal como aparece en los mensajes de error. */
  readonly label: string;
  /** Modelo preferido. */
  readonly primary: string;
  /** Modelos de reserva, en orden de preferencia. */
  readonly fallbacks: readonly string[];
  /** Dónde mirar los identificadores vigentes. */
  readonly docsUrl: string;
  /** Última fecha en que este registro se contrastó con la documentación oficial. */
  readonly lastVerified: string;
}

export const AI_MODELS: Record<RealProviderId, ProviderModelConfig> = {
  openai: {
    label: "OpenAI",
    // Alias de Chat Completions que OpenAI actualiza solo hacia el último modelo
    // de su familia de chat. Evita quedarse sin modelo cuando sacan una versión.
    primary: "gpt-5.1-chat-latest",
    fallbacks: ["gpt-4o", "gpt-4o-mini"],
    docsUrl: "https://developers.openai.com/api/docs/models",
    lastVerified: "2026-10-12",
  },
  claude: {
    label: "Anthropic Claude",
    // ID sin fecha: snapshot fijo. Retiro comprometido no antes de 2027-09-28.
    primary: "claude-sonnet-5-5",
    // Legacy listados como "still available" en la documentación oficial.
    fallbacks: ["claude-sonnet-4-5", "claude-haiku-4-5"],
    docsUrl: "https://platform.claude.com/docs/en/models/overview",
    lastVerified: "2026-10-12",
  },
  gemini: {
    label: "Google Gemini",
    // Alias oficial de Google: apunta siempre al último Flash disponible.
    primary: "gemini-flash-latest",
    // Detrás de flash-latest está el 3.5 Flash (GA desde 2026-05-19).
    fallbacks: ["gemini-3.5-flash", "gemini-2.5-flash"],
    docsUrl: "https://ai.google.dev/gemini-api/docs/models",
    lastVerified: "2026-10-12",
  },
};

/** Devuelve el modelo preferido y sus reservas, en orden de intento. */
export const getModelCandidates = (
  provider: RealProviderId
): readonly string[] => {
  const config = AI_MODELS[provider];
  return [config.primary, ...config.fallbacks];
};

/** Patrones que las tres APIs usan para decir que un modelo no existe. */
const MODEL_NOT_FOUND_PATTERNS = [
  "model_not_found",
  "does not exist",
  "no se encontró el modelo",
  "model: ",
  "not_found_error",
  "is not found",
  "no models found",
  "unsupported model",
  "is unsupported",
];

/**
 * Detecta si un error significa "ese modelo ya no existe o no está disponible
 * para esta cuenta". El resto de fallos (clave inválida, sin saldo, red) se
 * dejan pasar tal cual: no tienen nada que ver con el modelo.
 */
export const isModelNotFoundError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return MODEL_NOT_FOUND_PATTERNS.some((pattern) =>
    message.includes(pattern.toLowerCase())
  );
};

/**
 * Mensaje de error accionable: dice qué falló, qué modelos se intentaron y
 * dónde cambiarlos. Pensado para leerse en consola en mitad de una entrevista
 * y arreglarse en un minuto.
 */
export const buildModelErrorMessage = (
  provider: RealProviderId,
  attempted: readonly string[],
  cause: unknown
): string => {
  const config = AI_MODELS[provider];
  const reason = cause instanceof Error ? cause.message : String(cause);

  return [
    `${config.label}: no se pudo generar respuesta con ninguno de los modelos configurados.`,
    `Modelos intentados: ${attempted.join(", ")}.`,
    `Causa reportada por la API: ${reason}`,
    "",
    "Qué hacer:",
    `1. Abre ${config.docsUrl} y copia un identificador vigente para ${config.label}.`,
    "2. Reemplázalo en src/ai-assistant/infrastructure/ai-models.ts (campo 'primary' del proveedor).",
    "3. Guarda y vuelve a ejecutar. No hace falta tocar ningún otro archivo.",
    "",
    `Última verificación de este registro: ${config.lastVerified}.`,
  ].join("\n");
};
