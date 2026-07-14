import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALE_META } from '@/lib/i18n';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: site.name,
  // Pre-launch: keep the whole site out of every index. Removed only when
  // site.indexable flips at the deliberate public launch. See config/site.ts.
  robots: site.indexable ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LOCALE_META[DEFAULT_LOCALE].htmlLang}>
      <body>{children}</body>
    </html>
  );
}
