import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Givelight — Your giving lights the world",
  description: "Small gifts. Real-world light. Support verified community causes with a simple, guest-first donation.",
  applicationName: "Givelight",
  openGraph: {
    title: "Givelight — Your giving lights the world",
    description: "Every small gift can brighten a life.",
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
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}