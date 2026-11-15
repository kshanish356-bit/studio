
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Studio | Travel Booking',
  description: 'Plan and book flights, hotels, trains, tours, and more with Studio.',
  keywords: 'travel, flights, hotels, trains, booking, vacation, deals',
  openGraph: {
    title: 'Studio | Travel Booking',
    description: 'Plan and book flights, hotels, trains, tours, and more with Studio.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio | Travel Booking',
    description: 'Plan and book flights, hotels, trains, tours, and more with Studio.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Removed Mapbox GL CSS link */}
      </head>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow">{children}</main>
            <AppFooter />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
