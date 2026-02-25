"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/* ─── Tipos ─── */

type RowType = "header" | "value" | "subtotal" | "total" | "premise" | "annotation";

interface DemoRow {
  key: string;
  label: string;
  type: RowType;
  values: (number | null)[];
  hasChildPremise?: boolean;
  parentKey?: string;
  fmt?: "currency" | "ratio" | "pct";
}

/* ─── Dados estáticos de demonstração ─── */

const ANOS = ["Ano Base", "Ano 1", "Ano 2", "Ano 3"];

const demoRows: DemoRow[] = [
  {
    key: "hdr-imob",
    label: "IMOBILIZADO",
    type: "header",
    values: [null, null, null, null],
  },
  {
    key: "imob-bruto",
    label: "Imobilizado Bruto (início)",
    type: "value",
    values: [4_800_000, 5_760_000, 6_912_000, 8_294_400],
  },
  {
    key: "depr-acum",
    label: "(-) Depr. Acumulada (início)",
    type: "value",
    values: [-960_000, -1_248_000, -1_593_600, -2_004_480],
  },
  {
    key: "imob-liq-ini",
    label: "(=) Imobilizado Líquido Inicial",
    type: "subtotal",
    values: [3_840_000, 4_512_000, 5_318_400, 6_289_920],
  },
  {
    key: "capex",
    label: "(+) CAPEX",
    type: "value",
    values: [null, 960_000, 1_152_000, 1_382_400],
    hasChildPremise: true,
  },
  {
    key: "capex-premise",
    label: "↳ CAPEX s/ vendas (%)",
    type: "premise",
    parentKey: "capex",
    values: [null, 10, 10, 10],
    fmt: "pct",
  },
  {
    key: "depreciacao",
    label: "(-) Depreciação do Período",
    type: "value",
    values: [null, -288_000, -345_600, -414_720],
  },
  {
    key: "imob-liq-fin",
    label: "(=) Imobilizado Líquido Final",
    type: "total",
    values: [3_840_000, 5_184_000, 6_124_800, 7_257_600],
  },
  {
    key: "vendas-imob",
    label: "└─ Vendas / Imobilizado (x)",
    type: "annotation",
    values: [null, 1.85, 1.93, 2.01],
    fmt: "ratio",
  },
];

/* ─── Helpers de formatação ─── */

function formatValue(
  v: number | null,
  fmt: DemoRow["fmt"],
  decimals: boolean
): string {
  if (v === null) return "—";
  if (fmt === "ratio") return `${v.toFixed(2)}x`;
  if (fmt === "pct") return `${v.toFixed(0)}%`;
  return v.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });
}

/* ─── Helpers de estilo por RowType ─── */

const ROW_BG: Record<RowType, string> = {
  header: "bg-muted-alt border-t-2",
  value: "",
  subtotal: "bg-muted-alt",
  total: "bg-muted-alt",
  premise: "bg-premise-bg",
  annotation: "bg-annotation-bg",
};

const CELL_BG: Record<RowType, string> = {
  header: "bg-muted-alt group-hover:bg-muted-alt",
  value: "bg-card group-hover:bg-muted-alt",
  subtotal: "bg-muted-alt group-hover:bg-muted-alt",
  total: "bg-muted-alt group-hover:bg-muted-alt",
  premise: "bg-premise-bg group-hover:bg-muted-alt",
  annotation: "bg-annotation-bg group-hover:bg-muted-alt",
};

const LABEL_STYLE: Record<RowType, string> = {
  header: "font-bold text-sm",
  value: "text-muted-foreground",
  subtotal: "font-semibold",
  total: "font-bold",
  premise: "text-xs text-muted-foreground pl-4",
  annotation: "text-xs text-muted-foreground pl-4 italic",
};

const VALUE_STYLE: Record<RowType, string> = {
  header: "font-bold text-sm",
  value: "text-muted-foreground",
  subtotal: "font-semibold",
  total: "font-bold",
  premise: "text-xs text-muted-foreground",
  annotation: "text-xs text-muted-foreground italic",
};

/* ─── Snippets ─── */

const codeRowTypes = `type RowType =
  | "header"      // Cabeçalho de seção — bg-muted-alt, font-bold, border-t-2
  | "value"       // Linha de valor comum — bg-card, text-muted-foreground
  | "subtotal"    // Subtotal intermediário — bg-muted-alt, font-semibold
  | "total"       // Total final — bg-muted-alt, font-bold
  | "premise"     // Premissa editável — bg-premise-bg, text-xs pl-4
  | "annotation"; // Indicador / nota — bg-annotation-bg, text-xs italic`;

const codeStyleMaps = `const ROW_BG: Record<RowType, string> = {
  header:     "bg-muted-alt border-t-2",
  value:      "",
  subtotal:   "bg-muted-alt",
  total:      "bg-muted-alt",
  premise:    "bg-premise-bg",
  annotation: "bg-annotation-bg",
};

const CELL_BG: Record<RowType, string> = {
  header:     "bg-muted-alt group-hover:bg-muted-alt",
  value:      "bg-card group-hover:bg-muted-alt",
  subtotal:   "bg-muted-alt group-hover:bg-muted-alt",
  total:      "bg-muted-alt group-hover:bg-muted-alt",
  premise:    "bg-premise-bg group-hover:bg-muted-alt",
  annotation: "bg-annotation-bg group-hover:bg-muted-alt",
};`;

const codeTableSetup = `<div className="rounded-md border bg-card overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        {/* Coluna de label — sticky */}
        <TableHead className="w-[240px] min-w-[200px] sticky left-0 z-10 bg-card font-semibold" />
        {anos.map((a) => (
          <TableHead key={a} className="w-[110px] min-w-[100px] text-right font-semibold">
            {a}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {visibleRows.map((row) => (
        <TableRow key={row.key} className={cn("group", ROW_BG[row.type])}>
          {/* Label — sticky, bg por tipo */}
          <TableCell className={cn("sticky left-0 z-10 transition-colors", CELL_BG[row.type])}>
            <div className={cn("whitespace-nowrap", LABEL_STYLE[row.type])}>
              {row.label}
            </div>
          </TableCell>
          {/* Valores — text-right tabular-nums */}
          {row.values.map((v, i) => (
            <TableCell key={i}>
              {row.type !== "header" && (
                <div
                  className={cn(
                    "text-right tabular-nums",
                    VALUE_STYLE[row.type],
                    v !== null && v < 0 && "text-red-600"
                  )}
                >
                  {formatCurrency(v)}
                </div>
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>`;

const codePremiseFilter = `const visibleRows = rows.filter((row) => {
  if (row.type !== "premise") return true; // não-premissa sempre visível
  if (showAllPremises) return true;        // botão global ativo
  if (row.parentKey) return expandedRows.has(row.parentKey); // expandido por chevron
  return false;
});`;

/* ─── Componentes auxiliares ─── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

export default function TabelasPage() {
  const [showPremises, setShowPremises] = useState(false);
  const [showDecimals, setShowDecimals] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleRows = demoRows.filter((row) => {
    if (row.type !== "premise") return true;
    if (showPremises) return true;
    if (row.parentKey && expandedRows.has(row.parentKey)) return true;
    return false;
  });

  return (
    <div className="p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">Tabelas Financeiras</h1>
          <Badge variant="secondary">Custom</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Sistema de tabelas para exibição de dados financeiros projetados por
          ano (Balanço Patrimonial, DRE, FCFF). Construído sobre o componente{" "}
          <code className="font-mono text-sm bg-muted px-1 rounded">Table</code>{" "}
          do shadcn/ui com tokens customizados de background e convenções de
          tipagem semântica por linha.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">shadcn/ui Table</Badge>
          <Badge variant="outline">6 tipos de linha</Badge>
          <Badge variant="outline">Coluna sticky</Badge>
          <Badge variant="outline">Premissas colapsáveis</Badge>
          <Badge variant="outline">tabular-nums</Badge>
        </div>
      </div>

      {/* ─── Import ─── */}
      <Section title="Import">
        <CodeBlock
          code={`import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";`}
        />
      </Section>

      {/* ─── Demo ─── */}
      <Section title="Demo — Todos os tipos de linha">
        <p className="text-sm text-muted-foreground mb-4">
          Clique na linha <strong>(+) CAPEX</strong> para expandir a premissa
          individualmente via chevron, ou use o botão{" "}
          <em>Exibir premissas</em> para revelar todas de uma vez. O toggle{" "}
          <em>Decimais</em> alterna entre arredondamento e duas casas decimais.
        </p>

        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground italic pl-1">
            Valores em R$ (Reais)
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="demo-decimals"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Decimais
              </Label>
              <Switch
                id="demo-decimals"
                checked={showDecimals}
                onCheckedChange={setShowDecimals}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPremises((p) => !p)}
              className="h-7 gap-1.5 text-xs"
            >
              {showPremises ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Ocultar premissas
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Exibir premissas
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px] min-w-[220px] font-semibold sticky left-0 z-10 bg-card" />
                {ANOS.map((a) => (
                  <TableHead
                    key={a}
                    className="w-[110px] min-w-[100px] text-right font-semibold"
                  >
                    {a}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow
                  key={row.key}
                  className={cn("group", ROW_BG[row.type])}
                >
                  {/* Coluna de label — sticky */}
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 transition-colors",
                      CELL_BG[row.type]
                    )}
                  >
                    <div
                      className={cn(
                        "min-w-[220px] whitespace-nowrap flex items-center gap-1.5",
                        LABEL_STYLE[row.type],
                        row.hasChildPremise &&
                          "cursor-pointer select-none hover:text-foreground/80 transition-colors"
                      )}
                      onClick={
                        row.hasChildPremise
                          ? () => toggleRow(row.key)
                          : undefined
                      }
                    >
                      {row.hasChildPremise ? (
                        <span className="text-muted-foreground/60 flex-shrink-0">
                          {showPremises || expandedRows.has(row.key) ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                      ) : null}
                      <span>{row.label}</span>
                    </div>
                  </TableCell>

                  {/* Colunas de valores */}
                  {row.values.map((v, i) => (
                    <TableCell key={i}>
                      {row.type !== "header" && (
                        <div
                          className={cn(
                            "text-right tabular-nums",
                            VALUE_STYLE[row.type],
                            v !== null && v < 0 && "text-red-600"
                          )}
                        >
                          {formatValue(v, row.fmt, showDecimals)}
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* ─── Tipos de Linha ─── */}
      <Section title="Tipos de Linha">
        <p className="text-sm text-muted-foreground mb-6">
          Cada linha recebe um{" "}
          <code className="font-mono text-xs bg-muted px-1 rounded">
            type: RowType
          </code>{" "}
          que determina background, tipografia do label e peso do valor numérico.
        </p>
        <CodeBlock code={codeRowTypes} />

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4 font-semibold text-foreground">Tipo</th>
                <th className="py-3 pr-4 font-semibold text-foreground">Background da linha</th>
                <th className="py-3 pr-4 font-semibold text-foreground">Label</th>
                <th className="py-3 font-semibold text-foreground">Valor numérico</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  {
                    type: "header",
                    rowBg: "bg-muted-alt + border-t-2",
                    label: "font-bold text-sm",
                    value: "font-bold text-sm",
                  },
                  {
                    type: "value",
                    rowBg: "bg-card (padrão)",
                    label: "text-muted-foreground",
                    value: "text-muted-foreground",
                  },
                  {
                    type: "subtotal",
                    rowBg: "bg-muted-alt",
                    label: "font-semibold",
                    value: "font-semibold",
                  },
                  {
                    type: "total",
                    rowBg: "bg-muted-alt",
                    label: "font-bold",
                    value: "font-bold",
                  },
                  {
                    type: "premise",
                    rowBg: "bg-premise-bg",
                    label: "text-xs text-muted-foreground pl-4",
                    value: "text-xs text-muted-foreground",
                  },
                  {
                    type: "annotation",
                    rowBg: "bg-annotation-bg",
                    label: "text-xs text-muted-foreground pl-4 italic",
                    value: "text-xs text-muted-foreground italic",
                  },
                ] as const
              ).map((r) => (
                <tr
                  key={r.type}
                  className="border-b hover:bg-muted/40 transition-colors"
                >
                  <td className="py-3 pr-4 font-mono text-primary font-medium">
                    {r.type}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                    {r.rowBg}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                    {r.label}
                  </td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <CodeBlock code={codeStyleMaps} />
        </div>
      </Section>

      {/* ─── Tokens Semânticos ─── */}
      <Section title="Tokens Semânticos de Background">
        <p className="text-sm text-muted-foreground mb-6">
          Três tokens customizados definidos em{" "}
          <code className="font-mono text-xs bg-muted px-1 rounded">
            globals.css
          </code>{" "}
          com valores distintos para light e dark mode.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4 font-semibold text-foreground">Token CSS</th>
                <th className="py-3 pr-4 font-semibold text-foreground">Classe Tailwind</th>
                <th className="py-3 pr-4 font-semibold text-foreground">Uso</th>
                <th className="py-3 font-semibold text-foreground">Amostra</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  {
                    token: "--muted-alt",
                    cls: "bg-muted-alt",
                    uso: "header / subtotal / total",
                  },
                  {
                    token: "--premise-bg",
                    cls: "bg-premise-bg",
                    uso: "premise — premissas editáveis",
                  },
                  {
                    token: "--annotation-bg",
                    cls: "bg-annotation-bg",
                    uso: "annotation — indicadores e notas",
                  },
                ] as const
              ).map((t) => (
                <tr
                  key={t.token}
                  className="border-b hover:bg-muted/40 transition-colors"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-foreground">
                    {`var(${t.token})`}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-primary">
                    {t.cls}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.uso}</td>
                  <td className="py-3">
                    <div className={cn("h-7 w-20 rounded border", t.cls)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          <strong>Hover:</strong> todas as células usam{" "}
          <code className="font-mono bg-muted px-1 rounded">
            group-hover:bg-muted-alt
          </code>{" "}
          para feedback uniforme de linha. O{" "}
          <code className="font-mono bg-muted px-1 rounded">TableRow</code>{" "}
          recebe{" "}
          <code className="font-mono bg-muted px-1 rounded">className="group"</code>{" "}
          para ativar o padrão.
        </p>
      </Section>

      {/* ─── Padrões e Comportamentos ─── */}
      <Section title="Padrões e Comportamentos">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coluna de label sticky</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                O primeiro{" "}
                <code className="font-mono bg-muted px-1 rounded">TableHead</code>{" "}
                e todos os primeiros{" "}
                <code className="font-mono bg-muted px-1 rounded">TableCell</code>{" "}
                recebem{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  sticky left-0 z-10
                </code>{" "}
                com o bg correspondente ao tipo da linha, mantendo contraste no
                scroll horizontal.
              </p>
              <CodeBlock
                code={`<TableCell className={cn(
  "sticky left-0 z-10 transition-colors",
  CELL_BG[row.type]
)} />`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Números alinhados — tabular-nums</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Todos os valores usam{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  text-right tabular-nums
                </code>{" "}
                para alinhamento decimal consistente. Valores negativos recebem{" "}
                <code className="font-mono bg-muted px-1 rounded">text-red-600</code>.
              </p>
              <CodeBlock
                code={`<div className={cn(
  "text-right tabular-nums",
  VALUE_STYLE[row.type],
  v !== null && v < 0 && "text-red-600"
)}>
  {formatCurrency(v)}
</div>`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Premissas colapsáveis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Linhas{" "}
                <code className="font-mono bg-muted px-1 rounded">premise</code>{" "}
                ficam ocultas por padrão e são reveladas via:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>
                  Botão global <em>Exibir premissas</em> (
                  <code className="font-mono bg-muted px-1 rounded">Eye/EyeOff</code>)
                </li>
                <li>
                  Clique na linha pai com{" "}
                  <code className="font-mono bg-muted px-1 rounded">
                    hasChildPremise: true
                  </code>{" "}
                  — ícone{" "}
                  <code className="font-mono bg-muted px-1 rounded">Chevron</code>{" "}
                  no label
                </li>
              </ul>
              <CodeBlock code={codePremiseFilter} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Toggle de decimais</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                O{" "}
                <code className="font-mono bg-muted px-1 rounded">Switch</code>{" "}
                <em>Decimais</em> alterna entre{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  fractionDigits: 0
                </code>{" "}
                e{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  fractionDigits: 2
                </code>{" "}
                no formatter de moeda.
              </p>
              <CodeBlock
                code={`formatCurrency(v, {
  showSymbol: false,
  minimumFractionDigits: showDecimals ? 2 : 0,
  maximumFractionDigits: showDecimals ? 2 : 0,
})`}
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ─── Estrutura completa ─── */}
      <Section title="Snippet — Estrutura da Tabela">
        <CodeBlock code={codeTableSetup} />
      </Section>

      {/* ─── Acessibilidade ─── */}
      <Section title="Acessibilidade">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              O{" "}
              <code className="font-mono bg-muted px-1 rounded">Table</code>{" "}
              do shadcn/ui renderiza um{" "}
              <code className="font-mono bg-muted px-1 rounded">&lt;table&gt;</code>{" "}
              semântico com{" "}
              <code className="font-mono bg-muted px-1 rounded">thead</code>,{" "}
              <code className="font-mono bg-muted px-1 rounded">tbody</code> e
              cabeçalhos de coluna{" "}
              <code className="font-mono bg-muted px-1 rounded">th</code> — lido
              corretamente por leitores de tela.
            </p>
            <p>
              Linhas com{" "}
              <code className="font-mono bg-muted px-1 rounded">
                hasChildPremise
              </code>{" "}
              possuem interação de clique no label; adicione{" "}
              <code className="font-mono bg-muted px-1 rounded">role="button"</code>{" "}
              e{" "}
              <code className="font-mono bg-muted px-1 rounded">tabIndex={0}</code>{" "}
              no div interno para navegação por teclado completa.
            </p>
            <p>
              A combinação{" "}
              <code className="font-mono bg-muted px-1 rounded">
                text-red-600
              </code>{" "}
              para valores negativos e{" "}
              <code className="font-mono bg-muted px-1 rounded">
                text-muted-foreground
              </code>{" "}
              para secundários mantém contraste mínimo de 4.5:1 nos tokens de
              produção (WCAG 2.1 AA) em light e dark mode.
            </p>
            <p>
              O overflow horizontal é gerenciado com{" "}
              <code className="font-mono bg-muted px-1 rounded">
                overflow-x-auto
              </code>{" "}
              no container externo. A coluna sticky garante que o contexto da
              linha permaneça visível durante o scroll.
            </p>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
