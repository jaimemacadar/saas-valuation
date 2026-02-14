import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '../app-sidebar';

// Mock dos módulos Next.js
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock dos componentes filhos
jest.mock('@/components/nav-main', () => ({
  NavMain: ({ items }: any) => <div data-testid="nav-main">{items.length} items</div>,
}));

jest.mock('@/components/nav-user', () => ({
  NavUser: ({ user }: any) => <div data-testid="nav-user">{user.name}</div>,
}));

jest.mock('@/components/team-switcher', () => ({
  TeamSwitcher: ({ teams }: any) => <div data-testid="team-switcher">{teams[0].name}</div>,
}));

jest.mock('@/components/model-sidebar-nav', () => ({
  ModelSidebarNav: ({ modelId }: any) => <div data-testid="model-sidebar-nav">Model: {modelId}</div>,
}));

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, ...props }: any) => <div data-testid="sidebar" {...props}>{children}</div>,
  SidebarContent: ({ children }: any) => <div data-testid="sidebar-content">{children}</div>,
  SidebarFooter: ({ children }: any) => <div data-testid="sidebar-footer">{children}</div>,
  SidebarHeader: ({ children }: any) => <div data-testid="sidebar-header">{children}</div>,
  SidebarRail: () => <div data-testid="sidebar-rail" />,
}));

describe('AppSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a estrutura básica da sidebar', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<AppSidebar />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-rail')).toBeInTheDocument();
  });

  it('deve renderizar TeamSwitcher no header', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<AppSidebar />);

    expect(screen.getByTestId('team-switcher')).toBeInTheDocument();
    expect(screen.getByText('SaaS Valuation')).toBeInTheDocument();
  });

  it('deve renderizar NavUser no footer', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<AppSidebar />);

    expect(screen.getByTestId('nav-user')).toBeInTheDocument();
    expect(screen.getByText('shadcn')).toBeInTheDocument();
  });

  it('deve renderizar navegação padrão quando não está em página de modelo', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<AppSidebar />);

    expect(screen.getByTestId('nav-main')).toBeInTheDocument();
    expect(screen.queryByTestId('model-sidebar-nav')).not.toBeInTheDocument();
  });

  it('deve renderizar ModelSidebarNav quando está em página de modelo válida', () => {
    (usePathname as jest.Mock).mockReturnValue('/model/abc123/view/dre');

    render(<AppSidebar />);

    expect(screen.getByTestId('model-sidebar-nav')).toBeInTheDocument();
    expect(screen.getByText('Model: abc123')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-main')).not.toBeInTheDocument();
  });

  it('não deve renderizar ModelSidebarNav para rota /model/new', () => {
    (usePathname as jest.Mock).mockReturnValue('/model/new');

    render(<AppSidebar />);

    expect(screen.queryByTestId('model-sidebar-nav')).not.toBeInTheDocument();
    expect(screen.getByTestId('nav-main')).toBeInTheDocument();
  });

  it('deve detectar corretamente diferentes IDs de modelo', () => {
    const testCases = [
      { path: '/model/123/view', expectedId: '123' },
      { path: '/model/abc-def-456/input', expectedId: 'abc-def-456' },
      { path: '/model/xyz789/sensitivity', expectedId: 'xyz789' },
    ];

    testCases.forEach(({ path, expectedId }) => {
      (usePathname as jest.Mock).mockReturnValue(path);
      const { unmount } = render(<AppSidebar />);

      expect(screen.getByTestId('model-sidebar-nav')).toBeInTheDocument();
      expect(screen.getByText(`Model: ${expectedId}`)).toBeInTheDocument();

      unmount();
    });
  });

  it('deve lidar com pathname null', () => {
    (usePathname as jest.Mock).mockReturnValue(null);

    render(<AppSidebar />);

    expect(screen.getByTestId('nav-main')).toBeInTheDocument();
    expect(screen.queryByTestId('model-sidebar-nav')).not.toBeInTheDocument();
  });

  it('deve passar props corretamente para o componente Sidebar', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    const { container } = render(<AppSidebar className="custom-class" />);

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('collapsible', 'icon');
  });

  it('deve conter os dados de navegação corretos', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<AppSidebar />);

    // Verifica se NavMain recebe 3 itens (Valuation, Configuração, Exportação)
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });
});
