import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navigation/Navbar";
import { Sidebar } from "./components/navigation/Sidebar";
import { QueryProvider } from "@/lib/providers/query-provider";
import { DisplaySettingsProvider } from "./contexts/DisplaySettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prediops - Sports Predictions & Analytics",
  description: "AI-powered sports predictions and value betting opportunities across 111+ leagues worldwide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <QueryProvider>
          <DisplaySettingsProvider>
            <div className="flex h-screen">
              {/* Desktop Sidebar */}
              <div className="hidden md:block">
                <Sidebar />
              </div>
              
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          </DisplaySettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
