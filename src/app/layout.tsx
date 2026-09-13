import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ElysiumPad — Gestor y Creador de Launchers de Minecraft",
  description: "Crea launchers personalizados para tu servidor de Minecraft. Sincronización automática de mods desde Modrinth, instalación de Java integrada y conexión directa para tus jugadores.",
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "admaven-placement": "BpdUHqdC5",
    "google-adsense-account": "ca-pub-7488531171409193",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}>
      <head>
        <meta name="admaven-placement" content="BpdUHqdC5" />
        <meta name="google-adsense-account" content="ca-pub-7488531171409193" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7488531171409193"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-[#0c1017] text-slate-200 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
