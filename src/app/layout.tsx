
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Free Animated Candlestick Generator | PricePattern Studio',
  description: 'Create 4K animated trading charts, forex patterns, and candlestick animations for YouTube, TikTok, and Instagram Reels easily. No After Effects needed.',
  keywords: 'candlestick animation, trading chart generator, forex video maker, animated stock chart, crypto content creation, day trading visuals',
  alternates: {
    canonical: 'https://pricepattern.vercel.app',
  },
  openGraph: {
    title: 'Free Animated Candlestick Generator | PricePattern Studio',
    description: 'Create professional 4K candlestick animations for your trading content.',
    type: 'website',
    url: 'https://pricepattern.vercel.app',
    siteName: 'PricePattern Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Animated Candlestick Generator | PricePattern Studio',
    description: 'Create professional 4K candlestick animations for your trading content.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased selection:bg-accent/30`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
