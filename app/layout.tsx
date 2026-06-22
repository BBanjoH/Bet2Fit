import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'BetFit - Bet on Yourself',
  description: 'Place real-money bets on your weight loss goals. Verify with photos and win when you hit your target.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'BetFit' },
  icons: { apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://checkout.flutterwave.com/v3.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
