
import type { Metadata } from 'next';
// Removed GeistSans import as it was causing a build error.
// import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Systematic Designer',
  description: 'Generate system design problems and solutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed GeistSans.variable from className.
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
