import type { Metadata } from 'next';
import { Montserrat, Manrope, Inter } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-brand',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'HospedaMaringá | Faturamento & Infraestrutura',
  description: 'Gerencie sua infraestrutura e faturamento de alto desempenho com a HospedaMaringá.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${manrope.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="bg-surface text-on-surface font-body min-h-screen">
        {children}
      </body>
    </html>
  );
}
