import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { DisplaySettingsProvider } from "./contexts/DisplaySettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarWrapper } from "./components/navigation/SidebarWrapper";
import { Footer } from "./components/layout/Footer";
// import { DatePickerProvider } from "./components/date-picker";

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
  icons: {
    icon: [
      { url: '/logo/favicon.ico', sizes: '32x32' },
      { url: '/logo/logo.svg', type: 'image/svg+xml' }
    ],
    apple: { url: '/logo/logo.svg', sizes: '180x180' },
  },
  manifest: '/logo/manifest.json',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-H36GDSZF8G"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('js', new Date());
                gtag('config', 'G-H36GDSZF8G');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <QueryProvider>
          <ThemeProvider>
            <DisplaySettingsProvider>
              <SidebarWrapper>
                {children}
                <Footer />
              </SidebarWrapper>
            </DisplaySettingsProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
