"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileDown,
  LayoutDashboard,
  Plus,
  Settings2,
  GalleryVerticalEnd,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { ModelSidebarNav } from "@/components/model-sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Dados da aplicação
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "SaaS Valuation",
      logo: GalleryVerticalEnd,
      plan: "Professional",
    },
  ],
  navMain: [
    {
      title: "Valuations",
      url: "/dashboard/models",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Configuração",
      url: "/settings",
      icon: Settings2,
    },
    {
      title: "Exportação",
      url: "/export",
      icon: FileDown,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Detecta se está em uma página de modelo
  const modelIdMatch = pathname?.match(/\/model\/([^\/]+)/);
  const modelId = modelIdMatch?.[1];
  const isModelView = !!modelId && modelId !== "new";

  return (
    <Sidebar collapsible="icon" {...props}>      
      <SidebarHeader className="mb-4">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {isModelView ? (
          <ModelSidebarNav modelId={modelId} />
        ) : (
          <NavMain items={data.navMain} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
