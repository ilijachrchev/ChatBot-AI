import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/provider/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'SendWise AI — Deploy a Smarter Chatbot',
    template: '%s | SendWise AI',
  },
  description:
    'SendWise AI lets you deploy a customizable AI chatbot ' +
    'on your website in minutes. Handle customer support, ' +
    'bookings, and sales automatically.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://sendwiseai.com'
  ),
  openGraph: {
    title: 'SendWise AI',
    description: 'Deploy a smarter chatbot for your business.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SendWise AI',
    description: 'Deploy a smarter chatbot for your business.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        >
          {children}
        <Toaster position="bottom-right"
          richColors
          expand={false}
          closeButton/>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
