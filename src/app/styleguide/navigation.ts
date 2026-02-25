export interface NavItem {
  name: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Foundation",
    items: [{ name: "Design Tokens", href: "/styleguide" }],
  },
  {
    title: "Components",
    items: [
      { name: "Gráfico Combinado", href: "/styleguide/components/grafico-combinado" },
      { name: "Tabelas Financeiras", href: "/styleguide/components/tabelas" },
    ],
  },
];
