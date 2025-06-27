import { Inter } from 'next/font/google';
import '../styles/globals.css';
import '../styles/layout.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://school-fee-platform.vercel.app'),
  title: 'SchoolFee Platform',
  description:
    'SchoolFee Platform is a comprehensive school fee management system with mobile money payments. Streamline fee collection with MTN Mobile Money and Orange Money integration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={'min-h-full dark'}>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}