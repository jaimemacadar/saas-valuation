import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { isMockMode, getMockUser } from "@/lib/mock";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  // Mock mode: usa usuário mock
  if (isMockMode()) {
    const mockUser = await getMockUser();
    user = mockUser ? { id: mockUser.id, email: mockUser.email } : null;
  } else {
    // Produção: verifica auth real
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="peer-data-[state=collapsed]:pl-0 md:pl-47 md:peer-data-[state=collapsed]:pl-12 transition-[padding] duration-200 ease-linear">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
