"use client";

/**
 * Dev Mode Indicator
 *
 * Mostra um badge visual quando a aplicação está em modo mock
 */

import { useEffect, useState } from "react";
import { MOCK_MODE } from "@/lib/mock/config";

export function DevModeIndicator() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Só mostra em desenvolvimento e quando mock mode está ativo
    if (process.env.NODE_ENV === "development" && MOCK_MODE) {
      setIsVisible(true);

      // Mostra warning no console
      console.warn(
        "%c🚧 MODO MOCK ATIVADO",
        "background: #ff9800; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        "\n\nVocê está usando dados simulados para desenvolvimento.",
        "\n\nPara usar dados reais:",
        '\n1. Defina NEXT_PUBLIC_USE_MOCK_DATA=false no .env.local',
        '\n2. Reinicie o servidor (npm run dev)',
        "\n\nMais informações: README.md"
      );
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white shadow-lg"
      role="status"
      aria-label="Modo de desenvolvimento ativo"
    >
      <span className="text-lg" aria-hidden="true">
        🚧
      </span>
      <span>MOCK MODE</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-1 rounded hover:bg-orange-600 px-1"
        aria-label="Fechar indicador"
      >
        ✕
      </button>
    </div>
  );
}
