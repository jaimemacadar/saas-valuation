"use client";

import React from "react";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Navegação</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </Button>
        </div>
        <nav className="flex flex-col gap-2">
          {/* Navigation items will be added here */}
        </nav>
      </div>
    </aside>
  );
}
