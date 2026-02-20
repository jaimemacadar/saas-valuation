"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigation } from "./navigation";

export default function StyleguideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Fixed */}
      <aside className="w-64 border-r bg-card p-6 flex flex-col gap-6 fixed top-0 left-0 h-screen overflow-y-auto">
        <div>
          <Link
            href="/styleguide"
            className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Design System
          </Link>
          <p className="text-xs text-muted-foreground mt-1">SaaS Valuation</p>
        </div>

        <nav className="flex flex-col gap-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                {section.items.length === 0 && (
                  <li className="px-3 py-2 text-sm text-muted-foreground italic">
                    Em breve...
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content - offset by sidebar width */}
      <main className="flex-1 ml-64 overflow-auto">{children}</main>
    </div>
  );
}
