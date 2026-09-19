import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trimly — Short links, sharper insights",
  description:
    "Trimly is the fastest way to shorten links, customize slugs, set expiry dates and track every click",
  openGraph: {
    title: "Trimly — Short links, sharper insights",
    description:
      "Trimly is the fastest way to shorten links, customize slugs, set expiry dates and track every click",
    url: "https://app.trimly.mustafasayyed.dev",
    siteName: "Trimly",
    images: [
      {
        url: "https://app.trimly.mustafasayyed.dev/trimly.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trimly — Short links, sharper insights",
    description:
      "Trimly is the fastest way to shorten links, customize slugs, set expiry dates and track every click",
    images: ["https://app.trimly.mustafasayyed.dev/trimly.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
