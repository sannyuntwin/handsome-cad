import type { Metadata } from "next";
import { Rajdhani, Space_Mono } from "next/font/google";
import "@/app/globals.css";

const displayFont = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display"
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Gear CAD",
  description: "Parametric browser-based CAD MVP for spur gear generation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}

