import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConciliaPyme",
  description: "Conciliación de cartolas bancarias y facturas para pymes chilenas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-[var(--surface)] focus:px-3 focus:py-2"
        >
          Saltar al contenido
        </a>
        <AppShell>
          <main id="contenido" className="flex-1">
            {children}
          </main>
        </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
