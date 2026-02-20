---
type: doc
name: design-system
description: Design System completo com tokens, cores, tipografia, componentes e styleguide
category: architecture
generated: 2026-02-20
updated: 2026-02-20
status: filled
scaffoldVersion: "2.0.0"
---

# Design System

Documentação completa do Design System da aplicação SaaS Valuation, baseado em **shadcn/ui** com tokens CSS em espaço de cor **oklch**.

## Visao Geral

O Design System estabelece a identidade visual da plataforma SaaS Valuation com foco em profissionalismo financeiro, clareza de dados e acessibilidade. Todos os tokens visuais sao definidos via CSS custom properties em `src/app/globals.css` e mapeados para classes Tailwind via `@theme inline`.

### Design Summary

| Aspecto | Valor |
|---------|-------|
| **Cor primaria** | Navy Blue `oklch(0.45 0.097 238)` — ref `#003049` |
| **Fonte** | Inter (Google Fonts) |
| **Estilo** | Modern minimal — profissional financeiro |
| **Border radius** | `0.625rem` (10px) base, escala sm a 4xl |
| **Espaco de cor** | oklch (perceptualmente uniforme) |
| **Dark mode** | Via classe `.dark` (next-themes) |

## Arquitetura

### Stack de Styling

- **Tailwind CSS v4** — utility-first CSS framework
- **tailwindcss-animate** + **tw-animate-css** — animacoes
- **shadcn/ui** (style: new-york, base: neutral, CSS variables: yes)
- **next-themes** — gerenciamento de dark mode via classe `.dark`
- **Recharts 3.7** — graficos
- **Lucide React** — icones

### Estrutura de Arquivos

```
src/
  app/
    globals.css                        # TODOS os design tokens (oklch CSS vars, @theme inline)
    styleguide/
      navigation.ts                    # Config de navegacao da sidebar
      layout.tsx                       # Layout com sidebar fixa
      page.tsx                         # Showcase de tokens (cores, tipografia, radius, sombras, componentes)
      components/
        grafico-combinado/
          page.tsx                     # Showcase do componente GraficoCombinado
  styles/
    design-system/
      index.ts                         # Barrel export (reservado para expansao futura)
      components/                      # Reservado
      themes/                          # Reservado
      tokens/                          # Reservado
```

### Fluxo de Tokens

```
globals.css (:root / .dark)
  → Define CSS custom properties (--primary, --background, etc.)
  → @theme inline mapeia para Tailwind (--color-primary, --color-background)
    → Classes Tailwind (bg-primary, text-foreground, border-border)
      → Componentes shadcn/ui e componentes customizados
```

## Tokens de Cor

### Cor Primaria (Navy Blue, hue 238 — ref `#003049`)

Escala completa de 50 a 900, definida em oklch. A cor de referencia `#003049` ancora o step 800:

| Token | Light Mode | Dark Mode | Uso |
|-------|-----------|-----------|-----|
| `--primary-50` | `oklch(0.97 0.014 238)` | `oklch(0.21 0.050 238)` | Backgrounds sutis |
| `--primary-100` | `oklch(0.93 0.035 238)` | `oklch(0.27 0.063 238)` | Borders leves |
| `--primary-200` | `oklch(0.87 0.065 238)` | `oklch(0.33 0.075 238)` | Hover states |
| `--primary-300` | `oklch(0.78 0.098 238)` | `oklch(0.42 0.094 238)` | Accents |
| `--primary-400` | `oklch(0.67 0.132 238)` | `oklch(0.55 0.117 238)` | Focus rings |
| `--primary-500` | `oklch(0.55 0.117 238)` | `oklch(0.65 0.140 238)` | Texto secundario |
| `--primary-600` | `oklch(0.45 0.097 238)` | `oklch(0.75 0.130 238)` | **Brand color** (light) |
| `--primary-700` | `oklch(0.37 0.080 238)` | `oklch(0.82 0.095 238)` | Hover em brand |
| `--primary-800` | `oklch(0.294 0.066 238)` | `oklch(0.89 0.055 238)` | **#003049** — Accent foreground |
| `--primary-900` | `oklch(0.21 0.050 238)` | `oklch(0.95 0.025 238)` | Texto em backgrounds claros |

> Em dark mode, a escala se inverte: 50 e o mais escuro, 900 e o mais claro.

### Escala Neutral (Grey, chroma 0)

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--neutral-50` | `oklch(0.985 0 0)` | `oklch(0.17 0 0)` |
| `--neutral-100` | `oklch(0.97 0 0)` | `oklch(0.21 0 0)` |
| `--neutral-200` | `oklch(0.93 0 0)` | `oklch(0.27 0 0)` |
| `--neutral-300` | `oklch(0.87 0 0)` | `oklch(0.35 0 0)` |
| `--neutral-400` | `oklch(0.78 0 0)` | `oklch(0.45 0 0)` |
| `--neutral-500` | `oklch(0.64 0 0)` | `oklch(0.55 0 0)` |
| `--neutral-600` | `oklch(0.50 0 0)` | `oklch(0.65 0 0)` |
| `--neutral-700` | `oklch(0.38 0 0)` | `oklch(0.75 0 0)` |
| `--neutral-800` | `oklch(0.27 0 0)` | `oklch(0.85 0 0)` |
| `--neutral-900` | `oklch(0.17 0 0)` | `oklch(0.93 0 0)` |

### Escala Alternativa (Red, hue 24 — ref `#800016`)

Escala completa de 50 a 900, definida em oklch. A cor de referencia `#800016` ancora o step 800. Cores aproximadas: `#A0001C` (600), `#C00021` (500), `#FF002B` (400).

| Token | Light Mode | Dark Mode | Nota |
|-------|-----------|-----------|------|
| `--alt-50` | `oklch(0.97 0.013 24)` | `oklch(0.27 0.100 24)` | Backgrounds sutis |
| `--alt-100` | `oklch(0.93 0.033 24)` | `oklch(0.32 0.125 24)` | Borders leves |
| `--alt-200` | `oklch(0.87 0.067 24)` | `oklch(0.378 0.153 24)` | Hover states |
| `--alt-300` | `oklch(0.78 0.125 24)` | `oklch(0.45 0.180 24)` | Accents |
| `--alt-400` | `oklch(0.63 0.250 24)` | `oklch(0.55 0.210 24)` | ~#FF002B |
| `--alt-500` | `oklch(0.51 0.206 24)` | `oklch(0.65 0.215 24)` | ~#C00021 |
| `--alt-600` | `oklch(0.45 0.180 24)` | `oklch(0.75 0.148 24)` | ~#A0001C |
| `--alt-700` | `oklch(0.42 0.165 24)` | `oklch(0.82 0.100 24)` | |
| `--alt-800` | `oklch(0.378 0.153 24)` | `oklch(0.89 0.055 24)` | **#800016** ref |
| `--alt-900` | `oklch(0.27 0.100 24)` | `oklch(0.95 0.025 24)` | |

> Em dark mode, a escala se inverte: 50 e o mais escuro, 900 e o mais claro. Classes Tailwind: `bg-alt-500`, `text-alt-800`, etc.

### Tokens Base (Semanticos de Interface)

| Token | Light Mode | Dark Mode | Tailwind Class |
|-------|-----------|-----------|----------------|
| `--background` | `oklch(1 0 0)` (branco) | `oklch(0.145 0 0)` (quase preto) | `bg-background` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `text-foreground` |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `bg-card` |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `text-card-foreground` |
| `--primary` | `var(--primary-600)` | `var(--primary-500)` | `bg-primary` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | `text-primary-foreground` |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | `bg-secondary` |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | `bg-muted` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | `text-muted-foreground` |
| `--accent` | `oklch(0.95 0.03 238)` | `oklch(0.25 0.06 238)` | `bg-accent` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | `bg-destructive` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | `border-border` |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | `border-input` |
| `--ring` | `var(--primary-400)` | `var(--primary-400)` | `ring-ring` |

### Cores Semanticas

| Token | Light Mode | Dark Mode | Uso | Tailwind |
|-------|-----------|-----------|-----|----------|
| `--success` | `oklch(0.52 0.18 145)` | `oklch(0.60 0.18 145)` | Acoes concluidas, valores positivos | `bg-success` |
| `--success-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Texto em success | `text-success-foreground` |
| `--warning` | `oklch(0.75 0.18 65)` | `oklch(0.80 0.18 65)` | Alertas, atencao | `bg-warning` |
| `--warning-foreground` | `oklch(0.17 0 0)` | `oklch(0.17 0 0)` | Texto em warning | `text-warning-foreground` |
| `--info` | `oklch(0.55 0.18 220)` | `oklch(0.62 0.18 220)` | Informacoes, dicas | `bg-info` |
| `--info-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Texto em info | `text-info-foreground` |

### Cores de Graficos

| Token | Light Mode | Dark Mode | Cor |
|-------|-----------|-----------|-----|
| `--chart-1` | `oklch(0.45 0.097 238)` | `oklch(0.65 0.140 238)` | Navy Blue (primary) |
| `--chart-2` | `oklch(0.52 0.18 145)` | `oklch(0.60 0.18 145)` | Verde |
| `--chart-3` | `oklch(0.646 0.222 41)` | `oklch(0.75 0.20 65)` | Laranja |
| `--chart-4` | `oklch(0.75 0.18 65)` | `oklch(0.65 0.22 320)` | Amarelo / Pink |
| `--chart-5` | `oklch(0.60 0.19 320)` | `oklch(0.60 0.20 41)` | Magenta / Laranja |

> **Regra obrigatoria:** Todo componente de grafico deve usar exclusivamente `var(--token)` — tokens CSS definidos em `globals.css`. Valores literais de cor (hex, hsl inline, rgb, oklch inline) sao **proibidos**. Ver secao [Usar Cores em Graficos](#usar-cores-em-graficos) para o mapeamento completo e exemplos.

### Tokens de Sidebar

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-primary` | `var(--primary-600)` | `var(--primary-500)` |
| `--sidebar-accent` | `oklch(0.95 0.03 238)` | `oklch(0.25 0.06 238)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |

## Tipografia

### Fonte Principal

- **Font family:** Inter (Google Fonts)
- **Fallbacks:** `var(--font-sans)`, Inter, system-ui, sans-serif
- **Carregamento:** `next/font/google` com subset `latin`

### Escala Tipografica

| Elemento | Classe Tailwind | Tamanho | Peso |
|----------|----------------|---------|------|
| H1 | `text-4xl font-bold` | 2.25rem (36px) | 700 |
| H2 | `text-2xl font-bold` | 1.5rem (24px) | 700 |
| H3 | `text-xl font-semibold` | 1.25rem (20px) | 600 |
| H4 | `text-lg font-semibold` | 1.125rem (18px) | 600 |
| Body | `text-base` | 1rem (16px) | 400 |
| Small | `text-sm` | 0.875rem (14px) | 400 |
| Caption | `text-xs` | 0.75rem (12px) | 400 |
| Mono | `font-mono text-sm` | 0.875rem (14px) | 400 |

### Cores de Texto

| Uso | Token | Classe |
|-----|-------|--------|
| Texto principal | `--foreground` | `text-foreground` |
| Texto secundario | `--muted-foreground` | `text-muted-foreground` |
| Texto em card | `--card-foreground` | `text-card-foreground` |
| Texto primario (brand) | `--primary` | `text-primary` |

## Espacamento e Radius

### Border Radius

Base: `--radius: 0.625rem` (10px)

| Token | Calculo | Valor | Classe Tailwind |
|-------|---------|-------|-----------------|
| `--radius-sm` | `var(--radius) - 4px` | ~6px | `rounded-sm` |
| `--radius-md` | `var(--radius) - 2px` | ~8px | `rounded-md` |
| `--radius-lg` | `var(--radius)` | 10px | `rounded-lg` |
| `--radius-xl` | `var(--radius) + 4px` | ~14px | `rounded-xl` |
| `--radius-2xl` | `var(--radius) + 8px` | ~18px | `rounded-2xl` |
| `--radius-3xl` | `var(--radius) + 12px` | ~22px | `rounded-3xl` |
| `--radius-4xl` | `var(--radius) + 16px` | ~26px | `rounded-4xl` |
| full | — | 9999px | `rounded-full` |

### Sombras

Usa as sombras padrao do Tailwind CSS:

| Classe | Uso |
|--------|-----|
| `shadow-sm` | Elementos sutis (badges, tags) |
| `shadow` | Cards, dropdowns |
| `shadow-md` | Modais, popovers |
| `shadow-lg` | Elementos flutuantes |
| `shadow-xl` | Overlays proeminentes |

## Dark Mode

### Implementacao

Dark mode e controlado via classe `.dark` no `<html>`, gerenciado por `next-themes`:

```tsx
// layout.tsx
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### Estrategia de Inversao

- **Escalas de cor (primary, neutral):** Os steps 50-900 se invertem (50 vira escuro, 900 vira claro)
- **Tokens base:** `--background` e `--foreground` trocam de valor
- **Cards:** Fundo levemente mais claro que background (`oklch(0.205 0 0)`)
- **Borders:** Usam transparencia (`oklch(1 0 0 / 10%)`) para adaptabilidade
- **Cores semanticas:** Tons mais brilhantes em dark para manter legibilidade
- **Cores de graficos:** Ajustadas para melhor contraste em fundo escuro

### Ativacao no CSS

```css
@custom-variant dark (&:is(.dark *));
```

## Componentes UI

### Componentes Base (shadcn/ui)

23 componentes instalados em `src/components/ui/`:

| Componente | Uso Principal |
|------------|--------------|
| `button` | Acoes e CTAs |
| `card` | Containers de conteudo |
| `input` | Entrada de texto |
| `label` | Labels de formulario |
| `tabs` | Navegacao por abas |
| `dialog` | Modais |
| `form` | Formularios com validacao |
| `badge` | Tags e indicadores |
| `alert` | Mensagens de feedback |
| `radio-group` | Selecao unica |
| `tooltip` | Dicas contextuais |
| `popover` | Conteudo flutuante |
| `dropdown-menu` | Menus de opcoes |
| `sheet` | Paineis deslizantes |
| `sidebar` | Navegacao lateral |
| `separator` | Divisores visuais |
| `skeleton` | Loading states |
| `table` | Tabelas de dados |
| `textarea` | Texto multilinhas |
| `avatar` | Imagens de usuario |
| `breadcrumb` | Navegacao hierarquica |
| `collapsible` | Conteudo colapsavel |
| `financial-input` | Input monetario (custom) |

### Componentes Customizados

#### GraficoCombinado

Componente generico reutilizavel de grafico composto (Bar + Line + dois eixos Y + toggle switch).

**Arquivo:** `src/components/charts/GraficoCombinado.tsx`

**Props principais:**

| Prop | Tipo | Obrigatoria | Descricao |
|------|------|-------------|-----------|
| `data` | `GraficoCombinadoDado[]` | Sim | Array de dados |
| `xAxisKey` | `string` | Sim | Chave para eixo X |
| `barPrimaria` | `BarConfig` | Sim | Config da barra principal |
| `barSecundaria` | `BarConfig` | Nao | Habilita toggle switch |
| `linha` | `LinhaConfig` | Sim | Linha no eixo direito |
| `title` | `string` | Sim | Titulo do grafico |
| `leftAxisFormatter` | `(v: number) => string` | Nao | Formatador eixo Y esquerdo |
| `rightAxisFormatter` | `(v: number) => string` | Nao | Formatador eixo Y direito |
| `height` | `number` | Nao | Altura em px (padrao 400) |

**Uso basico:**
```tsx
<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{ dataKey: "imobilizado", name: "Imobilizado", color: "var(--chart-1)" }}
  linha={{ dataKey: "vendasImobilizado", name: "Vendas/Imobilizado", color: "var(--chart-3)" }}
  title="Investimentos"
  leftAxisFormatter={(v) => formatCompactNumber(v)}
  rightAxisFormatter={(v) => `${v.toFixed(1)}x`}
/>
```

**Com toggle (duas barras):**
```tsx
<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{ dataKey: "imobilizado", name: "Imobilizado", color: "var(--chart-1)" }}
  barSecundaria={{ dataKey: "vendas", name: "Vendas", color: "var(--chart-2)" }}
  linha={{ dataKey: "ratio", name: "Ratio", color: "var(--chart-3)" }}
  title="Investimentos vs Vendas"
  toggleLabelPrimaria="Imobilizado"
  toggleLabelSecundaria="Vendas"
/>
```

## Styleguide

### Acesso

O styleguide e acessivel em `/styleguide` e funciona como documentacao visual interativa do Design System.

### Navegacao

Definida em `src/app/styleguide/navigation.ts`:

```typescript
export const navigation: NavSection[] = [
  {
    title: "Foundation",
    items: [{ name: "Design Tokens", href: "/styleguide" }],
  },
  {
    title: "Components",
    items: [
      { name: "Grafico Combinado", href: "/styleguide/components/grafico-combinado" },
    ],
  },
];
```

### Layout

- **Sidebar fixa** (`w-64`, `h-screen`) com navegacao e link "Voltar ao Dashboard"
- **Area principal** com offset (`ml-64`) e scroll independente
- **Destaque de item ativo** via `bg-primary text-primary-foreground`

### Pagina de Tokens (`/styleguide`)

8 secoes interativas:

1. **Paleta de Cores** — Swatches com nomes de variavel CSS
2. **Cores Semanticas** — Success, Warning, Info, Destructive com alerts demo
3. **Cores de Graficos** — Chart 1-5
4. **Tipografia** — Headings H1-H4, body, muted, mono, formula WACC
5. **Border Radius** — Exemplos visuais de sm a full
6. **Sombras** — Exemplos de shadow-sm a shadow-xl
7. **Componentes** — Button (7 variantes), Badge (7 variantes), Card (3 exemplos), RadioGroup
8. **Design Summary** — Resumo do sistema visual

Inclui **toggle de dark mode** (botao Sun/Moon) para preview em tempo real.

### Pagina de Componente (`/styleguide/components/grafico-combinado`)

Showcase do componente `GraficoCombinado` com:
- 3 demos interativos (basico, com toggle, formatadores custom)
- Tabela de API com todas as 13 props documentadas
- Notas de acessibilidade (role="switch", WCAG 1.4.11)
- Snippets de codigo para cada padrao de uso

## Como Usar

### Usar Cores em Graficos

**Regra:** Todos os valores de cor em componentes de grafico — barras, linhas, areas, eixos, grids, tooltips e labels — **devem** usar `var(--token)`, referenciando tokens CSS definidos em `globals.css`. Valores literais de cor (hex, hsl, rgb, oklch inline) sao proibidos.

#### Mapeamento obrigatorio de tokens para graficos

| Uso | Token |
|-----|-------|
| Serie principal (barra/linha primaria) | `var(--chart-1)` |
| Serie verde / valores positivos | `var(--chart-2)` |
| Serie laranja | `var(--chart-3)` |
| Serie amarela | `var(--chart-4)` |
| Serie magenta | `var(--chart-5)` |
| Valores negativos / erro | `var(--destructive)` |
| Barra navy principal (azul-escuro) | `var(--primary-800)` |
| Serie azul medio (barra secundaria) | `var(--primary-400)` |
| Linha/serie neutra (indicadores) | `var(--neutral-400)` |
| Serie vermelho vivo | `var(--alt-500)` |
| Serie vermelho escuro | `var(--alt-800)` |
| Texto de eixos (`tick.fill`) | `var(--foreground)` |
| Grade do grafico (`CartesianGrid`) | classe Tailwind `stroke-muted` |
| Fundo do tooltip | `var(--background)` |
| Borda do tooltip | `var(--border)` |
| Labels sobre barras coloridas | `var(--primary-foreground)` |

#### Exemplo correto

```tsx
// Barras e linhas
<Bar fill="var(--chart-1)" />
<Line stroke="var(--chart-2)" dot={{ fill: "var(--chart-2)" }} />

// Eixos
<XAxis tick={{ fill: "var(--foreground)" }} />
<YAxis tick={{ fill: "var(--foreground)" }} />

// Grid
<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

// Label sobre barra colorida
<LabelList style={{ fill: "var(--primary-foreground)", fontSize: 13 }} />

// Tooltip
<div className="rounded-lg border bg-background p-3 shadow-md">...</div>
```

#### Anti-patterns proibidos

```tsx
// ❌ Valor hex literal
<Bar fill="#003049" />

// ❌ HSL inline
<Line stroke="hsl(142.1 76.2% 36.3%)" />

// ❌ Wrapper hsl() desnecessario — tokens ja sao oklch, nao hsl
<XAxis tick={{ fill: "hsl(var(--foreground))" }} />

// ❌ Branco literal em labels
<LabelList style={{ fill: "#ffffff" }} />
```

> **Nota sobre espacos de cor:** Os tokens do design system sao definidos em **oklch**. Nao use o wrapper `hsl()` — `hsl(var(--token))` esta incorreto porque o valor da variavel ja e oklch. Use sempre `var(--token)` diretamente.

---

### Usar Tokens em Componentes

```tsx
// Via classes Tailwind (preferido)
<div className="bg-primary text-primary-foreground rounded-lg p-4">
  Conteudo com cor primaria
</div>

// Via CSS variables (quando necessario)
<div style={{ color: "var(--success)" }}>
  Texto verde de sucesso
</div>
```

### Usar Cores Semanticas em Badges

```tsx
// Variantes padrao do shadcn
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Erro</Badge>

// Variantes customizadas via className
<Badge className="bg-success text-success-foreground">Sucesso</Badge>
<Badge className="bg-warning text-warning-foreground">Atencao</Badge>
<Badge className="bg-info text-info-foreground">Info</Badge>
```

### Adicionar Novo Componente ao Styleguide

1. Criar pagina em `src/app/styleguide/components/[nome]/page.tsx`
2. Adicionar entrada em `src/app/styleguide/navigation.ts`:
   ```typescript
   { name: "Nome do Componente", href: "/styleguide/components/nome" }
   ```
3. Documentar: variantes, props, exemplos de codigo, notas de acessibilidade

### Adicionar Nova Cor Semantica

1. Adicionar variavel em `:root` e `.dark` no `globals.css`
2. Mapear no bloco `@theme inline`:
   ```css
   --color-nova-cor: var(--nova-cor);
   --color-nova-cor-foreground: var(--nova-cor-foreground);
   ```
3. Usar via Tailwind: `bg-nova-cor text-nova-cor-foreground`

## Configuracao Tailwind

O `tailwind.config.ts` e **minimalista** para Tailwind v4. O mapeamento de cores e feito inteiramente via `@theme inline` no `globals.css`:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-success: var(--success);
  /* ... todos os tokens */
}
```

Isso permite que classes como `bg-primary`, `text-success`, `border-border` funcionem automaticamente.

## Decisoes de Arquitetura

### oklch em vez de hsl

- **Perceptualmente uniforme**: mudancas iguais no valor de lightness produzem mudancas visuais iguais
- **Melhor contraste**: facilita garantir WCAG AA (4.5:1 para texto)
- **Escalas mais harmoniosas**: gerar escalas 50-900 com chroma e hue fixos resulta em paletas mais naturais
- **Suporte**: oklch tem suporte em todos os navegadores modernos

### CSS Variables via @theme inline

- Evita duplicacao de definicoes entre `globals.css` e `tailwind.config.ts`
- Permite que o Tailwind v4 resolva tokens nativamente
- Mantem `tailwind.config.ts` limpo (apenas fontFamily)

### Inversao de Escalas em Dark Mode

- Steps 50-900 se invertem para que `primary-50` sempre seja "o tom mais sutil" no contexto atual
- Simplifica o uso: nao e necessario pensar em qual step usar para light vs dark

## Acessibilidade

### Contraste de Cores

- **Texto principal** (`--foreground`): ratio > 15:1 em ambos os temas
- **Texto muted** (`--muted-foreground`): ratio > 4.5:1 (WCAG AA)
- **Primary em branco**: ratio validado para WCAG AA
- **Cores semanticas**: foreground ajustado para contraste adequado (branco em success/info, escuro em warning)

### Praticas Seguidas

- Todos os componentes shadcn seguem padroes WAI-ARIA
- Focus rings visiveis em todos os elementos interativos (`--ring`)
- Suporte completo a navegacao por teclado
- `prefers-reduced-motion` respeitado pelo tailwindcss-animate

## Recursos Relacionados

- [Architecture Notes](./architecture.md) — Secao de Design System
- [UI Components](./qa/components-ui.md) — Documentacao completa de componentes
- [Project Overview](./project-overview.md) — Visao geral do projeto
- [Styleguide Live](/styleguide) — Documentacao visual interativa
- [shadcn/ui](https://ui.shadcn.com) — Biblioteca de componentes base
- [Lucide Icons](https://lucide.dev) — Biblioteca de icones
