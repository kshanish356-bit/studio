
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
  title: 'TravelEase Simplified - Your Journey Begins Here',
  description: 'Book flights, hotels, trains, and more with TravelEase. Your journey begins here!',
  keywords: 'travel, flights, hotels, trains, booking, vacation, deals',
  openGraph: {
    title: 'TravelEase Simplified - Your Journey Begins Here',
    description: 'Book flights, hotels, trains, and more with TravelEase. Your journey begins here!',
    images: [
      {
        url: 'https://placehold.co/1200x630.png?text=TravelEase', // Placeholder for social image
        width: 1200,
        height: 630,
        alt: 'TravelEase Social Image',
      },
    ],
    type: 'website',
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
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.css" rel="stylesheet" />
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

    