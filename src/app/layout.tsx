import type { Metadata } from "next";
import { Bebas_Neue, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { StoreHydrator } from "@/components/StoreHydrator";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
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
        className={`${display.variable} ${body.variable} antialiased flex min-h-dvh flex-col`}
      >
        <StoreHydrator>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </StoreHydrator>
      </body>
    </html>
  );
}
