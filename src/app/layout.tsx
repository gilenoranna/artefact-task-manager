import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerenciador de Tarefas",
  description: "Aplicação simples para gerenciar tarefas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <TRPCReactProvider>
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-2xl px-4 py-4">
              <Link
                href="/"
                className="rounded text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Gerenciador de Tarefas
              </Link>
            </div>
          </header>
          <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
          {/* Mounted once here so any client component can call toast(). */}
          <Toaster richColors containerAriaLabel="Notificações" />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
