import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import OfflineDetector from "@/components/OfflineDetector";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const APP_NAME = "همة";
const APP_DEFAULT_TITLE = "همة | Hemma";
const APP_TITLE_TEMPLATE = `%s | ${APP_NAME}`;
const APP_DESCRIPTION =
  "تطبيق همة لمتابعة العبادات والأذكار — Hemma Habit Tracker";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.png",
    shortcut: "/app-icon.png",
    apple: "/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  keywords: ["Hemma", "Ramadan", "Habit Tracker", "Muslim", "Islam", "Worship", "Adkhar", "همة", "رمضان", "عبادات"],
  authors: [{ name: "Hemma Team" }],
  creator: "Hemma Team",
  publisher: "Hemma Team",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoArabic.variable} antialiased`}>
        <AuthProvider>
          {process.env.NEXT_PUBLIC_GA_ID && (
            <Suspense fallback={null}>
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            </Suspense>
          )}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const theme = localStorage.getItem('hemma-theme');
                  if (theme === '"dark"' || theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (_) {}
              `,
            }}
          />
          <SplashScreen>{children}</SplashScreen>
          <PwaInstallBanner />
          <OfflineDetector />
        </AuthProvider>
      </body>
    </html>
  );
}
