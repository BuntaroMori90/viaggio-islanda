import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlorinGo Travel App',
  description: 'Il viaggio progettato da FlorinGo, sempre con te.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
