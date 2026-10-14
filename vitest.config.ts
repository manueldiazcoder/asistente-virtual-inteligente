import { defineConfig } from "vitest/config";

// Configuración propia para Vitest: no se reutiliza vite.config.ts para no
// arrastrar plugins de la app (Tailwind, React SWC) a los tests de lógica.
export default defineConfig({
  test: {
    // Los tests de unidad corren en Node: no tocan DOM ni red salvo los smoke.
    environment: "node",
    include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
    // Los smoke tests viven en su propio archivo y se saltan sin API key.
    passWithNoTests: true,
  },
});
