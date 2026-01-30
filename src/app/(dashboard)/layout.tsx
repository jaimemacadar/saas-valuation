import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="peer-data-[state=collapsed]:pl-0 md:pl-47 md:peer-data-[state=collapsed]:pl-20 transition-[padding] duration-200 ease-linear">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
