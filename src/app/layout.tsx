
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// Removed GeistMono import as it was causing a "Module not found" error.
// If GeistMono is needed, ensure the 'geist' package is installed correctly
// and its variable (GeistMono.variable) is added to the <html> tag's className.
// Also, tailwind.config.ts fontFamily.mono would need to be updated to 'var(--font-geist-mono)'.
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// GeistSans is an object, not a function. The following line was causing the error:
// const geistSans = GeistSans({ variable: '--font-sans', subsets: ['latin'] });
// We will use GeistSans.variable directly.

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
    // Apply the CSS variable name from GeistSans (e.g., '--font-geist-sans') to the <html> tag.
    // This makes the CSS variable --font-geist-sans available.
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      {/*
        The 'font-sans' class from Tailwind will now correctly apply the Geist Sans font,
        as tailwind.config.ts will be updated to define `fontFamily.sans` as 'var(--font-geist-sans)'.
        The `antialiased` class improves font rendering.
      */}
      <body className="font-sans antialiased">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
