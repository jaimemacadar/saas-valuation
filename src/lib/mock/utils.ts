/**
 * Mock Utilities
 *
 * Funções utilitárias para processamento de dados mock
 */

import type { MockFinancialModel } from "./types";

/**
 * Por enquanto, apenas retorna o modelo sem processamento.
 *
 * TODO: Implementar processamento de model_data para calcular DRE, Balance Sheet e FCFF
 * quando os modelos têm apenas inputs (FullValuationInput) mas não dados calculados.
 *
 * Atualmente, os modelos mock em data/models.ts contêm FullValuationInput (apenas inputs),
 * mas as páginas de visualização esperam dados calculados (dre, balanceSheet, fcff).
 *
 * Por isso, ao abrir um modelo, a página fica em branco pois não há dados para exibir.
 */
export function processModelData(model: MockFinancialModel): MockFinancialModel {
  // Por enquanto, apenas retorna o modelo sem alterações
  return model;
}
