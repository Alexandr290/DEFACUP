import type { Metadata } from "next";
import { Bebas_Neue, Oswald, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { StoreHydrator } from "@/components/StoreHydrator";
import { LanguageProvider } from "@/lib/i18n/context";
import "./globals.css";

const displayBrand = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-brand",
});

const display = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "DEFACUP — Football Championship Tables",
  description:
    "Build advanced World Cup–style group tables and knockout brackets. Live standings, draws, what-if mode, and shareable tournaments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayBrand.variable} ${display.variable} ${body.variable} antialiased flex min-h-dvh flex-col`}
      >
        <LanguageProvider>
          <StoreHydrator>
            <SiteNav />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </StoreHydrator>
        </LanguageProvider>
      </body>
    </html>
  );
}
