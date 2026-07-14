import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALE_META } from '@/lib/i18n';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: site.name,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LOCALE_META[DEFAULT_LOCALE].htmlLang}>
      <body>{children}</body>
    </html>
  );
}
