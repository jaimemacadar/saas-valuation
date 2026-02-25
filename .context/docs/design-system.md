---
type: doc
name: design-system
description: Design System completo com tokens, cores, tipografia, componentes e styleguide
category: architecture
generated: 2026-02-20
updated: 2026-02-24
status: filled
scaffoldVersion: "2.0.0"
---

# Design System

Documentação completa do Design System da aplicação SaaS Valuation, baseado em **shadcn/ui** com tokens CSS em espaço de cor **oklch**.

## Consulta Rapida — Styleguide Interativo

> **Antes de criar qualquer componente visual**, acesse o styleguide em **`/styleguide`** para conferir tokens, cores, tipografia, radius e sombras ao vivo com suporte a dark mode toggle.
>
> | Pagina | URL | Conteudo |
> |--------|-----|----------|
> | Design Tokens | `/styleguide` | Paleta completa, tipografia, radius, sombras, componentes base |
> | Grafico Combinado | `/styleguide/components/grafico-combinado` | Bar + Line + toggle, props, tokens de cor por contexto |
> | Tabelas Financeiras | `/styleguide/components/tabelas` | 6 RowTypes, tokens de background, premissas colapsaveis |
>
> Este documento (`design-system.md`) e a especificacao escrita — o styleguide e a referencia visual interativa.

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
| `--primary-50` | `oklch(0.97 0.014 238)` | `oklch(0.95 0.03 238)` | Backgrounds sutis |
| `--primary-100` | `oklch(0.93 0.035 238)` | `oklch(0.90 0.05 238)` | Borders leves |
| `--primary-200` | `oklch(0.87 0.065 238)` | `oklch(0.85 0.08 238)` | Hover states |
| `--primary-300` | `oklch(0.78 0.098 238)` | `oklch(0.80 0.10 238)` | Accents |
| `--primary-400` | `oklch(0.67 0.132 238)` | `oklch(0.75 0.12 238)` | Focus rings |
| `--primary-500` | `oklch(0.55 0.117 238)` | `oklch(0.70 0.13 238)` | Texto secundario |
| `--primary-600` | `oklch(0.45 0.097 238)` | `oklch(0.65 0.13 238)` | **Brand color** (light) |
| `--primary-700` | `oklch(0.37 0.080 238)` | `oklch(0.60 0.12 238)` | Hover em brand |
| `--primary-800` | `oklch(0.294 0.066 238)` | `oklch(0.55 0.117 238)` | **#003049** — âncora dark |
| `--primary-900` | `oklch(0.21 0.050 238)` | `oklch(0.45 0.097 238)` | Texto em backgrounds claros |

> Em dark mode, a escala e ancorada em `primary-800 = oklch(0.55 0.117 238)` (= primary-500 light). Os demais steps sao distribuidos com ΔL=0.05 por step (de primary-50 L=0.95 ate primary-800 L=0.55) e chroma em arco suave que peaks em primary-500/600 (C=0.13), garantindo diferenciacao perceptual em toda a escala.

### Escala Neutral (Grey, chroma 0)

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--neutral-50` | `oklch(0.985 0 0)` | `oklch(0.97 0 0)` |
| `--neutral-100` | `oklch(0.97 0 0)` | `oklch(0.93 0 0)` |
| `--neutral-200` | `oklch(0.93 0 0)` | `oklch(0.89 0 0)` |
| `--neutral-300` | `oklch(0.87 0 0)` | `oklch(0.85 0 0)` |
| `--neutral-400` | `oklch(0.78 0 0)` | `oklch(0.80 0 0)` |
| `--neutral-500` | `oklch(0.64 0 0)` | `oklch(0.76 0 0)` |
| `--neutral-600` | `oklch(0.50 0 0)` | `oklch(0.72 0 0)` |
| `--neutral-700` | `oklch(0.38 0 0)` | `oklch(0.68 0 0)` |
| `--neutral-800` | `oklch(0.27 0 0)` | `oklch(0.64 0 0)` |
| `--neutral-900` | `oklch(0.17 0 0)` | `oklch(0.50 0 0)` |

> Em dark mode, a escala e ancorada em `neutral-800 = oklch(0.64 0 0)` (= neutral-500 light). Os demais steps sao distribuidos com ΔL≈0.04 por step (de neutral-50 L=0.97 ate neutral-800 L=0.64), com C=0 em toda a escala, garantindo diferenciacao perceptual uniforme entre todos os graus de cinza.

### Escala Alternativa (Red, hue 24 — ref `#800016`)

Escala completa de 50 a 900, definida em oklch. A cor de referencia `#800016` ancora o step 800. Cores aproximadas: `#A0001C` (600), `#C00021` (500), `#FF002B` (400).

| Token | Light Mode | Dark Mode | Nota |
|-------|-----------|-----------|------|
| `--alt-50` | `oklch(0.97 0.013 24)` | `oklch(0.95 0.04 24)` | Backgrounds sutis |
| `--alt-100` | `oklch(0.93 0.033 24)` | `oklch(0.90 0.07 24)` | Borders leves |
| `--alt-200` | `oklch(0.87 0.067 24)` | `oklch(0.84 0.11 24)` | Hover states |
| `--alt-300` | `oklch(0.78 0.125 24)` | `oklch(0.78 0.15 24)` | Accents |
| `--alt-400` | `oklch(0.63 0.250 24)` | `oklch(0.73 0.19 24)` | ~#FF002B |
| `--alt-500` | `oklch(0.51 0.206 24)` | `oklch(0.67 0.21 24)` | ~#C00021 |
| `--alt-600` | `oklch(0.45 0.180 24)` | `oklch(0.62 0.22 24)` | ~#A0001C |
| `--alt-700` | `oklch(0.42 0.165 24)` | `oklch(0.57 0.22 24)` | |
| `--alt-800` | `oklch(0.378 0.153 24)` | `oklch(0.51 0.206 24)` | **#800016** ref — âncora dark |
| `--alt-900` | `oklch(0.27 0.100 24)` | `oklch(0.45 0.18 24)` | |

> Em dark mode, a escala e ancorada em `alt-800 = oklch(0.51 0.206 24)` (= alt-500 light). Os demais steps sao distribuidos com ΔL≈0.055 por step (de alt-50 L=0.95 ate alt-800 L=0.51) e chroma em arco suave que peaks em alt-600/700 (C=0.22), garantindo diferenciacao perceptual em toda a escala. Classes Tailwind: `bg-alt-500`, `text-alt-800`, etc.

### Escala Amber (Golden Yellow, hue 65 — ref `≈ #f59e0b` em 500)

Escala completa de 50 a 900, definida em oklch. A cor de referencia `#f59e0b` ancora o step 500 (light). Classes Tailwind: `bg-amber-500`, `text-amber-800`, etc.

| Token | Light Mode | Dark Mode | Nota |
|-------|-----------|-----------|------|
| `--amber-50` | `oklch(0.98 0.02 65)` | `oklch(0.97 0.04 65)` | Backgrounds sutis |
| `--amber-100` | `oklch(0.96 0.05 65)` | `oklch(0.94 0.07 65)` | Borders leves |
| `--amber-200` | `oklch(0.93 0.09 65)` | `oklch(0.91 0.10 65)` | Hover states |
| `--amber-300` | `oklch(0.88 0.14 65)` | `oklch(0.88 0.13 65)` | Accents |
| `--amber-400` | `oklch(0.82 0.18 65)` | `oklch(0.85 0.16 65)` | Focus rings |
| `--amber-500` | `oklch(0.75 0.18 65)` | `oklch(0.82 0.18 65)` | **Cor âncora light** (~#f59e0b) |
| `--amber-600` | `oklch(0.65 0.17 65)` | `oklch(0.79 0.18 65)` | Texto secundario |
| `--amber-700` | `oklch(0.55 0.15 65)` | `oklch(0.77 0.18 65)` | |
| `--amber-800` | `oklch(0.44 0.12 65)` | `oklch(0.75 0.18 65)` | **âncora dark** (= amber-500 light) |
| `--amber-900` | `oklch(0.33 0.09 65)` | `oklch(0.65 0.17 65)` | = amber-600 light |

> Em dark mode, a escala e ancorada em `amber-800 = oklch(0.75 0.18 65)` (= amber-500 light). Os demais steps sao distribuidos com ΔL≈0.031 por step (de amber-50 L=0.97 ate amber-800 L=0.75) e chroma em arco suave que peaks em amber-500/600 (C=0.18), garantindo diferenciacao perceptual em toda a escala. O hue 65 posiciona o amber entre o amarelo (hue ~95) e o laranja (hue ~40), coincidindo com os tokens `--warning` e `--chart-4`.

### Paleta Alternativa (Tokens Semanticos)

Tokens semanticos de alto nivel para a cor alternativa, espelhando a estrutura da paleta Primary. Definidos em `globals.css` nos blocos `:root` e `.dark`.

| Token                        | Light Mode                    | Dark Mode                     | Tailwind Class                  | Descricao                             |
| ---------------------------- | ----------------------------- | ----------------------------- | ------------------------------- | ------------------------------------- |
| `--alt`                      | `var(--alt-600)`              | `var(--alt-500)`              | `bg-alt`                        | Cor principal alternativa (brand alt) |
| `--alt-foreground`           | `oklch(0.985 0 0)`            | `oklch(0.985 0 0)`            | `text-alt-foreground`           | Texto sobre fundo alt                 |
| `--secondary-alt`            | `var(--secondary)`            | `var(--secondary)`            | `bg-secondary-alt`              | Fundo neutro que acompanha alt        |
| `--secondary-alt-foreground` | `var(--secondary-foreground)` | `var(--secondary-foreground)` | `text-secondary-alt-foreground` | Texto em secondary-alt                |
| `--muted-alt`                | `var(--muted)`                | `oklch(0.23 0 0)`             | `bg-muted-alt`                  | Fundo muted que acompanha alt         |
| `--muted-alt-foreground`     | `var(--muted-foreground)`     | `var(--muted-foreground)`     | `text-muted-alt-foreground`     | Texto em muted-alt                    |

> `--secondary-alt` e `--muted-alt` referenciam os mesmos valores neutros de `--secondary` e `--muted`, estabelecendo a paleta de suporte que acompanha a cor alternativa — o mesmo padrao da paleta Primary.

### Paleta Amber (Tokens Semanticos)

Tokens semanticos de alto nivel para a cor amber, espelhando a estrutura das paletas Primary e Alt. Definidos em `globals.css` nos blocos `:root` e `.dark`. O foreground e sempre texto escuro (`oklch(0.17 0 0)`) pois amber-500 e uma cor clara/brilhante que nao suporta texto branco com contraste adequado.

| Token                           | Light Mode                    | Dark Mode                     | Tailwind Class                   | Descricao                              |
| ------------------------------- | ----------------------------- | ----------------------------- | -------------------------------- | -------------------------------------- |
| `--amber`                       | `var(--amber-500)`            | `var(--amber-500)`            | `bg-amber`                       | Cor principal amber (brand amber)      |
| `--amber-foreground`            | `oklch(0.17 0 0)`             | `oklch(0.17 0 0)`             | `text-amber-foreground`          | Texto sobre fundo amber (sempre escuro)|
| `--secondary-amber`             | `var(--secondary)`            | `var(--secondary)`            | `bg-secondary-amber`             | Fundo neutro que acompanha amber       |
| `--secondary-amber-foreground`  | `var(--secondary-foreground)` | `var(--secondary-foreground)` | `text-secondary-amber-foreground`| Texto em secondary-amber               |
| `--muted-amber`                 | `var(--muted)`                | `oklch(0.24 0 0)`             | `bg-muted-amber`                 | Fundo muted que acompanha amber        |
| `--muted-amber-foreground`      | `var(--muted-foreground)`     | `var(--muted-foreground)`     | `text-muted-amber-foreground`    | Texto em muted-amber                   |

> `--amber-foreground` usa texto escuro em ambos os modos porque `--amber` (= amber-500) possui lightness elevada (L=0.75 light / L=0.82 dark), tornando texto branco insuficiente para contraste WCAG AA. O padrao e identico ao `--warning-foreground`. `--secondary-amber` e `--muted-amber` referenciam os mesmos valores neutros de `--secondary` e `--muted`, igual ao padrao das paletas Primary e Alt.

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

### Estrategia de Escalas em Dark Mode

As escalas de cor mantêm **ordem crescente** em dark mode (50 = mais claro, 900 = mais escuro), igual ao light mode. Cada escala e ancorada no step 800 e distribuida com ΔL uniforme para garantir diferenciacao perceptual em todos os steps:

| Escala | Âncora (dark-800) | Origem da âncora | Range dark (50→800) | ΔL/step |
|--------|-------------------|------------------|---------------------|---------|
| Primary (hue 238) | `oklch(0.55 0.117 238)` | = primary-500 light | L 0.95 → 0.55 | 0.05 |
| Neutral (C=0) | `oklch(0.64 0 0)` | = neutral-500 light | L 0.97 → 0.64 | ≈0.04 |
| Alt (hue 24) | `oklch(0.51 0.206 24)` | = alt-500 light | L 0.95 → 0.51 | ≈0.055 |
| Amber (hue 65) | `oklch(0.75 0.18 65)` | = amber-500 light | L 0.97 → 0.75 | ≈0.031 |

- **Chroma (escalas cromáticas):** segue arco suave — sobe gradualmente dos steps claros, atinge peak em torno de 600/700, e reduz levemente em 900
- **Tokens base:** `--background` e `--foreground` trocam de valor
- **Cards:** Fundo levemente mais claro que background (`oklch(0.205 0 0)`)
- **Borders:** Usam transparência (`oklch(1 0 0 / 10%)`) para adaptabilidade
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

Componente generico reutilizavel de grafico composto (Bar + Line + dois eixos Y + toggle switch opcional).

**Arquivo:** `src/components/charts/GraficoCombinado.tsx`

**Tipos exportados:**

```typescript
export interface BarConfig {
  dataKey: string;   // Chave do campo nos dados
  name: string;      // Nome exibido na legenda
  color: string;     // Cor da barra — use sempre var(--token), ex: "var(--chart-1)"
}

export interface LinhaConfig {
  dataKey: string;   // Chave do campo nos dados
  name: string;      // Nome exibido na legenda
  color: string;     // Cor da linha — use sempre var(--token)
  valueFormatter?: (value: number) => string; // Formatador no tooltip (padrao: v.toFixed(2)+"x")
}

// Ponto de dado generico — deve conter xAxisKey e todos os dataKeys configurados
export type GraficoCombinadoDado = Record<string, number | string | null>;
```

**Todas as props (`GraficoCombinadoProps`):**

| Prop | Tipo | Obrigatoria | Padrao | Descricao |
|------|------|-------------|--------|-----------|
| `data` | `GraficoCombinadoDado[]` | Sim | — | Array de dados do grafico |
| `xAxisKey` | `string` | Sim | — | Chave do eixo X (ex: `"ano"`) |
| `barPrimaria` | `BarConfig` | Sim | — | Barra sempre visivel (ou quando toggle=off) |
| `barSecundaria` | `BarConfig` | Nao | `undefined` | Barra alternativa — ativa o toggle switch quando fornecida |
| `linha` | `LinhaConfig` | Sim | — | Linha indicadora no eixo Y direito |
| `title` | `string` | Sim | — | Titulo do grafico |
| `description` | `string` | Nao | `undefined` | Subtitulo / descricao abaixo do titulo |
| `labelAnoBase` | `string` | Nao | `undefined` | Texto destacado apos a descricao (ex: `"Ano Base: 2,5x"`) |
| `toggleLabelPrimaria` | `string` | Nao | `barPrimaria.name` | Rotulo esquerdo do toggle switch |
| `toggleLabelSecundaria` | `string` | Nao | `barSecundaria.name` | Rotulo direito do toggle switch |
| `leftAxisFormatter` | `(v: number) => string` | Nao | `formatCompactNumber` | Formatador do eixo Y esquerdo (barras) |
| `rightAxisFormatter` | `(v: number) => string` | Nao | `v.toFixed(1)+"x"` | Formatador do eixo Y direito (linha) |
| `height` | `number` | Nao | `400` | Altura do grafico em px |

**Comportamento do toggle:**
- O switch so e exibido quando `barSecundaria` e fornecida
- Estado inicial: `false` → exibe `barPrimaria`; estado ativo: `true` → exibe `barSecundaria`
- A linha e sempre exibida independente do toggle
- Acessivel: `role="switch"`, `aria-checked`, navegavel por teclado
- Estilos: `bg-primary` (ativo) / `bg-input` (inativo)

**Tooltip:** Fundo `bg-card`; barras formatadas com `formatCurrency`; linha formatada com `linha.valueFormatter ?? v.toFixed(2)+"x"`.

**Tokens de Cor Recomendados:**

| Prop | Contexto | Token |
|------|----------|-------|
| `barPrimaria.color` | Balanco — Investimentos / Capital de Giro | `var(--primary-800)` |
| `barSecundaria.color` | Balanco — Vendas / NCG (toggle) | `var(--primary-500)` |
| `barPrimaria.color` | Balanco — Emprestimos LP | `var(--alt-800)` |
| `barSecundaria.color` | Balanco — Emprestimos CP (toggle) | `var(--alt-500)` |
| `barPrimaria.color` | DRE — Receita / Area | `var(--primary)` |
| `barPrimaria.color` | DRE — EBITDA / Lucro Liquido | `var(--chart-2)` |
| `linha.color` | Todos os contextos (indicador ratio) | `var(--neutral-400)` |

> Nao use `chart-1`, `chart-2`, `chart-3` genéricos — prefira os tokens semanticos acima alinhados ao contexto do grafico.

**Uso basico (sem toggle) — Investimentos:**
```tsx
<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{ dataKey: "imobilizado", name: "Imobilizado", color: "var(--primary-800)" }}
  linha={{ dataKey: "vendasImobilizado", name: "Vendas/Imobilizado", color: "var(--neutral-400)" }}
  title="Investimentos"
  description="Evolucao do imobilizado e eficiencia de ativos"
  labelAnoBase="Ano Base: 2,5x"
  leftAxisFormatter={(v) => formatCompactNumber(v)}
  rightAxisFormatter={(v) => `${v.toFixed(1)}x`}
/>
```

**Com toggle (duas barras alternativas) — Capital de Giro:**
```tsx
<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{ dataKey: "capitalDeGiro", name: "Capital de Giro", color: "var(--primary-800)" }}
  barSecundaria={{ dataKey: "ncg", name: "NCG", color: "var(--primary-500)" }}
  linha={{ dataKey: "vendasCG", name: "Vendas/Cap. Giro", color: "var(--neutral-400)" }}
  title="Capital de Giro"
  toggleLabelPrimaria="Capital de Giro"
  toggleLabelSecundaria="NCG"
/>
```

**Com `valueFormatter` customizado — Alavancagem (Emprestimos):**
```tsx
<GraficoCombinado
  data={dados}
  xAxisKey="ano"
  barPrimaria={{ dataKey: "emprestimosLP", name: "Divida LP", color: "var(--alt-800)" }}
  barSecundaria={{ dataKey: "emprestimosCP", name: "Divida CP", color: "var(--alt-500)" }}
  linha={{
    dataKey: "emprestimosEbitda",
    name: "Divida/EBITDA",
    color: "var(--neutral-400)",
    valueFormatter: (v) => `${v.toFixed(1)}x`,
  }}
  title="Alavancagem"
  rightAxisFormatter={(v) => `${v.toFixed(1)}x`}
/>
```

#### Tabelas Financeiras

Sistema de tabelas para exibicao de dados financeiros projetados por ano. Construido sobre o `table` do shadcn/ui com 6 tipos semanticos de linha, tokens de background customizados e suporte a premissas colapsaveis.

**Arquivos principais:**
- `src/components/tables/InvestmentTable.tsx` — Imobilizado / Investimentos
- `src/components/tables/WorkingCapitalTable.tsx` — Capital de Giro
- `src/components/tables/LoansTable.tsx` — Emprestimos CP/LP
- `src/components/tables/DRETable.tsx` — Demonstracao de Resultado (DRE)
- `src/components/tables/FCFFTable.tsx` — Fluxo de Caixa Livre (FCFF)
- `src/components/tables/BalanceSheetTable.tsx` — Balanco Patrimonial completo

**Tipos de linha (`RowType`):**

| Tipo | Background | Label | Valor |
|------|-----------|-------|-------|
| `header` | `bg-muted-alt border-t-2` | `font-bold text-sm` | `font-bold text-sm` |
| `value` | `bg-card` (padrao) | `text-muted-foreground` | `text-muted-foreground` |
| `subtotal` | `bg-muted-alt` | `font-semibold` | `font-semibold` |
| `total` | `bg-muted-alt` | `font-bold` | `font-bold` |
| `premise` | `bg-premise-bg` | `text-xs text-muted-foreground pl-4` | `text-xs text-muted-foreground` |
| `annotation` | `bg-annotation-bg` | `text-xs text-muted-foreground pl-4 italic` | `text-xs text-muted-foreground italic` |

**Tokens de background customizados:**

| Token | Classe Tailwind | Light | Dark | Uso |
|-------|----------------|-------|------|-----|
| `--muted-alt` | `bg-muted-alt` | igual `--muted` | `oklch(0.23 0 0)` | header / subtotal / total |
| `--premise-bg` | `bg-premise-bg` | `oklch(0.97 0.01 250)` | `oklch(0.224 0.0449 254.9)` | premissas editaveis |
| `--annotation-bg` | `bg-annotation-bg` | `oklch(0.97 0.02 75)` | `oklch(0.22 0.007 47)` | indicadores e notas |

**Maps de estilo por tipo:**

```tsx
const ROW_BG: Record<RowType, string> = {
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
};
```

**Padroes obrigatorios:**

1. **Container** — `rounded-md border bg-card overflow-x-auto`
2. **Coluna de label sticky** — primeiro `TableHead` e cada primeiro `TableCell` com `sticky left-0 z-10` + bg correspondente ao tipo
3. **Hover por grupo** — `TableRow` com `className="group"`, celulas com `group-hover:bg-muted-alt`
4. **Valores numericos** — `text-right tabular-nums`; negativos → `text-red-600`
5. **Cabecalho de coluna** — anos formatados como `"Ano Base"` (year === 0) ou `"Ano N"` (year > 0)

**Premissas colapsaveis:**

Linhas `premise` ficam ocultas por padrao. Visibilidade controlada via:
- Botao global "Exibir premissas" (`Eye`/`EyeOff`) — `showAllPremises` state
- Chevron na linha pai (`hasChildPremise: true`) — expande individualmente por `parentKey`

```tsx
const visibleRows = rows.filter((row) => {
  if (row.type !== "premise") return true;
  if (showAllPremises) return true;
  return expanded.has(row.parentKey);
});
```

**Barra de controles (toolbar):**

Posicionada acima da tabela (`flex items-center justify-between`):
- Legenda `"Valores em R$ (Reais)"` — `text-xs text-muted-foreground italic`
- `Switch` **Decimais** — alterna entre `fractionDigits: 0` e `fractionDigits: 2`
- `Button` **Exibir/Ocultar premissas** — visivel apenas se `hasPremises`

**Indicador de auto-save:**

Tabelas com premissas editaveis exibem indicador acima da toolbar:
- `Loader2 animate-spin` durante o salvamento
- `Check text-green-600` com timestamp ao concluir

#### Sidebar Colapsavel (AppSidebar)

Sistema de navegacao lateral colapsavel baseado no componente `Sidebar` do shadcn/ui, configurado com `collapsible="icon"`.

**Arquivos principais:**
- `src/components/app-sidebar.tsx` — Composicao principal da sidebar
- `src/components/nav-main.tsx` — Navegacao geral do dashboard
- `src/components/model-sidebar-nav.tsx` — Navegacao contextual de modelo
- `src/components/nav-user.tsx` — Menu do usuario (footer)
- `src/components/team-switcher.tsx` — Seletor de workspace (header)
- `src/components/ui/sidebar.tsx` — Primitivos base do shadcn/ui

**Constantes de largura:**

| Constante | Valor | Contexto |
|-----------|-------|----------|
| `SIDEBAR_WIDTH` | `16rem` | Largura expandida (desktop) |
| `SIDEBAR_WIDTH_ICON` | `2rem` | Largura colapsada (icon-only) |
| `SIDEBAR_WIDTH_MOBILE` | `18rem` | Largura no drawer mobile |

**Estado e data attributes:**

| Atributo | Valor expandido | Valor colapsado |
|----------|-----------------|-----------------|
| `data-state` | `"expanded"` | `"collapsed"` |
| `data-collapsible` | `""` (vazio) | `"icon"` |
| `data-variant` | `"sidebar"` | `"sidebar"` |
| `data-side` | `"left"` | `"left"` |

**Comportamento dos elementos ao colapsar** (`group-data-[collapsible=icon]:`):

| Elemento | Comportamento |
|----------|---------------|
| `SidebarGroupLabel` | `-mt-8 opacity-0 w-0 overflow-hidden px-0` — some da visao sem layout shift |
| `SidebarGroupAction` | `hidden` |
| `SidebarMenuAction` / `SidebarMenuBadge` | `hidden` |
| `SidebarMenuSub` | `hidden` |
| `SidebarMenuSubButton` | `hidden` |
| `SidebarMenuButton` (size `lg`) | `!p-0` — remove padding para icon-only |
| `SidebarContent` | `overflow-hidden` — previne scroll em modo icon |

**Tooltips no modo colapsado:**
Quando colapsada, `SidebarMenuButton` exibe tooltip com o titulo do item. O prop `tooltip` e obrigatorio para acessibilidade em modo icon-only:
```tsx
<SidebarMenuButton tooltip={item.title}>
  <item.icon />
  <span>{item.title}</span>
</SidebarMenuButton>
```

**Persistencia e atalho de teclado:**
- Estado persistido em cookie: `"sidebar_state"` (TTL: 7 dias)
- Atalho: `Ctrl+B` / `Cmd+B` (constante `SIDEBAR_KEYBOARD_SHORTCUT = "b"`)
- `SidebarRail` — area clicavel na borda da sidebar para toggle por arraste/click

**Layout com SidebarInset:**
```tsx
// dashboard/layout.tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset className="
    peer-data-[state=collapsed]:pl-0
    md:pl-49
    md:peer-data-[state=collapsed]:pl-12
    transition-[padding] duration-200 ease-linear
  ">
    {children}
  </SidebarInset>
</SidebarProvider>
```
- `md:pl-49` — padding quando expandida
- `md:peer-data-[state=collapsed]:pl-12` — padding reduzido quando colapsada
- Transicao suave de `200ms` via `transition-[padding]`

**Navegacao contextual (AppSidebar):**
```tsx
// Detecta contexto via URL e renderiza nav adequada
const modelIdMatch = pathname?.match(/\/model\/([^\/]+)/);
const isModelView = !!modelId && modelId !== "new";

// → ModelSidebarNav: grupos "Geral" e "Valuation" (rotas do modelo)
// → NavMain: menu geral do dashboard
```

**Estrutura de grupos em `ModelSidebarNav`:**
- **Geral**: Dashboard (`/dashboard`)
- **Valuation**: Ano Base, Premissas, DRE, Balanco Patrimonial, Fluxo de Caixa Livre, Valuation

**Estrutura de grupos em `NavMain`:**
- **Menu** (label via `SidebarGroupLabel`): items com subitens opcionais (collapsible com `ChevronRight` animado)

**Tokens CSS da sidebar (ver secao Tokens de Sidebar acima):**
- `--sidebar` / `--sidebar-foreground` — fundo e texto
- `--sidebar-primary` / `--sidebar-primary-foreground` — cor primaria (logo no `TeamSwitcher`)
- `--sidebar-accent` / `--sidebar-accent-foreground` — hover/active states
- `--sidebar-border` — bordas e separadores

**Hook `useSidebar`:**
```typescript
const {
  state,          // "expanded" | "collapsed"
  isMobile,       // boolean
  toggleSidebar,  // () => void
  openMobile,     // boolean
  setOpenMobile,  // (open: boolean) => void
} = useSidebar()
```
Deve ser usado dentro de `SidebarProvider`. Usado por `NavUser` e `TeamSwitcher` para posicionar dropdowns (`side="bottom"` no mobile, `side="right"` no desktop).

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
      { name: "Tabelas Financeiras", href: "/styleguide/components/tabelas" },
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

1. **Paleta de Cores** — Tres sub-paletas com labels:
   - **Primary** — 9 swatches: Background, Foreground, Card, Primary, Secondary, Muted, Accent, Destructive, Border
   - **Alternativa (Red)** — 3 swatches: Alt, Secondary Alt, Muted Alt
   - **Amber (Golden Yellow)** — 3 swatches: Amber, Secondary Amber, Muted Amber
   - Escalas completas 50-900: Primary (Navy Blue), Alternativa (Red), Neutral (Grey), Amber (Golden Yellow)
2. **Cores Semanticas** — Success, Warning, Info, Destructive com alerts demo
3. **Cores de Graficos** — Chart 1-5
4. **Tipografia** — Headings H1-H4, body, muted, mono, formula WACC
5. **Border Radius** — Exemplos visuais de sm a full
6. **Sombras** — Exemplos de shadow-sm a shadow-xl
7. **Componentes** — Button (7 variantes), Badge (7 variantes), Card (3 exemplos), RadioGroup
8. **Design Summary** — Resumo do sistema visual incluindo `Primary color (light)` e `Primary color (dark)`

Inclui **toggle de dark mode** (`ThemeToggle` — integrado ao `next-themes`) para preview em tempo real.

### Pagina de Componente (`/styleguide/components/grafico-combinado`)

Showcase do componente `GraficoCombinado` com:
- 3 demos interativos (basico, com toggle, formatadores custom)
- Tabela de API com todas as 13 props documentadas
- Tabela de tokens de cor recomendados por contexto (com swatches ao vivo), agrupados por Balanco/DRE/FCFF
- Notas de acessibilidade (role="switch", WCAG 1.4.11)
- Snippets de codigo para cada padrao de uso

### Pagina de Componente (`/styleguide/components/tabelas`)

Showcase do sistema de Tabelas Financeiras com:
- Demo interativo com todos os 6 tipos de linha (`header`, `value`, `subtotal`, `total`, `premise`, `annotation`)
- Controles reais: toggle Decimais (`Switch`) e Exibir/Ocultar premissas (`Eye`/`EyeOff`)
- Chevron colapsavel por linha pai (clique em "(+) CAPEX" para expandir premissa)
- Tabela de tipos com background, classes de label e valor por tipo
- Tabela de tokens semanticos de background com swatches ao vivo (`bg-muted-alt`, `bg-premise-bg`, `bg-annotation-bg`)
- 4 cards de padroes: coluna sticky, tabular-nums, premissas colapsaveis, toggle de decimais
- Snippet estrutural completo da tabela
- Notas de acessibilidade (semantica HTML, teclado, WCAG 2.1 AA)

## Como Usar

### Usar Cores em Graficos

**Regra:** Todos os valores de cor em componentes de grafico — barras, linhas, areas, eixos, grids, tooltips e labels — **devem** usar `var(--token)`, referenciando tokens CSS definidos em `globals.css`. Valores literais de cor (hex, hsl, rgb, oklch inline) sao proibidos.

#### Mapeamento de tokens por contexto de grafico

**Balanco Patrimonial — Investimentos & Capital de Giro** (`InvestmentChart`, `WorkingCapitalChart`)

| Uso | Token |
|-----|-------|
| Barra principal (Imobilizado / Capital de Giro) | `var(--primary-800)` |
| Barra secundaria (Vendas / NCG) | `var(--primary-500)` |
| Linha indicadora (Vendas/Imob. · Vendas/CG) | `var(--neutral-400)` |

**Balanco Patrimonial — Emprestimos** (`LoansChart`)

| Uso | Token |
|-----|-------|
| Barra LP (emprestimos longo prazo) | `var(--alt-800)` |
| Barra CP (emprestimos curto prazo) | `var(--alt-500)` |
| Linha indicadora (Emprestimos/EBITDA) | `var(--neutral-400)` |

**DRE / FCFF** (`EBITDAChart`, `RevenueChart`, `FCFFChart`)

| Uso | Token |
|-----|-------|
| Area / Receita Liquida (serie primaria) | `var(--primary)` |
| EBITDA / Lucro Liquido / FCFF positivo | `var(--chart-2)` |
| FCFF negativo | `var(--destructive)` |

**Elementos estruturais (todos os graficos)**

| Uso | Token / Classe |
|-----|----------------|
| Texto de eixos (`tick.fill`) | `var(--foreground)` |
| Grade (`CartesianGrid`) | classe Tailwind `stroke-muted` |
| Fundo do tooltip | `var(--card)` — classe `bg-card` |
| Borda do tooltip | `var(--border)` |
| Labels sobre barras coloridas (`LabelList`) | `var(--primary-foreground)` |

#### Exemplo correto

```tsx
// Barras (Investimentos)
<Bar dataKey="imobilizado" fill="var(--primary-800)" />
<Bar dataKey="vendas"      fill="var(--primary-500)" />

// Linha indicadora neutra
<Line stroke="var(--neutral-400)" dot={false} />

// Area / Receita (DRE)
<Area fill="var(--primary)" stroke="var(--primary)" />
<Line stroke="var(--chart-2)" dot={{ fill: "var(--chart-2)" }} />

// Eixos
<XAxis tick={{ fill: "var(--foreground)" }} />
<YAxis tick={{ fill: "var(--foreground)" }} />

// Grid
<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

// Label sobre barra colorida
<LabelList style={{ fill: "var(--primary-foreground)", fontSize: 13 }} />

// Tooltip
<div className="rounded-lg border bg-card p-3 shadow-md">...</div>
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
<Badge className="bg-amber text-amber-foreground">Amber</Badge>
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

### Distribuicao Uniforme de Escalas em Dark Mode

- Steps 50-900 mantêm **ordem crescente** em dark mode (50 = mais claro, 900 = mais escuro), igual ao light mode
- Cada escala e ancorada no step 800 com ΔL uniforme entre os demais steps, garantindo diferenciacao perceptual em toda a faixa
- Simplifica o uso: `primary-50` e sempre "o tom mais sutil", independente do tema ativo

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
