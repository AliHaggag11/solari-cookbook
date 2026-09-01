import type { Metadata } from "next";
import { DM_Serif_Display, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const serif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const sans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Nightshift — Clerk for software with no API",
  description:
    "Unattended portal automation powered by Solari browsers, sandboxes, and desktops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
