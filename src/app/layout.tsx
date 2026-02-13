import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DevModeIndicator } from "@/components/dev/DevModeIndicator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SaaS Valuation - Avaliação de Empresas",
  description:
    "Plataforma de valuation de empresas usando método de Fluxo de Caixa Descontado (FCD)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <DevModeIndicator />
      </body>
    </html>
  );
}
