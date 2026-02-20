"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Moon, Sun, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

/* ─── helpers ─── */

function ColorSwatch({
  label,
  variable,
  textColor = "text-foreground",
}: {
  label: string;
  variable: string;
  textColor?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-14 w-full rounded-md border border-border"
        style={{ background: `var(${variable})` }}
      />
      <p className={`text-xs font-medium ${textColor}`}>{label}</p>
      <p className="text-xs text-muted-foreground font-mono">{variable}</p>
    </div>
  );
}

function ScaleRow({
  name,
  prefix,
  steps,
}: {
  name: string;
  prefix: string;
  steps: number[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 text-foreground">{name}</h4>
      <div className="grid grid-cols-10 gap-2">
        {steps.map((step) => (
          <div key={step} className="flex flex-col gap-1">
            <div
              className="h-10 rounded-md border border-border"
              style={{ background: `var(--${prefix}-${step})` }}
            />
            <p className="text-xs text-muted-foreground text-center">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 border-b last:border-b-0">
      <h2 className="text-2xl font-bold mb-8 text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/* ─── page ─── */

export default function StyleguidePage() {
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  return (
    <div className="p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Design Tokens</h1>
          <p className="text-muted-foreground mt-2">
            Paleta de cores, tipografia, espaçamento e componentes da plataforma SaaS Valuation.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={toggleDark}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* ─── 1. Color Palette ─── */}
      <Section title="Paleta de Cores">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <ColorSwatch label="Background" variable="--background" />
          <ColorSwatch label="Foreground" variable="--foreground" />
          <ColorSwatch label="Card" variable="--card" />
          <ColorSwatch label="Primary" variable="--primary" />
          <ColorSwatch label="Secondary" variable="--secondary" />
          <ColorSwatch label="Muted" variable="--muted" />
          <ColorSwatch label="Accent" variable="--accent" />
          <ColorSwatch label="Destructive" variable="--destructive" />
          <ColorSwatch label="Border" variable="--border" />
        </div>

        {/* Primary Scale */}
        <div className="flex flex-col gap-6">
          <ScaleRow name="Escala Primary (Indigo)" prefix="primary" steps={colorSteps} />
          <ScaleRow name="Escala Neutral (Grey)" prefix="neutral" steps={colorSteps} />
        </div>
      </Section>

      {/* ─── 2. Semantic Colors ─── */}
      <Section title="Cores Semânticas">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <ColorSwatch label="Success" variable="--success" />
          <ColorSwatch label="Warning" variable="--warning" />
          <ColorSwatch label="Info" variable="--info" />
          <ColorSwatch label="Destructive" variable="--destructive" />
        </div>
        <div className="flex flex-col gap-3">
          <Alert>
            <CheckCircle2 className="h-4 w-4" style={{ color: "var(--success)" }} />
            <AlertTitle style={{ color: "var(--success)" }}>Sucesso</AlertTitle>
            <AlertDescription>Operação realizada com sucesso.</AlertDescription>
          </Alert>
          <Alert>
            <AlertTriangle className="h-4 w-4" style={{ color: "var(--warning)" }} />
            <AlertTitle style={{ color: "var(--warning)" }}>Atenção</AlertTitle>
            <AlertDescription>Verifique os dados antes de continuar.</AlertDescription>
          </Alert>
          <Alert>
            <Info className="h-4 w-4" style={{ color: "var(--info)" }} />
            <AlertTitle style={{ color: "var(--info)" }}>Informação</AlertTitle>
            <AlertDescription>Esta ação não pode ser desfeita.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>Não foi possível completar a operação.</AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* ─── 3. Chart Colors ─── */}
      <Section title="Cores de Gráficos">
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <ColorSwatch key={n} label={`Chart ${n}`} variable={`--chart-${n}`} />
          ))}
        </div>
      </Section>

      {/* ─── 4. Typography ─── */}
      <Section title="Tipografia">
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground mb-1 font-mono">font-sans / Inter</p>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">Heading 1 — Avaliação de Empresa</h1>
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-3">Heading 2 — Fluxo de Caixa</h2>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-3">Heading 3 — Projeções Financeiras</h3>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-3">Heading 4 — Premissas do Modelo</h4>
            <p className="leading-7 mt-4 text-foreground">
              Corpo do texto — A análise de valuation é essencial para determinar o valor justo de uma empresa. O método de Fluxo de Caixa Descontado (FCD) é amplamente utilizado por analistas financeiros.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Texto pequeno / muted — Dados referentes ao exercício fiscal de 2024.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground mb-2 font-mono">font-mono</p>
            <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
              EBITDA = Receita - Custos - Despesas + D&A
            </code>
            <pre className="font-mono text-sm bg-muted rounded p-4 mt-3 overflow-x-auto">
{`const wacc = (ke * e) / (e + d) + (kd * d * (1 - t)) / (e + d);
const terminalValue = fcff[n] * (1 + g) / (wacc - g);`}
            </pre>
          </div>
        </div>
      </Section>

      {/* ─── 5. Border Radius ─── */}
      <Section title="Border Radius">
        <div className="flex flex-wrap gap-6 items-end">
          {[
            { label: "radius-sm", css: "calc(var(--radius) - 4px)", approx: "6px" },
            { label: "radius-md", css: "calc(var(--radius) - 2px)", approx: "8px" },
            { label: "radius-lg (base)", css: "var(--radius)", approx: "10px" },
            { label: "radius-xl", css: "calc(var(--radius) + 4px)", approx: "14px" },
            { label: "radius-2xl", css: "calc(var(--radius) + 8px)", approx: "18px" },
            { label: "radius-3xl", css: "calc(var(--radius) + 12px)", approx: "22px" },
            { label: "full", css: "9999px", approx: "pill" },
          ].map(({ label, css, approx }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 bg-primary opacity-80 border border-border"
                style={{ borderRadius: css }}
              />
              <p className="text-xs font-mono text-center text-muted-foreground">
                {label}
                <br />
                <span className="text-foreground font-medium">{approx}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 6. Shadows ─── */}
      <Section title="Sombras">
        <div className="flex flex-wrap gap-6">
          {[
            { label: "shadow-sm", class: "shadow-sm" },
            { label: "shadow", class: "shadow" },
            { label: "shadow-md", class: "shadow-md" },
            { label: "shadow-lg", class: "shadow-lg" },
            { label: "shadow-xl", class: "shadow-xl" },
          ].map(({ label, class: cls }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div
                className={`w-24 h-16 bg-card rounded-lg ${cls}`}
              />
              <p className="text-xs font-mono text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 7. Components ─── */}
      <Section title="Componentes">
        {/* Buttons */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-foreground">Button</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-foreground">Badge</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge style={{ background: "var(--success)", color: "var(--success-foreground)" }}>
              Success
            </Badge>
            <Badge style={{ background: "var(--warning)", color: "var(--warning-foreground)" }}>
              Warning
            </Badge>
            <Badge style={{ background: "var(--info)", color: "var(--info-foreground)" }}>
              Info
            </Badge>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-foreground">Card</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">R$ 4.2M</p>
                <p className="text-xs text-muted-foreground mt-1">+12% vs ano anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">EBITDA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">R$ 1.8M</p>
                <p className="text-xs text-muted-foreground mt-1">Margem: 42.8%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Valuation (FCD)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">R$ 18.5M</p>
                <p className="text-xs text-muted-foreground mt-1">EV/EBITDA: 10.3x</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Radio Group */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-foreground">Radio Group</h3>
          <RadioGroup defaultValue="dcf" className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dcf" id="dcf" />
              <Label htmlFor="dcf">Fluxo de Caixa Descontado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiples" id="multiples" />
              <Label htmlFor="multiples">Múltiplos de Mercado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="book" id="book" />
              <Label htmlFor="book">Valor Patrimonial</Label>
            </div>
          </RadioGroup>
        </div>
      </Section>

      {/* ─── 8. Design Summary ─── */}
      <Section title="Design Summary">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Primary color", value: "Indigo — oklch(0.488 0.243 264)" },
            { label: "Font", value: "Inter (Google Fonts)" },
            { label: "Style", value: "Modern minimal — profissional financeiro" },
            { label: "Border radius", value: "0.625rem (10px) — Rounded" },
            { label: "Color space", value: "oklch (perceptualmente uniforme)" },
            { label: "Dark mode", value: "Via classe .dark (next-themes)" },
          ].map(({ label, value }) => (
            <Card key={label} className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold mt-1 font-mono">{value}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
