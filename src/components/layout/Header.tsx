// src/components/layout/Header.tsx
import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">SaaS Valuation</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <UserMenu
              userName={user.user_metadata?.name}
              userEmail={user.email}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
