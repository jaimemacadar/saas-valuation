"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileDown,
  LayoutDashboard,
  Plus,
  Settings2,
  GalleryVerticalEnd,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { ModelSidebarNav } from "@/components/model-sidebar-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

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
      title: "Valuation",
      url: "#",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Meus Modelos",
          url: "/dashboard/models",
        },
      ],
    },
    {
      title: "Configuração",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Premissas Padrão",
          url: "#",
          isDisabled: true,
        },
        {
          title: "Perfil",
          url: "#",
          isDisabled: true,
        },
      ],
    },
    {
      title: "Exportação",
      url: "#",
      icon: FileDown,
      items: [
        {
          title: "Exportar PDF",
          url: "#",
          isDisabled: true,
        },
        {
          title: "Exportar Excel",
          url: "#",
          isDisabled: true,
        },
      ],
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Detecta se está em uma página de modelo
  const modelIdMatch = pathname?.match(/\/model\/([^\/]+)/)
  const modelId = modelIdMatch?.[1]
  const isModelView = mounted && !!modelId && modelId !== "new"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {!mounted ? (
          // Skeleton durante SSR/hidratação
          <div className="space-y-2 p-2">
            <div className="h-10 w-full animate-pulse rounded-md bg-sidebar-accent" />
            <div className="h-10 w-full animate-pulse rounded-md bg-sidebar-accent" />
            <div className="h-10 w-full animate-pulse rounded-md bg-sidebar-accent" />
          </div>
        ) : isModelView ? (
          <ModelSidebarNav modelId={modelId} />
        ) : (
          <>
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
