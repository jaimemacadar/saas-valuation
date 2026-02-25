'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Scale,
  Home,
  Database,
  Activity,
  LucideIcon,
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface ModelSidebarNavProps {
  modelId: string;
}

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export function ModelSidebarNav({ modelId }: ModelSidebarNavProps) {
  const pathname = usePathname();

  const generalNavigation: NavItem[] = [
    {
      title: 'Dashboard',
      icon: Home,
      url: '/dashboard',
    },
  ];

  const modelNavigation: NavItem[] = [
    {
      title: 'Ano Base',
      icon: Database,
      url: `/model/${modelId}/input/base`,
    },
    {
      title: 'Premissas',
      icon: Activity,
      url: `/model/${modelId}/input/projections`,
    },
    {
      title: 'Projeções Financeiras',
      icon: Scale,
      url: `/model/${modelId}/view/balance-sheet`,
    },
    {
      title: 'Valuation',
      icon: BarChart3,
      url: `/model/${modelId}/view/valuation`,
    },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Geral</SidebarGroupLabel>
        <SidebarMenu className="gap-2">
          {generalNavigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Valuation</SidebarGroupLabel>
        <SidebarMenu className="gap-2">
          {modelNavigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
