import { processModelDataSync } from '../utils';
import type { MockFinancialModel } from '../types';

function createModel(
  updatedAt: string,
  receitaBrutaGrowth: number
): MockFinancialModel {
  return {
    id: 'model-cache-test',
    user_id: 'user-1',
    company_name: 'Cache Test Inc',
    model_data: {
      anosProjecao: 1,
      dreBase: {
        receitaBruta: 1000,
        impostosEDevolucoes: 100,
        cmv: 300,
        despesasOperacionais: 200,
        irCSLL: 50,
        dividendos: 20,
      },
      dreProjection: [
        {
          year: 1,
          receitaBrutaGrowth,
          impostosEDevolucoesRate: 10,
          cmvRate: 40,
          despesasOperacionaisRate: 20,
          irCSLLRate: 34,
          dividendosRate: 25,
        },
      ],
    },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: updatedAt,
  };
}

describe('processModelDataSync', () => {
  it('deve invalidar cache quando updated_at mudar', () => {
    const first = processModelDataSync(
      createModel('2026-01-01T00:00:00.000Z', 5)
    );
    const second = processModelDataSync(
      createModel('2026-01-01T00:01:00.000Z', 20)
    );

    const firstYear1Revenue = (first.model_data as any).dre[1].receitaBruta;
    const secondYear1Revenue = (second.model_data as any).dre[1].receitaBruta;

    expect(firstYear1Revenue).toBe(1050);
    expect(secondYear1Revenue).toBe(1200);
  });
});

