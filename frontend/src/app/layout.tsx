import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navigation from "./components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Kill My Startup Idea — The Brutal Pitch Destroyer",
  description: "The only tool that tries to kill your startup — so the market doesn't have to. Real feedback, no sugarcoating.",
  keywords: "startup, pitch deck, elevator pitch, venture capital, investor feedback, business validator, india startups",
  openGraph: {
    title: "Kill My Startup Idea — The Brutal Pitch Destroyer",
    description: "The only tool that tries to kill your startup — so the market doesn't have to.",
    images: [{ url: "/og-image.png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#08090C",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="font-sans antialiased text-gray-200 min-h-screen flex flex-col">
        <div className="noise-overlay" />
        
        {/* Navigation Header */}
        <Navigation />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-900 bg-cyber-dark/40 py-6 text-center text-xs text-gray-500 relative z-10">
          <p>© {new Date().getFullYear()} Kill My Startup Idea. All rights reserved.</p>
          <p className="mt-1 text-gray-600">
            Brutal AI-generated analysis. Treat as a stress test, not verified investment advice.
          </p>
        </footer>
      </body>
    </html>
  );
}
