import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/components/AuthProvider";
import QueryProvider from "@/components/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Givelight — A transparent giving experiment",
  description: "A personal public experiment in small contributions, transparent totals, and manual verification. Contributions are not currently being accepted.",
  applicationName: "Givelight",
  openGraph: {
    title: "Givelight — A transparent giving experiment",
    description: "Small contributions, transparent totals, and manual verification. Contributions are not currently being accepted.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fffdf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}