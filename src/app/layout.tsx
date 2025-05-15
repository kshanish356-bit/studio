
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
  title: 'My Apps - Your Journey Begins Here',
  description: 'Book flights, hotels, trains, and more with My Apps. Your journey begins here!',
  keywords: 'travel, flights, hotels, trains, booking, vacation, deals',
  openGraph: {
    title: 'My Apps - Your Journey Begins Here',
    description: 'Book flights, hotels, trains, and more with My Apps. Your journey begins here!',
    images: [
      {
        url: 'https://placehold.co/1200x630.png', 
        width: 1200,
        height: 630,
        alt: 'My Apps Social Image',
      },
    ],
    type: 'website',
  },
  twitter: { 
    card: 'summary_large_image',
    title: 'My Apps - Your Journey Begins Here',
    description: 'Book flights, hotels, trains, and more with My Apps. Your journey begins here!',
    images: ['https://placehold.co/1200x630.png'], 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
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
