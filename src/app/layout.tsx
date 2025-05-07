
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// Removed GeistMono import as it was causing a "Module not found" error.
// If GeistMono is needed, ensure the 'geist' package is installed correctly.
// import { GeistMono } from 'geist/font/mono'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = GeistSans({
  variable: '--font-sans',
  subsets: ['latin'],
});

// If GeistMono is re-added, uncomment and configure this:
// const geistMono = GeistMono({
//   variable: '--font-mono',
//   subsets: ['latin'],
// });

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
    <html lang="en" suppressHydrationWarning>
      {/* Updated className to only include geistSans.variable. Add geistMono.variable if re-enabled. */}
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
