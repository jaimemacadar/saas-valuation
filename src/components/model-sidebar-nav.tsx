'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FileText,
  Scale,
  TrendingUp,
  ChevronRight,
  Home,
  Calculator,
  Eye,
  Activity,
  LucideIcon,
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ModelSidebarNavProps {
  modelId: string;
}

type NavItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  items?: NavItem[];
  isActive?: boolean;
};

export function ModelSidebarNav({ modelId }: ModelSidebarNavProps) {
  const pathname = usePathname();

  const navigation: NavItem[] = [
    {
      title: 'Dashboard',
      icon: Home,
      url: '/dashboard',
    },
    {
      title: 'Entrada de Dados',
      icon: Calculator,
      items: [
        {
          title: 'Ano Base',
          url: `/model/${modelId}/input/base`,
        },
        {
          title: 'Premissas de Projeção',
          url: `/model/${modelId}/input/projections`,
        },
      ],
    },
    {
      title: 'Visualizações',
      icon: Eye,
      isActive: pathname?.includes('/view'),
      items: [
        {
          title: 'DRE Projetado',
          url: `/model/${modelId}/view/dre`,
          icon: FileText,
        },
        {
          title: 'Balanço Projetado',
          url: `/model/${modelId}/view/balance-sheet`,
          icon: Scale,
        },
        {
          title: 'Fluxo de Caixa Livre',
          url: `/model/${modelId}/view/fcff`,
          icon: TrendingUp,
        },
        {
          title: 'Valuation',
          url: `/model/${modelId}/view/valuation`,
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Análise de Sensibilidade',
      icon: Activity,
      url: `/model/${modelId}/sensitivity`,
    },
  ];

  return (
    <>
      {navigation.map((section) => (
        <SidebarGroup key={section.title}>
          {section.items ? (
            <Collapsible defaultOpen={section.isActive} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    {section.icon && <section.icon className="h-4 w-4" />}
                    <span>{section.title}</span>
                  </div>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.items ? (
                        <Collapsible className="group/nested">
                          <SidebarMenuButton asChild>
                            <CollapsibleTrigger className="w-full">
                              {item.title}
                              <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/nested:rotate-90" />
                            </CollapsibleTrigger>
                          </SidebarMenuButton>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === subItem.url}
                                  >
                                    <Link href={subItem.url || '#'}>{subItem.title}</Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : item.url ? (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      ) : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          ) : section.url ? (
            <>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === section.url}>
                    <Link href={section.url}>
                      {section.icon && <section.icon className="h-4 w-4" />}
                      <span>{section.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </>
          ) : null}
        </SidebarGroup>
      ))}
    </>
  );
}
