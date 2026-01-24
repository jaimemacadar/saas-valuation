// src/components/layout/MainContent.tsx
import React from "react";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  return <main className="flex-1 overflow-auto p-6">{children}</main>;
}
