import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { ModelSidebarNav } from '../model-sidebar-nav';

// Mock do Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock do componente Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock dos componentes UI
jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: any) => <div data-testid="sidebar-group">{children}</div>,
  SidebarGroupLabel: ({ children, asChild }: any) =>
    asChild ? children : <div data-testid="sidebar-group-label">{children}</div>,
  SidebarMenu: ({ children }: any) => <ul data-testid="sidebar-menu">{children}</ul>,
  SidebarMenuButton: ({ children, asChild, isActive }: any) => {
    const content = asChild ? children : <button data-active={isActive}>{children}</button>;
    return <div data-testid="sidebar-menu-button">{content}</div>;
  },
  SidebarMenuItem: ({ children }: any) => <li data-testid="sidebar-menu-item">{children}</li>,
  SidebarMenuSub: ({ children }: any) => <ul data-testid="sidebar-menu-sub">{children}</ul>,
  SidebarMenuSubButton: ({ children, asChild, isActive }: any) => {
    const content = asChild ? children : <button data-active={isActive}>{children}</button>;
    return <div data-testid="sidebar-menu-sub-button">{content}</div>;
  },
  SidebarMenuSubItem: ({ children }: any) => <li data-testid="sidebar-menu-sub-item">{children}</li>,
}));

jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, defaultOpen }: any) => (
    <div data-testid="collapsible" data-default-open={defaultOpen}>
      {children}
    </div>
  ),
  CollapsibleContent: ({ children }: any) => <div data-testid="collapsible-content">{children}</div>,
  CollapsibleTrigger: ({ children }: any) => <div data-testid="collapsible-trigger">{children}</div>,
}));

describe('ModelSidebarNav', () => {
  const modelId = 'test-model-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todas as seções principais', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getByText('Entrada de Dados')).toBeInTheDocument();
    expect(screen.getByText('Visualizações')).toBeInTheDocument();
    expect(screen.getAllByText('Análise de Sensibilidade').length).toBeGreaterThan(0);
  });

  it('deve renderizar link do Dashboard com href correto', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const dashboardLink = container.querySelector('a[href="/dashboard"]');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink?.textContent).toContain('Dashboard');
  });

  it('deve renderizar submenus de Entrada de Dados', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/input/base/dre`);

    render(<ModelSidebarNav modelId={modelId} />);

    expect(screen.getByText('Ano Base')).toBeInTheDocument();
    expect(screen.getByText('Premissas de Projeção')).toBeInTheDocument();
    expect(screen.getAllByText('DRE')).toHaveLength(2); // Um para cada seção
    expect(screen.getAllByText('Balanço Patrimonial')).toHaveLength(2);
  });

  it('deve gerar URLs corretas para entrada de dados do ano base', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/input/base/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const dreLink = container.querySelector(`a[href="/model/${modelId}/input/base/dre"]`);
    const balanceLink = container.querySelector(`a[href="/model/${modelId}/input/base/balance-sheet"]`);

    expect(dreLink).toBeInTheDocument();
    expect(balanceLink).toBeInTheDocument();
  });

  it('deve gerar URLs corretas para premissas de projeção', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/input/projections/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const projDreLink = container.querySelector(`a[href="/model/${modelId}/input/projections/dre"]`);
    const projBalanceLink = container.querySelector(`a[href="/model/${modelId}/input/projections/balance-sheet"]`);

    expect(projDreLink).toBeInTheDocument();
    expect(projBalanceLink).toBeInTheDocument();
  });

  it('deve renderizar todas as visualizações', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    render(<ModelSidebarNav modelId={modelId} />);

    expect(screen.getByText('DRE Projetado')).toBeInTheDocument();
    expect(screen.getByText('Balanço Projetado')).toBeInTheDocument();
    expect(screen.getByText('Fluxo de Caixa Livre')).toBeInTheDocument();
    expect(screen.getByText('Valuation')).toBeInTheDocument();
  });

  it('deve gerar URLs corretas para visualizações', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    expect(container.querySelector(`a[href="/model/${modelId}/view/dre"]`)).toBeInTheDocument();
    expect(container.querySelector(`a[href="/model/${modelId}/view/balance-sheet"]`)).toBeInTheDocument();
    expect(container.querySelector(`a[href="/model/${modelId}/view/fcff"]`)).toBeInTheDocument();
    expect(container.querySelector(`a[href="/model/${modelId}/view/valuation"]`)).toBeInTheDocument();
  });

  it('deve marcar seção Visualizações como ativa quando pathname inclui /view', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const viewsCollapsible = container.querySelectorAll('[data-testid="collapsible"]');
    const viewsSection = Array.from(viewsCollapsible).find((el) =>
      el.getAttribute('data-default-open') === 'true'
    );

    expect(viewsSection).toBeInTheDocument();
  });

  it('deve não marcar Visualizações como ativa em outras rotas', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/input/base/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const viewsCollapsible = container.querySelectorAll('[data-testid="collapsible"]');
    // A seção de Visualizações não deve estar aberta por padrão
    const closedSections = Array.from(viewsCollapsible).filter((el) =>
      el.getAttribute('data-default-open') !== 'true'
    );

    expect(closedSections.length).toBeGreaterThan(0);
  });

  it('deve renderizar link para análise de sensibilidade', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/sensitivity`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const sensitivityLink = container.querySelector(`a[href="/model/${modelId}/sensitivity"]`);
    expect(sensitivityLink).toBeInTheDocument();
    expect(sensitivityLink?.textContent).toContain('Análise de Sensibilidade');
  });

  it('deve usar modelId diferente corretamente', () => {
    const differentModelId = 'another-model-456';
    (usePathname as jest.Mock).mockReturnValue(`/model/${differentModelId}/view/valuation`);

    const { container } = render(<ModelSidebarNav modelId={differentModelId} />);

    const valuationLink = container.querySelector(`a[href="/model/${differentModelId}/view/valuation"]`);
    expect(valuationLink).toBeInTheDocument();
  });

  it('deve lidar com pathname null graciosamente', () => {
    (usePathname as jest.Mock).mockReturnValue(null);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    // Deve ainda renderizar a navegação, apenas sem marcar nada como ativo
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getByText('Visualizações')).toBeInTheDocument();
  });

  it('deve renderizar grupos sidebar corretos', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    render(<ModelSidebarNav modelId={modelId} />);

    const groups = screen.getAllByTestId('sidebar-group');
    // Deve haver 4 grupos principais: Dashboard, Entrada de Dados, Visualizações, Análise
    expect(groups.length).toBe(4);
  });
});
