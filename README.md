# Implementación Modelos IA - Calima IA 🤖

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-Custom-red.svg)](LICENSE)

Asistente turístico inteligente para Calima Darién, Colombia. Chatbot con IA que ayuda a los visitantes con recomendaciones de actividades, lugares y más.

## 🚀 Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm run dev

# Construir para producción
pnpm run build

# Tests (sin red, sin API key)
pnpm test

# Smoke tests contra los proveedores reales (requiere API key)
OPENAI_API_KEY=sk-... pnpm test:smoke
```

## 📋 Características

- Chat con IA (OpenAI, Claude, Gemini) con modo demo sin API key
- Streaming token a token
- Diseño responsive
- Arquitectura limpia en capas con TypeScript
- Base de conocimientos local de Calima

## 🏗️ Estructura

```
src/ai-assistant/
├── domain/           # Modelos y tipos (agnóstico a frameworks)
├── application/      # Lógica de negocio (hooks de React)
├── infrastructure/   # Adaptadores de IA, modelos, prompts, mock
└── presentation/     # Componentes React
```

## 🧠 Modelos configurados

Los IDs de modelo viven en un solo archivo:
`src/ai-assistant/infrastructure/ai-models.ts`. Cada proveedor tiene un modelo
preferido y una cadena de reservas: si la API responde que el modelo no existe,
se intenta la siguiente reserva antes de fallar.

| Proveedor | Preferido (oct 2026) | Nota |
| --- | --- | --- |
| OpenAI | `gpt-5.1-chat-latest` | alias de Chat Completions que OpenAI actualiza solo |
| Claude | `claude-sonnet-5-5` | snapshot fijo, retiro comprometido no antes de sept 2027 |
| Gemini | `gemini-flash-latest` | alias oficial de Google, siempre el último Flash |

Si un proveedor retira un modelo, el error dice exactamente qué archivo abrir,
qué campo cambiar y a dónde mirar los IDs vigentes. No hace falta buscar en el
resto del código.

## 🧪 Tests

```bash
pnpm test          # 10 tests de unidad, sin red ni API key
pnpm test:watch    # modo watch
pnpm test:smoke    # una pregunta real por proveedor (requiere API key)
```

La suite cubre solo lo que puede romperse y conviene atrapar antes:

- **Registro de modelos** (`ai-models.test.ts`): cada proveedor tiene modelo
  preferido y reserva, los errores de modelo de las tres APIs se reconocen, un
  fallo de clave o cuota no se confunde con un error de modelo, y el mensaje de
  agotar reservas dice qué archivo abrir.
- **Adaptador** (`ai-service-adapter.test.ts`): la fábrica devuelve el servicio
  correcto, el modo demo transmite sin API key, y el servicio real avisa si
  falta la clave antes de llamar a la API.
- **Hook del chat** (`useChatService.test.tsx`): el saludo inicial, la respuesta
  del modo demo se acumula en streaming, y una clave faltante se avisa en el
  chat en vez de lanzar una excepción.
- **Smoke** (`providers.smoke.test.ts`): una pregunta real por proveedor. Los
  proveedores sin API key se omiten, no fallan.

## 🛠️ Tecnologías

- React 19 + TypeScript
- Tailwind CSS
- Vite
- Vercel AI SDK

## 🤝 Contribuciones

Si quieres contribuir:

1. Fork el repo
2. Crea una branch: `git checkout -b feature/nueva-funcion`
3. Commit: `git commit -m 'Agrega nueva funcion'`
4. Push: `git push origin feature/nueva-funcion`
5. Abre un Pull Request

## 📞 Contacto

LinkedIn: [@manuelcoder](https://linkedin.com/in/manuelcoder)

## 📄 Licencia

Licencia personal - ver archivo [LICENSE](LICENSE) para detalles. No usar comercialmente sin autorización.
