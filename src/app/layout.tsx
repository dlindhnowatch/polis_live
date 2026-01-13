import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swedish Police Events Map - Real-time Incident Tracker",
  description: "Interactive map showing the latest 500 police events in Sweden from Polisen.se. Track real-time incidents including traffic accidents, crimes, and emergencies across Sweden.",
  keywords: "Swedish police, crime map, police events, Sweden incidents, polisen.se, emergency tracker",
  authors: [{ name: "Police Events Map" }],
  robots: "index, follow",
  openGraph: {
    title: "Swedish Police Events Map",
    description: "Track real-time police events across Sweden",
    type: "website",
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swedish Police Events Map",
    description: "Track real-time police events across Sweden",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
