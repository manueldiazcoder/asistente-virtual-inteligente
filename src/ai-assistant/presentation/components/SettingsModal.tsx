import { useState } from "react";
import { Settings, Key } from "lucide-react";
import type { AIConfig, AIProviderId } from "../../domain/models";

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (c: AIConfig) => void;
}) {
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const updateLocalConfig = (updates: Partial<AIConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} className="text-gray-600" />
            Configuración del Cerebro
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Selector de Proveedor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proveedor de Inteligencia
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["mock", "openai", "claude", "gemini"] as AIProviderId[]).map(
                (pid) => (
                  <button
                    key={pid}
                    onClick={() => updateLocalConfig({ providerId: pid })}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-colors flex items-center justify-center gap-2
                    ${
                      localConfig.providerId === pid
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-500"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {pid === "mock" && "🧪 Demo Mock"}
                    {pid === "openai" && "OpenAI GPT"}
                    {pid === "claude" && "Anthropic Claude"}
                    {pid === "gemini" && "Google Gemini"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Inputs de API Keys Dinámicos */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {localConfig.providerId === "mock" && (
              <p className="text-sm text-gray-600 italic text-center">
                Modo de prueba activado. No requiere API Keys.
                <br />
                Simula respuestas basadas en el System Prompt.
              </p>
            )}

            {localConfig.providerId === "openai" && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={localConfig.openaiKey || ""}
                    onChange={(e) =>
                      updateLocalConfig({ openaiKey: e.target.value })
                    }
                    placeholder="sk-..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm text-gray-900 placeholder-gray-400"
                  />
                  <Key
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                </div>
              </div>
            )}

            {localConfig.providerId === "claude" && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                  Anthropic API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={localConfig.claudeKey || ""}
                    onChange={(e) =>
                      updateLocalConfig({ claudeKey: e.target.value })
                    }
                    placeholder="sk-ant-..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm text-gray-900 placeholder-gray-400"
                  />
                  <Key
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                </div>
              </div>
            )}

            {localConfig.providerId === "gemini" && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                  Google API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={localConfig.geminiKey || ""}
                    onChange={(e) =>
                      updateLocalConfig({ geminiKey: e.target.value })
                    }
                    placeholder="AIza..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm text-gray-900 placeholder-gray-400"
                  />
                  <Key
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm shadow-blue-200 transition-colors"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
