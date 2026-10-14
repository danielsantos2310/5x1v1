import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '5x1 | Court-Side',
  description: 'Volleyball club management, built for the court.',
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
