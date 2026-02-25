"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GraficoCombinadoProps } from "@/components/charts/GraficoCombinado";

/* ─── Carregamento dinâmico (Recharts não suporta SSR) ─── */

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

const GraficoCombinado = dynamic<GraficoCombinadoProps>(
  () =>
    import("@/components/charts/GraficoCombinado").then(
      (mod) => mod.GraficoCombinado
    ),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

/* ─── Dados de demonstração ─── */

const dadosInvestimento = [
  { ano: "Ano 1", imobilizado: 2_400_000, vendas: 4_200_000, indice: 1.75 },
  { ano: "Ano 2", imobilizado: 2_800_000, vendas: 5_100_000, indice: 1.82 },
  { ano: "Ano 3", imobilizado: 3_200_000, vendas: 6_300_000, indice: 1.97 },
  { ano: "Ano 4", imobilizado: 3_600_000, vendas: 7_800_000, indice: 2.17 },
  { ano: "Ano 5", imobilizado: 4_100_000, vendas: 9_500_000, indice: 2.32 },
];

const dadosEBITDA = [
  { ano: "Ano 1", ebitda: 1_800_000, receita: 4_200_000, margem: 0.428 },
  { ano: "Ano 2", ebitda: 2_100_000, receita: 5_100_000, margem: 0.412 },
  { ano: "Ano 3", ebitda: 2_700_000, receita: 6_300_000, margem: 0.429 },
  { ano: "Ano 4", ebitda: 3_500_000, receita: 7_800_000, margem: 0.449 },
  { ano: "Ano 5", ebitda: 4_600_000, receita: 9_500_000, margem: 0.484 },
];

/* ─── Snippets de código ─── */

const codeBasico = `import { GraficoCombinado } from "@/components/charts/GraficoCombinado";

<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{
    dataKey: "imobilizado",
    name: "Imobilizado Líquido Final",
    color: "var(--primary-800)",
  }}
  linha={{
    dataKey: "indice",
    name: "Vendas / Imobilizado (x)",
    color: "var(--neutral-400)",
    valueFormatter: (v) => \`\${v.toFixed(2)}x\`,
  }}
  title="Evolução do Imobilizado"
  description="Imobilizado Líquido Final e índice Vendas/Imobilizado"
  labelAnoBase="(Ano Base: 1,65x)"
/>`;

const codeToggle = `<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{
    dataKey: "imobilizado",
    name: "Imobilizado Líquido Final",
    color: "var(--primary-800)",
  }}
  barSecundaria={{           // ← habilita toggle switch
    dataKey: "vendas",
    name: "Vendas (Receita Bruta)",
    color: "var(--primary-500)",
  }}
  linha={{
    dataKey: "indice",
    name: "Vendas / Imobilizado (x)",
    color: "var(--neutral-400)",
    valueFormatter: (v) => \`\${v.toFixed(2)}x\`,
  }}
  toggleLabelPrimaria="Imobilizado Liq."
  toggleLabelSecundaria="Vendas"
  title="Imobilizado vs Vendas"
/>`;

const codeMargem = `<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{
    dataKey: "ebitda",
    name: "EBITDA",
    color: "var(--chart-2)",
  }}
  barSecundaria={{
    dataKey: "receita",
    name: "Receita Bruta",
    color: "var(--primary)",
  }}
  linha={{
    dataKey: "margem",
    name: "Margem EBITDA",
    color: "var(--neutral-400)",
    valueFormatter: (v) => \`\${(v * 100).toFixed(1)}%\`,
  }}
  rightAxisFormatter={(v) => \`\${(v * 100).toFixed(0)}%\`}
  toggleLabelPrimaria="EBITDA"
  toggleLabelSecundaria="Receita"
  title="EBITDA e Margem"
/>`;

/* ─── Seção de props ─── */

const props = [
  { name: "data", type: "GraficoCombinadoDado[]", required: true, description: "Array de dados (Record<string, number | string | null>)" },
  { name: "xAxisKey", type: "string", required: true, description: "Chave do eixo X nos dados (ex: \"ano\")" },
  { name: "barPrimaria", type: "BarConfig", required: true, description: "Configuração da barra principal: { dataKey, name, color }" },
  { name: "barSecundaria", type: "BarConfig", required: false, description: "Barra alternativa — habilita o toggle switch quando fornecida" },
  { name: "linha", type: "LinhaConfig", required: true, description: "Linha indicadora no eixo direito: { dataKey, name, color, valueFormatter? }" },
  { name: "title", type: "string", required: true, description: "Título do gráfico" },
  { name: "description", type: "string", required: false, description: "Subtítulo / descrição exibido abaixo do título" },
  { name: "labelAnoBase", type: "string", required: false, description: "Texto destacado após a descrição (ex: \"(Ano Base: 2,5x)\")" },
  { name: "toggleLabelPrimaria", type: "string", required: false, description: "Rótulo esquerdo do toggle (padrão: barPrimaria.name)" },
  { name: "toggleLabelSecundaria", type: "string", required: false, description: "Rótulo direito do toggle (padrão: barSecundaria.name)" },
  { name: "leftAxisFormatter", type: "(v: number) => string", required: false, description: "Formatador do eixo Y esquerdo (padrão: formatCompactNumber)" },
  { name: "rightAxisFormatter", type: "(v: number) => string", required: false, description: "Formatador do eixo Y direito (padrão: v.toFixed(1) + \"x\")" },
  { name: "height", type: "number", required: false, description: "Altura do gráfico em px (padrão: 400)" },
];

/* ─── Mapeamento de tokens recomendados ─── */

const tokenGroups = [
  {
    grupo: "Balanço — Investimentos & Capital de Giro",
    tokens: [
      { uso: "Barra primária (Imobilizado / Capital de Giro)", token: "var(--primary-800)" },
      { uso: "Barra secundária toggle (Vendas / NCG)", token: "var(--primary-500)" },
      { uso: "Linha indicadora (Vendas/Imob. · Vendas/CG)", token: "var(--neutral-400)" },
    ],
  },
  {
    grupo: "Balanço — Empréstimos",
    tokens: [
      { uso: "Barra LP (longo prazo)", token: "var(--alt-800)" },
      { uso: "Barra CP toggle (curto prazo)", token: "var(--alt-500)" },
      { uso: "Linha indicadora (Empréstimos/EBITDA)", token: "var(--neutral-400)" },
    ],
  },
  {
    grupo: "DRE / FCFF",
    tokens: [
      { uso: "Receita / Área (série primária)", token: "var(--primary)" },
      { uso: "EBITDA / Lucro Líquido / FCFF positivo", token: "var(--chart-2)" },
      { uso: "FCFF negativo / erro", token: "var(--destructive)" },
    ],
  },
];

/* ─── Componentes auxiliares ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10 border-b last:border-b-0">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto text-foreground leading-relaxed">
      {code}
    </pre>
  );
}

/* ─── Page ─── */

export default function GraficoCombinadoPage() {
  return (
    <div className="p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">GraficoCombinado</h1>
          <Badge variant="secondary">Custom</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Gráfico composto (Recharts <code className="font-mono text-sm bg-muted px-1 rounded">ComposedChart</code>) com
          barras e linha indicadora em dois eixos Y. Suporta toggle switch para alternar entre duas séries de barras.
        </p>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline">Recharts</Badge>
          <Badge variant="outline">ComposedChart</Badge>
          <Badge variant="outline">Dual Y-axis</Badge>
          <Badge variant="outline">Toggle switch</Badge>
        </div>
      </div>

      {/* ─── Import ─── */}
      <Section title="Import">
        <CodeBlock code={`import { GraficoCombinado } from "@/components/charts/GraficoCombinado";`} />
      </Section>

      {/* ─── Demo 1: básico ─── */}
      <Section title="Básico — barra única + linha indicadora">
        <p className="text-sm text-muted-foreground mb-4">
          Configuração mínima: uma barra (eixo esquerdo) e uma linha indicadora de múltiplo (eixo direito).
          As props <code className="font-mono text-sm bg-muted px-1 rounded">description</code> e{" "}
          <code className="font-mono text-sm bg-muted px-1 rounded">labelAnoBase</code> compõem o subtítulo.
        </p>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <GraficoCombinado
              data={dadosInvestimento}
              xAxisKey="ano"
              barPrimaria={{
                dataKey: "imobilizado",
                name: "Imobilizado Líquido Final",
                color: "var(--primary-800)",
              }}
              linha={{
                dataKey: "indice",
                name: "Vendas / Imobilizado (x)",
                color: "var(--neutral-400)",
                valueFormatter: (v) => `${v.toFixed(2)}x`,
              }}
              title="Evolução do Imobilizado"
              description="Imobilizado Líquido Final e índice Vendas/Imobilizado por ano projetado"
              labelAnoBase="(Ano Base: 1,65x)"
            />
          </CardContent>
        </Card>
        <CodeBlock code={codeBasico} />
      </Section>

      {/* ─── Demo 2: com toggle ─── */}
      <Section title="Com Toggle — alternância entre duas barras">
        <p className="text-sm text-muted-foreground mb-4">
          Quando <code className="font-mono text-sm bg-muted px-1 rounded">barSecundaria</code> é fornecida, um toggle
          switch aparece no cabeçalho para alternar entre as duas séries de barras. A linha é sempre exibida.
        </p>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <GraficoCombinado
              data={dadosInvestimento}
              xAxisKey="ano"
              barPrimaria={{
                dataKey: "imobilizado",
                name: "Imobilizado Líquido Final",
                color: "var(--primary-800)",
              }}
              barSecundaria={{
                dataKey: "vendas",
                name: "Vendas (Receita Bruta)",
                color: "var(--primary-500)",
              }}
              linha={{
                dataKey: "indice",
                name: "Vendas / Imobilizado (x)",
                color: "var(--neutral-400)",
                valueFormatter: (v) => `${v.toFixed(2)}x`,
              }}
              toggleLabelPrimaria="Imobilizado Liq."
              toggleLabelSecundaria="Vendas"
              title="Imobilizado vs Vendas"
              description="Alterne entre Imobilizado Líquido Final e Receita Bruta"
              labelAnoBase="(Ano Base: 1,65x)"
            />
          </CardContent>
        </Card>
        <CodeBlock code={codeToggle} />
      </Section>

      {/* ─── Demo 3: EBITDA e Margem ─── */}
      <Section title="EBITDA e Margem — formatadores personalizados">
        <p className="text-sm text-muted-foreground mb-4">
          O eixo direito e o tooltip da linha aceitam formatadores customizados via{" "}
          <code className="font-mono text-sm bg-muted px-1 rounded">rightAxisFormatter</code> e{" "}
          <code className="font-mono text-sm bg-muted px-1 rounded">linha.valueFormatter</code> — neste exemplo,
          percentual.
        </p>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <GraficoCombinado
              data={dadosEBITDA}
              xAxisKey="ano"
              barPrimaria={{
                dataKey: "ebitda",
                name: "EBITDA",
                color: "var(--chart-2)",
              }}
              barSecundaria={{
                dataKey: "receita",
                name: "Receita Bruta",
                color: "var(--primary)",
              }}
              linha={{
                dataKey: "margem",
                name: "Margem EBITDA",
                color: "var(--neutral-400)",
                valueFormatter: (v) => `${(v * 100).toFixed(1)}%`,
              }}
              rightAxisFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              toggleLabelPrimaria="EBITDA"
              toggleLabelSecundaria="Receita"
              title="EBITDA e Margem EBITDA"
              description="Evolução do EBITDA e margem percentual por ano projetado"
            />
          </CardContent>
        </Card>
        <CodeBlock code={codeMargem} />
      </Section>

      {/* ─── Props ─── */}
      <Section title="Props">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4 font-semibold text-foreground">Prop</th>
                <th className="py-3 pr-4 font-semibold text-foreground">Tipo</th>
                <th className="py-3 pr-4 font-semibold text-foreground">Obrigatório</th>
                <th className="py-3 font-semibold text-foreground">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {props.map((p) => (
                <tr key={p.name} className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 pr-4 font-mono text-primary font-medium">{p.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{p.type}</td>
                  <td className="py-3 pr-4">
                    {p.required ? (
                      <Badge variant="default" className="text-xs">sim</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">não</Badge>
                    )}
                  </td>
                  <td className="py-3 text-muted-foreground">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── Tokens de cor ─── */}
      <Section title="Tokens de Cor Recomendados">
        <p className="text-sm text-muted-foreground mb-4">
          Todas as cores devem usar <code className="font-mono text-sm bg-muted px-1 rounded">var(--token)</code> —
          valores literais (hex, hsl inline, oklch inline) são proibidos pelo Design System.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4 font-semibold text-foreground">Uso</th>
                <th className="py-3 pr-4 font-semibold text-foreground">Token</th>
                <th className="py-3 font-semibold text-foreground">Amostra</th>
              </tr>
            </thead>
            <tbody>
              {tokenGroups.map((group) => (
                <React.Fragment key={group.grupo}>
                  <tr className="border-b bg-muted/30">
                    <td
                      colSpan={3}
                      className="py-2 pl-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      {group.grupo}
                    </td>
                  </tr>
                  {group.tokens.map((t) => (
                    <tr key={t.token} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4 text-muted-foreground">{t.uso}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-foreground">{t.token}</td>
                      <td className="py-3">
                        <span
                          className="inline-block h-5 w-10 rounded"
                          style={{ background: t.token }}
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── Acessibilidade ─── */}
      <Section title="Acessibilidade">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              O toggle switch usa <code className="font-mono bg-muted px-1 rounded">role="switch"</code> e{" "}
              <code className="font-mono bg-muted px-1 rounded">aria-checked</code> para comunicar estado a leitores
              de tela. É navegável por teclado (foco visível via{" "}
              <code className="font-mono bg-muted px-1 rounded">focus-visible:ring-2</code>).
            </p>
            <p>
              O <code className="font-mono bg-muted px-1 rounded">Tooltip</code> do Recharts é acessível via mouse e
              touch. Para navegação por teclado completa, considere adicionar uma tabela de dados complementar.
            </p>
            <p>
              As cores de barras e linha devem ter contraste suficiente entre si e com o fundo (ratio mínimo 3:1 para
              elementos gráficos — WCAG 1.4.11). Use os tokens do Design System para garantir contraste correto em
              light e dark mode.
            </p>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
