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
  SidebarMenu: ({ children }: any) => <ul data-testid="sidebar-menu">{children}</ul>,
  SidebarMenuButton: ({ children, asChild, isActive }: any) => {
    const content = asChild ? children : <button data-active={isActive}>{children}</button>;
    return <div data-testid="sidebar-menu-button">{content}</div>;
  },
  SidebarMenuItem: ({ children }: any) => <li data-testid="sidebar-menu-item">{children}</li>,
}));

describe('ModelSidebarNav', () => {
  const modelId = 'test-model-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todos os itens de navegação', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    render(<ModelSidebarNav modelId={modelId} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Premissas do Valuation')).toBeInTheDocument();
    expect(screen.getByText('DRE Projetado')).toBeInTheDocument();
    expect(screen.getByText('Balanço Projetado')).toBeInTheDocument();
    expect(screen.getByText('Fluxo de Caixa Livre')).toBeInTheDocument();
    expect(screen.getByText('Valuation')).toBeInTheDocument();
    expect(screen.getByText('Análise de Sensibilidade')).toBeInTheDocument();
  });

  it('deve renderizar link do Dashboard com href correto', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const dashboardLink = container.querySelector('a[href="/dashboard"]');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink?.textContent).toContain('Dashboard');
  });

  it('deve gerar URL correta para Premissas do Valuation', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/input/base`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    const baseLink = container.querySelector(`a[href="/model/${modelId}/input/base"]`);
    expect(baseLink).toBeInTheDocument();
    expect(baseLink?.textContent).toContain('Premissas do Valuation');
  });

  it('deve gerar URLs corretas para todas as visualizações', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    const { container } = render(<ModelSidebarNav modelId={modelId} />);

    expect(container.querySelector(`a[href="/model/${modelId}/view/dre"]`)).toBeInTheDocument();
    expect(container.querySelector(`a[href="/model/${modelId}/view/balance-sheet"]`)).toBeInTheDocument();
    expect(container.querySelector(`a[href="/model/${modelId}/view/fcff"]`)).toBeInTheDocument();
    expect(container.querySelector(`a[href="/model/${modelId}/view/valuation"]`)).toBeInTheDocument();
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

    render(<ModelSidebarNav modelId={modelId} />);

    // Deve ainda renderizar a navegação, apenas sem marcar nada como ativo
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('DRE Projetado')).toBeInTheDocument();
    expect(screen.getByText('Valuation')).toBeInTheDocument();
  });

  it('deve renderizar exatamente 7 itens de menu', () => {
    (usePathname as jest.Mock).mockReturnValue(`/model/${modelId}/view/dre`);

    render(<ModelSidebarNav modelId={modelId} />);

    const menuItems = screen.getAllByTestId('sidebar-menu-item');
    // Deve haver exatamente 7 itens de menu
    expect(menuItems.length).toBe(7);
  });
});
